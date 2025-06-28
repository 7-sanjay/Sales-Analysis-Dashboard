// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7tpW1r5877sDL51giSkF_pZc0S5pA8c8",
  authDomain: "data-analysis-ab7a3.firebaseapp.com",
  projectId: "data-analysis-ab7a3",
  storageBucket: "data-analysis-ab7a3.firebasestorage.app",
  messagingSenderId: "968537929704",
  appId: "1:968537929704:web:668611b093009ec86ed65d",
  measurementId: "G-D2VCKGB8XH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };