const { v4: uuidv4 } = require("uuid");
const OpenAI = require("openai");
const PDFDocument = require("pdfkit");
const admin = require("firebase-admin");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const db = admin.firestore();
// Ignore stray undefineds defensively (we still sanitize payloads).
if (db.settings) db.settings({ ignoreUndefinedProperties: true });
const bucket = admin.storage().bucket();

/* -------------------- Helpers -------------------- */
async function getLatestDoc(patientId, subcollection) {
  const snap = await db
    .collection(`patients/${patientId}/${subcollection}`)
    .orderBy("timestamp", "desc")
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0].data();
}

function sanitizeForFirestore(data) {
  if (data === undefined) return undefined;
  if (data === null) return null;
  if (Array.isArray(data)) return data.map(sanitizeForFirestore).filter(v => v !== undefined);
  if (typeof data === "object") {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      const sv = sanitizeForFirestore(v);
      if (sv !== undefined) out[k] = sv;
    }
    return out;
  }
  return data;
}

function toIsoDate(value) {
  if (!value) return null;
  try {
    if (typeof value.toDate === "function") return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return null;
}

function trVal(v, fallback = "Yok") {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "number" && Number.isNaN(v)) return fallback;
  return String(v);
}

function nowTr() {
  try {
    return new Date().toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date().toISOString();
  }
}

/* ---------- Simple PDF layout helpers (clean & elegant) ---------- */
function hr(doc, color = "#E6E6E6", gap = 0.5) {
  doc
    .moveDown(gap)
    .strokeColor(color)
    .lineWidth(1)
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke()
    .moveDown(gap);
}

function header(doc, { title, subtitle, metaRight }) {
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#111111").text(title, { align: "left" });
  doc.font("Helvetica").fontSize(10).fillColor("#666666").text(subtitle || "", { align: "left" });

  if (metaRight) {
    const x = doc.page.width - doc.page.margins.right - 220;
    const y = doc.y - 30;
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#444444")
      .text(metaRight, x, y, { width: 220, align: "right" });
  }
  hr(doc, "#DDDDDD", 0.6);
}

function sectionTitle(doc, text) {
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#111111").text(text);
  hr(doc, "#EEEEEE", 0.4);
}

function keyValue(doc, key, value, keyW = 140) {
  const startX = doc.page.margins.left;
  const startY = doc.y;
  const maxW = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc.font("Helvetica-Bold").fontSize(10).fillColor("#333333").text(key, startX, startY, { width: keyW });
  doc.font("Helvetica").fontSize(10).fillColor("#111111").text(value, startX + keyW + 8, startY, {
    width: maxW - keyW - 8,
  });
  doc.moveDown(0.3);
}

function sensorTable(doc, rows) {
  const col1 = 160, col2 = 180, col3 = 180;
  const startX = doc.page.margins.left;
  let y = doc.y;

  doc.font("Helvetica-Bold").fontSize(10).fillColor("#111111");
  doc.text("Sensör", startX, y, { width: col1 });
  doc.text("Ölçüm", startX + col1, y, { width: col2 });
  doc.text("Açıklama", startX + col1 + col2, y, { width: col3 });

  y = doc.y + 4;
  doc.strokeColor("#DDDDDD").lineWidth(1).moveTo(startX, y).lineTo(startX + col1 + col2 + col3, y).stroke();
  y += 6;

  doc.font("Helvetica").fontSize(10).fillColor("#111111");
  rows.forEach(r => {
    doc.text(r.sensor, startX, y, { width: col1 });
    doc.text(r.measurement, startX + col1, y, { width: col2 });
    doc.text(r.desc, startX + col1 + col2, y, { width: col3 });
    y = doc.y + 4;
    doc.strokeColor("#F2F2F2").lineWidth(1).moveTo(startX, y).lineTo(startX + col1 + col2 + col3, y).stroke();
    y += 6;
  });

  doc.moveDown(0.5);
}

function addFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const pageNo = i + 1;
    doc.font("Helvetica").fontSize(9).fillColor("#888888").text(`Sayfa ${pageNo} / ${range.count}`, 0, doc.page.height - 40, { align: "center" });
  }
}

/* -------------------- Controllers -------------------- */
/**
 * Generate a new patient report (TR + elegant PDF + robust error handling)
 */
exports.generateReport = async (req, res) => {
  const { patientId, appointmentId } = req.body;
  if (!patientId) return res.status(400).json({ error: "patientId is required" });

  try {
    // 1) Latest sensor docs
    const [ppg, mpu, flex, fsr] = await Promise.all([
      getLatestDoc(patientId, "ppg_data"),
      getLatestDoc(patientId, "mpu_data"),
      getLatestDoc(patientId, "flex_data"),
      getLatestDoc(patientId, "fsr_data"),
    ]);

    const bpm = ppg?.bpm ?? null;

    // Compact, no undefined
    let mpuShort = null;
    if (mpu && typeof mpu === "object") {
      const t = {};
      if (mpu.state != null) t.state = mpu.state;
      if (mpu.result != null) t.result = mpu.result;
      if (mpu.raised != null) t.raised = mpu.raised;
      if (mpu.lowered != null) t.lowered = mpu.lowered;
      if (Object.keys(t).length > 0) mpuShort = t;
    }
    const flexBent = flex?.bent ?? null;
    const fsrPressure = fsr?.pressure ?? null;

    // 2) Turkish prompt (no bullets/markdown, no diagnosis/recommendations)
    const prompt = `
Aşağıdaki verilere göre hastaya ait TÜRKÇE bir tıbbi rapor yaz.
- Liste, madde işareti ve yıldız (*) kullanma; sade, düz metin yaz.
- Tanı, tedavi, öneri veya yönlendirme verme; yalnızca bulguların betimleyici klinik yorumunu ve genel değerlendirmeyi yaz.
- Akıcı ve düzenli paragraflar kullan.

Veriler:
- PPG/kalp atım hızı (bpm): ${bpm ?? "Yok"}
- MPU (kısa özet JSON): ${mpuShort ? JSON.stringify(mpuShort) : "Yok"}
- Flex (bükülme): ${flexBent ?? "Yok"}
- FSR (basınç): ${fsrPressure ?? "Yok"}
`.trim();

    // 3) Get Turkish report text from OpenAI with robust fallback
    let reportText = "";
    try {
      if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY missing");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // <- works with chat.completions
        messages: [
          { role: "system", content: "Türkçe yazan bir tıbbi rapor asistanısın. Yalnızca betimleyici rapor yaz; tanı/tedavi/öneri verme. Liste ve yıldız kullanma." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 700,
      });
      reportText = completion.choices?.[0]?.message?.content?.trim() || "";
      // Just in case the model added asterisks
      reportText = reportText.replace(/\*/g, "");
    } catch (oaErr) {
      // Log detailed OpenAI error and fallback to a minimal TR report
      console.error("OpenAI error:", oaErr?.response?.status, oaErr?.response?.data || oaErr?.message || oaErr);
      reportText =
        `Klinik Betimleme:\n` +
        `PPG kalp atım hızı: ${bpm !== null ? `${bpm} bpm` : "Yok"}. ` +
        `Hareket/pozisyon (MPU): ${mpuShort ? JSON.stringify(mpuShort) : "Yok"}. ` +
        `Flex bükülme: ${trVal(flexBent)}. ` +
        `FSR basınç: ${trVal(fsrPressure)}.\n\n` +
        `Genel Değerlendirme:\n` +
        `Mevcut veriler doğrultusunda bulgular tarif edilmiştir. Bu metin öneri veya tanı içermez.`;
    }

    // 4) Create elegant PDF
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 56, bottom: 56, left: 56, right: 56 },
      bufferPages: true,
      pdfVersion: "1.7",
      info: {
        Title: "Hasta Raporu",
        Author: "RMTS",
        Subject: "Hasta Sensör Verileri Raporu",
        Keywords: "RMTS, Rapor, Sağlık, Sensör",
        CreationDate: new Date(),
      },
    });

    const fileName = `reports/${patientId}_${Date.now()}.pdf`;
    const file = bucket.file(fileName);
    const downloadToken = uuidv4();

    const stream = file.createWriteStream({
      metadata: {
        contentType: "application/pdf",
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
      validation: false,
      resumable: false,
    });

    doc.pipe(stream);

    // Header
    header(doc, {
      title: "RMTS Hasta Raporu",
      subtitle: "Sensör Tabanlı Klinik Değerlendirme (Öneri İçermez)",
      metaRight: `Hasta ID: ${patientId}\nRandevu ID: ${appointmentId || "Yok"}\nTarih: ${nowTr()}`,
    });

    // Patient quick facts
    sectionTitle(doc, "Hasta Bilgileri");
    keyValue(doc, "Hasta ID", patientId);
    keyValue(doc, "Randevu ID", appointmentId ? String(appointmentId) : "Yok");
    keyValue(doc, "Oluşturulma", nowTr());

    // Sensor summary “table”
    sectionTitle(doc, "Sensör Özeti");
    sensorTable(doc, [
      { sensor: "PPG",  measurement: bpm !== null ? `${bpm} bpm` : "Yok", desc: "Kalp atım hızı" },
      {
        sensor: "MPU",
        measurement: mpuShort
          ? `Durum: ${trVal(mpuShort.state, "Yok")} | Yüksel: ${trVal(mpuShort.raised, "Yok")} | İndir: ${trVal(mpuShort.lowered, "Yok")}`
          : "Yok",
        desc: "Hareket/pozisyon (kısa özet)",
      },
      { sensor: "Flex", measurement: flexBent !== null ? trVal(flexBent) : "Yok", desc: "Bükülme durumu" },
      { sensor: "FSR",  measurement: fsrPressure !== null ? `${fsrPressure}` : "Yok", desc: "Basınç ölçümü" },
    ]);

    // Narrative
    sectionTitle(doc, "Ayrıntılı Klinik Betimleme ve Genel Değerlendirme");
    doc.font("Helvetica").fontSize(11).fillColor("#111111").text(reportText, { align: "left", lineGap: 2 });

    // Footer
    doc.moveDown(1);
    addFooter(doc);

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    const reportUrl =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}` +
      `?alt=media&token=${downloadToken}`;

    // 5) Save metadata (sanitized) in Firestore
    const summary = sanitizeForFirestore({
      bpm: bpm ?? null,
      mpu: mpuShort ?? null,
      flex: flexBent ?? null,
      fsr: fsrPressure ?? null,
    });

    const payload = sanitizeForFirestore({
      reportUrl,
      appointmentId: appointmentId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      language: "tr",
      formatVersion: 3,
      summary,
    });

    const reportRef = await db.collection(`patients/${patientId}/reports`).add(payload);

    // 6) Read back and normalize createdAt
    const savedDoc = await reportRef.get();
    const savedData = savedDoc.data() || {};

    res.status(200).json({
      id: savedDoc.id,
      reportUrl: savedData.reportUrl,
      appointmentId: savedData.appointmentId ?? null,
      language: savedData.language || "tr",
      createdAt: toIsoDate(savedData.createdAt),
    });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Rapor oluşturulamadı" }); // Turkish error message
  }
};

/**
 * Get one report by ID
 */
exports.getReportById = async (req, res) => {
  const { patientId, reportId } = req.params;
  try {
    const snap = await db.collection(`patients/${patientId}/reports`).doc(reportId).get();
    if (!snap.exists) return res.status(404).json({ error: "Rapor bulunamadı" });
    const data = snap.data() || {};
    res.status(200).json({ id: snap.id, ...data, createdAt: toIsoDate(data.createdAt) });
  } catch (err) {
    console.error("Error fetching report by ID:", err);
    res.status(500).json({ error: "Rapor getirilemedi" });
  }
};

/**
 * Get all reports for a patient
 */
exports.getReportsByPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const snap = await db
      .collection(`patients/${patientId}/reports`)
      .orderBy("createdAt", "desc")
      .get();

    const reports = snap.docs.map(d => {
      const data = d.data() || {};
      return { id: d.id, ...data, createdAt: toIsoDate(data.createdAt) };
    });

    res.status(200).json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Raporlar getirilemedi" });
  }
};
