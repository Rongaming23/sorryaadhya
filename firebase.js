// ===============================
// UNISERVE CRM Firebase Config
// firebase.js
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ===============================
// Firebase Configuration
// ===============================

const firebaseConfig = {
apiKey: "AIzaSyAdR4XaDcs2M7o43j2pu6K1zA3FhCrK-cA",
authDomain: "customerdetailsuniserve.firebaseapp.com",
projectId: "customerdetailsuniserve",
storageBucket: "customerdetailsuniserve.firebasestorage.app",
messagingSenderId: "125960501611",
appId: "1:125960501611:web:4fbbe720ce8a063afbb42e",
measurementId: "G-YK03S135FK"
};

// ===============================
// Initialize Firebase
// ===============================

const app = initializeApp(firebaseConfig);

// ===============================
// Services
// ===============================

const db = getFirestore(app);
const auth = getAuth(app);

// ===============================
// Export
// ===============================

export { app, db, auth };