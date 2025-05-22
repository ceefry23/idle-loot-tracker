// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ─── Paste your Firebase config here ───
// You get this object from Firebase Console › Project Settings › Your apps (</> Web)
// It should include apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, etc.
const firebaseConfig = {

  apiKey: "AIzaSyD41Q__qn9sa2sonmLXBvkNs4xfEq2eGng",

  authDomain: "idle-loot-tracker.firebaseapp.com",

  projectId: "idle-loot-tracker",

  storageBucket: "idle-loot-tracker.firebasestorage.app",

  messagingSenderId: "290893215909",

  appId: "1:290893215909:web:c8917e6fb9650b9c3af54c",

  measurementId: "G-YE3YHMHKMK"

};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

export {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
};