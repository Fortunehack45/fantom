// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFUDANN7ZO9miDV-KLL90DHKTZJd3BbN8",
  authDomain: "in-network-ebce9.firebaseapp.com",
  projectId: "in-network-ebce9",
  storageBucket: "in-network-ebce9.appspot.com",
  messagingSenderId: "724670445186",
  appId: "1:724670445186:web:928a421365931faab9a69b",
  measurementId: "G-MPEBEGVVSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


// Initialize Analytics only in the browser
if (typeof window !== 'undefined') {
  getAnalytics(app);
}
