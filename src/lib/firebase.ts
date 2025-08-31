// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASjlIHQa2sdUmSumI2kSQF820K_oAbkFQ",
  authDomain: "integral-mine.firebaseapp.com",
  projectId: "integral-mine",
  storageBucket: "integral-mine.firebasestorage.app",
  messagingSenderId: "1090345326190",
  appId: "1:1090345326190:web:f776f063b46c96fa7d387f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
