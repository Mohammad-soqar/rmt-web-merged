// src/controllers/ReportController.js

const { v4: uuidv4 } = require('uuid');
const OpenAI = require("openai");
const PDFDocument = require("pdfkit");
const admin = require("firebase-admin");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const db = admin.firestore();
const bucket = admin.storage().bucket();

async function getLatestDoc(patientId, subcollection) {
  const snap = await db
    .collection(`patients/${patientId}/${subcollection}`)
    .orderBy("timestamp", "desc")
    .limit(1)
    .get();

  return snap.empty ? null : snap.docs[0].data();
}

exports.generateReport = async (req, res) => {
  const { patientId, appointmentId } = req.body;
  if (!patientId) {
    return res.status(400).json({ error: "patientId is required" });
  }

  try {
    // 1) Fetch latest sensor docs in parallel
    const [ppg, mpu, flex, fsr] = await Promise.all([
      getLatestDoc(patientId, "ppg_data"),
      getLatestDoc(patientId, "mpu_data"),
      getLatestDoc(patientId, "flex_data"),
      getLatestDoc(patientId, "fsr_data")
    ]);

    // 2) Build prompt for OpenAI
    const prompt = `
Generate a detailed medical report for the following patient data:
- PPG heart rate: ${ppg?.bpm ?? "N/A"}
- MPU data: ${JSON.stringify(mpu) ?? "N/A"}
- Flex bent: ${flex?.bent ?? "N/A"}
- FSR pressure: ${fsr?.pressure ?? "N/A"}
`;

    // 3) Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",              // change if needed
      messages: [
        { role: "system", content: "You are a medical assistant generating reports." },
        { role: "user",   content: prompt }
      ]
    });

    const reportText = completion.choices[0].message.content.trim();
    console.log("OpenAI response:", reportText);

    // 4) Generate PDF and upload to Storage with download token
    const doc = new PDFDocument();
    const fileName = `reports/${patientId}_${Date.now()}.pdf`;
    const file = bucket.file(fileName);
    const downloadToken = uuidv4();

    const stream = file.createWriteStream({
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken
        }
      }
    });

    // pipe before writing content
    doc.pipe(stream);
    doc.text(reportText || 'No data generated.');
    doc.end();

    // wait until upload finishes
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    // 5) Build the public download URL
    const reportUrl = 
      `https://firebasestorage.googleapis.com/v0/b/` +
      `${bucket.name}/o/${encodeURIComponent(fileName)}` +
      `?alt=media&token=${downloadToken}`;

    // 6) Save metadata to Firestore
    const reportRef = await db
      .collection(`patients/${patientId}/reports`)
      .add({
        reportUrl,
        appointmentId: appointmentId || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // 7) Return to client
    res.status(200).json({
      reportId: reportRef.id,
      reportUrl
    });

  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

exports.getReportById = async (req, res) => {
  const { patientId, reportId } = req.params;

  try {
    const snap = await db
      .collection(`patients/${patientId}/reports`)
      .doc(reportId)
      .get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.status(200).json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Error fetching report by ID:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
};
