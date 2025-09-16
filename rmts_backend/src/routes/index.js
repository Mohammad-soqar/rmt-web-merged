const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware");
const { admin } = require("../config/firebase");

const firebaseAuthController = require("../controllers/firebase-auth-controller");
const DoctorController = require("../controllers/doctor-controller.js");
const PostsController = require("../controllers/posts-controller.js");
const GloveController = require("../controllers/glove-controller.js");
const GloveAssigner = require("../controllers/assign-glove.js");
const Appointment = require("../controllers/Appointment.js");
const ReportController = require("../controllers/ReportController.js");

// ------------------ Auth routes ------------------
router.post("/register", firebaseAuthController.registerUser);
router.post("/login", firebaseAuthController.loginUser);
router.post("/logout", firebaseAuthController.logoutUser);
router.post("/reset-password", firebaseAuthController.resetPassword);

// ------------------ Patients ------------------
router.post("/createPatient", DoctorController.CreatePatient);
router.get("/showPatients", (req, res) => GloveAssigner.getPatients(req, res));
router.get("/showPatients/:id", (req, res) =>
  GloveAssigner.getPatientById(req, res)
);

// ------------------ Gloves ------------------
router.post("/gloves", GloveController.createGlove);
router.put("/gloves/assign", GloveAssigner.assignGloveToPatient);
router.get("/showGloves", (req, res) => GloveAssigner.getGloves(req, res));

// ------------------ Appointments ------------------
router.get("/showAppointment", (req, res) =>
  Appointment.listAppointments(req, res)
);
router.get("/ShowAppointment", verifyToken, Appointment.listAppointments);
router.get("/ShowAppointment/:appointmentId", verifyToken, Appointment.getAppointmentById);

// ------------------ Reports ------------------
router.post("/generate_report", ReportController.generateReport);
router.get("/reports/:patientId/:reportId", ReportController.getReportById);

// ✅ New: use controller instead of inline code
router.get("/api/reports/patient/:patientId", ReportController.getReportsByPatient);

// ------------------ Posts ------------------
router.get("/posts", verifyToken, PostsController.getPosts);

module.exports = router;
