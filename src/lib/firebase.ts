
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFUDANN7ZO9miDV-KLL90DHKTZJd3BbN8",
  authDomain: "in-network-ebce9.firebaseapp.com",
  projectId: "in-network-ebce9",
  storageBucket: "in-network-ebce9.appspot.com",
  messagingSenderId: "724670445186",
  appId: "1:724670445186:web:928a421365931faab9a69b",
  measurementId: "G-MPEBEGVVSY"
};

// Initialize Firebase for SSR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Analytics only on the client side
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes ? getAnalytics(app) : null);
}

export { app, db, auth };
