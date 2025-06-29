const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware');
const { admin } = require("../config/firebase"); 


const firebaseAuthController = require('../controllers/firebase-auth-controller');
const DoctorController = require('../controllers/doctor-controller.js');
const PostsController = require('../controllers/posts-controller.js');
const GloveController = require('../controllers/glove-controller.js');
const GloveAssigner = require('../controllers/assign-glove.js');
const Appointment = require('../controllers/Appointment.js');
const ReportController = require('../controllers/ReportController.js');
// Auth routes
router.post('/register', firebaseAuthController.registerUser);
router.post('/login', firebaseAuthController.loginUser);
router.post('/logout', firebaseAuthController.logoutUser);
router.post('/reset-password', firebaseAuthController.resetPassword);
router.post('/createPatient', DoctorController.CreatePatient);
//posts routes
router.get('/posts', verifyToken, PostsController.getPosts);
router.post('/gloves', GloveController.createGlove);
router.put('/gloves/assign', GloveAssigner.assignGloveToPatient);
router.get('/showPatients', (req, res) => GloveAssigner.getPatients(req, res));
// after your existing showPatients route:
// GET one patient by ID:
router.get(
    '/showPatients/:id',
    (req, res) => GloveAssigner.getPatientById(req, res)
  );
  
router.get('/showGloves', (req, res) => GloveAssigner.getGloves(req, res));
router.get('/showAppointment', (req, res) => Appointment.listAppointments(req, res));
router.get(
  "/reports/:patientId/:reportId",
  ReportController.getReportById
);

router.get('/api/reports/patient/:patientId', async (req, res) => {
  const { patientId } = req.params;
  try {
    const snap = await admin.firestore()
      .collection(`patients/${patientId}/reports`)
      .get();

    const reports = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(reports);
  } catch (err) {
    console.error("Error fetching patient reports", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});
router.post("/generate_report", ReportController.generateReport);


router.get(
  '/ShowAppointment',
  verifyToken,
  Appointment.listAppointments
);
router.get(
  '/ShowAppointment/:appointmentId',
  verifyToken,
  Appointment.getAppointmentById
);




module.exports = router;
