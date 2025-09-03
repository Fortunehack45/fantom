
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
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
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics only on the client side
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes ? getAnalytics(app) : null);
}

const getUsernameByUID = async (uid: string) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().username;
    }
    return null;
}

const handleUserSignup = async (email: string, a: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, a);
    const user = userCredential.user;

    const username = user.email?.split('@')[0] || `user_${user.uid.substring(0, 5)}`;
    const photoURL = user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`;
    
    // Update Firebase Auth profile
    await updateProfile(user, {
        displayName: username,
        photoURL: photoURL
    });

    // Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        username: username,
        lowercaseUsername: username.toLowerCase(),
        photoURL: photoURL,
        role: 'User',
        verification: 'None',
    });

     // Create username document for uniqueness check
    const usernameDocRef = doc(db, 'usernames', username.toLowerCase());
    await setDoc(usernameDocRef, { uid: user.uid });
    
    return userCredential;
}


export { app, db, auth, storage, getUsernameByUID, handleUserSignup };
