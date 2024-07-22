import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, setDoc, doc, getDoc, deleteDoc, FieldValue, writeBatch, deleteField } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7sHg7jdPnE2pPcL3EO_-7tPsD9FtD6l8",
  authDomain: "swing-pos.firebaseapp.com",
  projectId: "swing-pos",
  storageBucket: "swing-pos.appspot.com",
  messagingSenderId: "707294670404",
  appId: "1:707294670404:web:a08bc8b4ce2fc7678a9611"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { doc, getDoc, setDoc, deleteDoc, FieldValue, writeBatch, deleteField };
export { onAuthStateChanged, signInWithEmailAndPassword };
