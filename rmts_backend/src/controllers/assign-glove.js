const { getFirestore, collection, addDoc,getDocs, getDoc,doc,updateDoc, DocumentReference } = require("firebase/firestore");
const db = getFirestore();
const Appointment = require("./Appointment"); // your Appointment controller
const Report = require('../models/Reports/Report'); // your Report model


class GloveAssigner {
    async assignGloveToPatient(req, res) {
        try {

          const { gloveId, patientId } = req.body;
          if (!gloveId || !patientId) {
            return res.status(400).json({ error: "gloveId and patientId required" });
          }
    
          // Update the glove doc to add a reference to the patient
          await updateDoc(doc(db, "Gloves", gloveId), {
            patientID: patientId
          });
          await updateDoc(doc(db,"patients",patientId),{
            gloveId: gloveId
          });
          await updateDoc(doc(db, "Gloves", gloveId), {
            patientID: patientId,
            status: "active"
          });
    
          res.status(200).json({ message: "Glove assigned to patient", gloveId, patientId });
        } catch (error) {
          console.error("Error assigning glove:", error);
          res.status(500).json({ error: error.message });
        }
        
      }
      async getGloves(req, res) {
        try {
          const querySnapshot = await getDocs(collection(db, "Gloves"));
          const gloves = [];
          querySnapshot.forEach((doc) => {
            gloves.push({ id: doc.id, ...doc.data() });
          });
          res.status(200).json(gloves);
        } catch (error) {
          console.error("Error fetching gloves list:", error);
          res.status(500).json({ error: error.message });
        }
      }
    
      // Endpoint to get a list of all patients
      async getPatients(req, res) {
        try {
          const querySnapshot = await getDocs(collection(db, "patients"));
          
          // For each patient, fetch the corresponding user document and merge data.
          const patients = await Promise.all(
            querySnapshot.docs.map(async (patientDoc) => {
              const patientData = patientDoc.data();
              // Assuming the patient document ID corresponds to the user document ID
              const userDocRef = doc(db, "users", patientDoc.id);
              const userDoc = await getDoc(userDocRef);
              const userData = userDoc.exists() ? userDoc.data() : {};
              
              // Merge patient data with the user's name (assuming it's stored as 'fullName' or 'name')
              return {
                id: patientDoc.id,
                ...patientData,
                fullName: userData.fullName || userData.name || "Unnamed Patient",
                email: userData.email || "No Email",
                phonenumber: userData.phonenumber || userData.phoneNumber || "No Phone Number",
              };
            })
          );
    
          res.status(200).json(patients);
        } catch (error) {
          console.error("Error fetching patients list:", error);
          res.status(500).json({ error: error.message });
        }
      }
      async getPatientById(req, res) {
        try {
          const { id } = req.params;
          // 1️⃣ Fetch patient doc
          const pref = doc(db, "patients", id);
          const psnap = await getDoc(pref);
          if (!psnap.exists()) {
            return res.status(404).json({ error: "Patient not found" });
          }
          const pdata = psnap.data();
    
          // 2️⃣ Fetch corresponding user record
          const uref = doc(db, "users", id);
          const usnap = await getDoc(uref);
          const udata = usnap.exists() ? usnap.data() : {};
    
          // 3️⃣ Merge fields
          const merged = {
            id,
            fullName: udata.fullName || udata.name || "Unnamed Patient",
            email: udata.email || "No Email",
            phonenumber: udata.phonenumber || udata.phoneNumber || "No Phone Number",
            emergencyContact: pdata.emergencyContact || null,
            // include any other pdata fields as needed
          };
    
          // 4️⃣ Get appointments via Appointment controller helper (if exists)
          let appointments = [];
          if (typeof Appointment.fetchByPatientId === 'function') {
            appointments = await Appointment.fetchByPatientId(id);
          } else {
            // fallback manual query:
            const asnaps = await getDocs(collection(db, "appointments"));
            appointments = asnaps.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(a => a.patientId === id);
          }
    
          // 5️⃣ Get reports via Report model
          const reports = await Report.getByPatientId(id);
    
          // 6️⃣ Respond
          return res.json({ ...merged, appointments, reports });
        } catch (err) {
          console.error("getPatientById error:", err);
          return res.status(500).json({ error: err.message || "Server error" });
        }
      }
    
}
module.exports = new GloveAssigner();