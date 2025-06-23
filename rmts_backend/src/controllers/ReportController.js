// controllers/ReportController.js
const { getFirestore, doc, getDoc } = require("firebase/firestore");
const db = getFirestore();

class ReportController {
  /**
   * GET /api/reports/:reportId
   * Returns one report document from the top-level 'patient_reports' collection.
   */
  async getReportById(req, res) {
    try {
      const { reportId } = req.params;
      if (!reportId) {
        return res.status(400).json({ error: "reportId is required" });
      }

      // look up in Firestore
      const ref = doc(db, "patient_reports", reportId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return res.status(404).json({ error: "Report not found" });
      }

      // send back the raw data + id
      return res.status(200).json({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.error("Error fetching report:", err);
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new ReportController();
