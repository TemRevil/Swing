import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, setDoc, doc, getDoc, deleteDoc, FieldValue, writeBatch, deleteField, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

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
export const storage = getStorage(app);  // Firebase Storage
export { doc, getDoc, setDoc, deleteDoc, FieldValue, writeBatch, deleteField, collection, getDocs };
export { onAuthStateChanged, signInWithEmailAndPassword };
export { ref, getDownloadURL };  // Exporting

// -----------------------------------------
// Function to check Firebase connection
async function checkFirebaseConnection() {
  const connectionStatusElement = document.getElementById('connection-status');
  
  if (!connectionStatusElement) {
    console.error('Element with id "connection-status" not found');
    return;
  }

  try {
    // Attempt to read a document from Firestore
    const docRef = doc(db, 'test', 'connection'); // Use a dummy document reference
    await getDoc(docRef);
    
    // If successful, show 'Connected'
    connectionStatusElement.textContent = 'Connected';
    // Apply the styles for connected status
    connectionStatusElement.style.backgroundColor = '#d4ffc3';
    connectionStatusElement.style.color = '#2dee3d';
  } catch (error) {
    console.error('Error checking Firebase connection:', error);
    // If an error occurs, show 'Lost'
    connectionStatusElement.textContent = 'Lost';
    // Apply the styles for lost status
    connectionStatusElement.style.backgroundColor = 'var(--poppy-lighted)';
    connectionStatusElement.style.color = 'var(--poppy)';
  }
}

// Initial check on page load
window.addEventListener('load', () => {
  checkFirebaseConnection();
  // Check connection every 30 seconds
  setInterval(checkFirebaseConnection, 30000);
});
// -----------------------------------------
