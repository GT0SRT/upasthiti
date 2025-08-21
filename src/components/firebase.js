import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration (replace with environment variables for production use)
const firebaseConfig = {
  apiKey: "AIzaSyCqeDYA2saAy30uNdgSMqSfZFN5PtC0lLM",
  authDomain: "upasthiti-d76c5.firebaseapp.com",
  projectId: "upasthiti-d76c5",
  storageBucket: "upasthiti-d76c5.firebasestorage.app",
  messagingSenderId: "199289064383",
  appId: "1:199289064383:web:e808972687378702a56f0a",
  measurementId: "G-YWKDS45MQC"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export services for use across the app
export { app, auth, db, analytics };