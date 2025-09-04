
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc, writeBatch } from "firebase/firestore";
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

const handleUserSignup = async (email: string, a: any, username: string, role: 'Creator' | 'Clan Owner') => {
    // Validate username format
    if (username.length < 3 || username.length > 15) {
        throw new Error('Username must be between 3 and 15 characters.');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores.');
    }

    // Check for username uniqueness first
    const usernameLower = username.toLowerCase();
    const usernameRef = doc(db, 'usernames', usernameLower);
    const usernameSnap = await getDoc(usernameRef);
    if (usernameSnap.exists()) {
        throw new Error("This username is already taken. Please choose another.");
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, a);
    const user = userCredential.user;

    const photoURL = user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`;
    
    // Update Firebase Auth profile
    await updateProfile(user, {
        displayName: username,
        photoURL: photoURL
    });

    // Use a batch write to ensure both documents are created atomically
    const batch = writeBatch(db);
    
    // 1. Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    batch.set(userDocRef, {
        uid: user.uid,
        email: user.email,
        username: username,
        lowercaseUsername: usernameLower,
        photoURL: photoURL,
        bannerURL: 'https://i.pinimg.com/originals/a1/b4/27/a1b427a7c88b7f8973686942c4f68641.jpg',
        role: role,
        verification: 'None',
    });

    // 2. Create username document for uniqueness check
    batch.set(usernameRef, { uid: user.uid });
    
    // Commit the batch
    await batch.commit();
    
    return userCredential;
}


export { app, db, auth, storage, getUsernameByUID, handleUserSignup };
