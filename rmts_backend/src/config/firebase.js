const firebase = require("firebase/app");
const admin = require("firebase-admin");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail
} = require("firebase/auth");

// Load your Firebase Admin service account
const serviceAccount = require("./firebaseservice.json"); // adjust path if needed

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firebase client config
const firebaseConfig = {
  apiKey: "AIzaSyB7Xkl5IVT7Z-nFuFaHjd1H0RILvyHITVQ",
  authDomain: "rmts-8f76b.firebaseapp.com",
  projectId: "rmts-8f76b",
  storageBucket: "rmts-8f76b.appspot.com",
  messagingSenderId: "890480272228",
  appId: "1:890480272228:web:e78e6adc4132343a30d071",
  measurementId: "G-5X3BK2CFFE",
};

// Initialize Firebase client SDK
firebase.initializeApp(firebaseConfig);

module.exports = {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  admin
};
