// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "built-in-ai-challenge-1c9c5.firebaseapp.com",
  projectId: "built-in-ai-challenge-1c9c5",
  storageBucket: "built-in-ai-challenge-1c9c5.firebasestorage.app",
  messagingSenderId: "241495019363",
  appId: "1:241495019363:web:947ab5121d764e18d30d56",
  measurementId: "G-L557N816VS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize AI Logic service with the Gemini backend
const ai = getAI(app, { backend: new GoogleAIBackend() });

export { ai, getGenerativeModel as firebaseGCM };
