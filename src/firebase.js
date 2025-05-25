// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyAWw6D8N0HN29ti-aLNT3h1XGUrkgr1gEY",

  authDomain: "idle-lt-v1.firebaseapp.com",

  projectId: "idle-lt-v1",

  storageBucket: "idle-lt-v1.firebasestorage.app",

  messagingSenderId: "37616465533",

  appId: "1:37616465533:web:04d1efdea7a5ebeebd2314",

  measurementId: "G-X6LER4T5NJ"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
