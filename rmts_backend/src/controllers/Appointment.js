// controllers/AppointmentController.js
const { getFirestore, collection, getDocs, doc, getDoc } = require("firebase/firestore");
const db = getFirestore();

class AppointmentController {
  /**
   * GET /ShowAppointment
   * Fetches list of all appointments
   */
  async listAppointments(req, res) {
    try {
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const appointments = [];
      querySnapshot.forEach((docSnap) => {
        appointments.push({ id: docSnap.id, ...docSnap.data() });
      });
      res.status(200).json(appointments);
    } catch (error) {
      console.error("Error fetching appointment list:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /ShowAppointment/:appointmentId
   * Fetches a single appointment by ID
   */
  async getAppointmentById(req, res) {
    try {
      const { appointmentId } = req.params;
      if (!appointmentId) {
        return res.status(400).json({ error: 'appointmentId is required' });
      }
      const ref = doc(db, 'appointments', appointmentId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      res.status(200).json({ id: snap.id, ...snap.data() });
    } catch (error) {
      console.error('Error fetching appointment by ID:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AppointmentController();
