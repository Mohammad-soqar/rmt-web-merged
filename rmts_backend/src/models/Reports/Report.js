// src/models/Report.js
const {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc
  } = require('firebase/firestore');
  
  const db = getFirestore();
  
  class Report {
    static collectionRef() {
      return collection(db, 'patient_reports');
    }
  
    /**
     * Create a new report
     * @param {{ patientId?: string, title: string, date: string, summary: string, [key:string]: any }} data
     * @returns {Promise<string>} new document ID
     */
    static async create(data) {
      const docRef = await addDoc(Report.collectionRef(), data);
      return docRef.id;
    }
  
    /**
     * Get one report by its ID
     * @param {string} id
     * @returns {Promise<object|null>}
     */
    static async getById(id) {
      const snap = await getDoc(doc(db, 'patient_reports', id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }
  
    /**
     * Get all reports for a specific patient (or all if no patientId)
     * @param {string} [patientId]
     * @returns {Promise<object[]>}
     */
    static async getByPatientId(patientId) {
      const snaps = await getDocs(Report.collectionRef());
      const list = [];
      snaps.forEach((snap) => {
        const data = snap.data();
        // include if matching or if no patientId (legacy)
        if (!data.patientId || data.patientId === patientId) {
          list.push({ id: snap.id, ...data });
        }
      });
      return list;
    }
  
    /**
     * Update an existing report
     * @param {string} id
     * @param {object} updates
     */
    static async update(id, updates) {
      const ref = doc(db, 'patient_reports', id);
      await updateDoc(ref, updates);
    }
  
    /**
     * Delete a report
     * @param {string} id
     */
    static async delete(id) {
      const ref = doc(db, 'patient_reports', id);
      await deleteDoc(ref);
    }
  }
  
  module.exports = Report;
  