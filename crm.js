
// ================================
// FIREBASE IMPORTS (MODULAR)
// ================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ================================
// FIREBASE CONFIG
// ================================

const firebaseConfig = {
    apiKey: "AIzaSyAdR4XaDcs2M7o43j2pu6K1zA3FhCrK-cA",
    authDomain: "customerdetailsuniserve.firebaseapp.com",
    projectId: "customerdetailsuniserve",
    storageBucket: "customerdetailsuniserve.appspot.com",
    messagingSenderId: "125960501611",
    appId: "1:125960501611:web:4fbbe720ce8a063afbb42e"
};


// ================================
// INIT FIREBASE
// ================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// ================================
// GLOBAL STATE
// ================================

let allData = [];
let unsubscribe = null;
let userRole = "agent";
let lastNote = "";

const caseRef = collection(db, "cases");

const get = (id) => document.getElementById(id);


// ================================
// LOGIN
// ================================

window.login = async function () {

    const email = get("email").value.trim();
    const password = get("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        get("msg").innerText = "Login Successful";
    } catch (err) {
        get("msg").innerText = err.message;
    }
};


// ================================
// LOGOUT
// ================================

window.logout = async function () {
    await signOut(auth);
};


// ================================
// AUTH STATE
// ================================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        get("authBox").style.display = "flex";

        if (unsubscribe) unsubscribe();

        return;
    }

    get("authBox").style.display = "none";

    userRole = user.email === "sankudas@crm.com" ? "admin" : "agent";

    loadCases();
});


// ================================
// ADD CASE
// ================================

window.addCase = async function () {

    const data = {
        name: get("name").value.trim(),
        phone: get("phone").value.trim(),
        order: get("order").value.trim(),
        date: get("date").value.trim(),
        outlet: get("outlet").value.trim(),
        concern: get("concern").value.trim(),
        issue: get("issue").value,
        partner: get("partner").value,
        agent: get("agent").value,
        createdBy: auth.currentUser.email,
        time: serverTimestamp()
    };

    if (!data.name || !data.order) {
        alert("Name & Order required");
        return;
    }

    await addDoc(caseRef, data);

    alert("Case Saved");

    clearForm();
};


// ================================
// LOAD CASES (REALTIME FIXED)
// ================================

function loadCases() {

    if (unsubscribe) unsubscribe();

    const q = query(caseRef, orderBy("time", "desc"));

    unsubscribe = onSnapshot(q, (snapshot) => {

        allData = [];

        snapshot.forEach(docSnap => {
            allData.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        renderTable(allData);
        updateDashboard();
        updateReports();

    });
}


// ================================
// RENDER TABLE
// ================================

function renderTable(data) {

    let html = "";
    let ticket = 1;

    data.forEach(item => {

        html += `
<tr>
<td>CX${String(ticket++).padStart(5, "0")}</td>
<td>${item.phone || ""}</td>
<td>${item.name || ""}</td>
<td>${item.order || ""}</td>
<td>${item.issue || ""}</td>
<td>${item.partner || ""}</td>
<td>${item.agent || ""}</td>
<td>${item.createdBy || ""}</td>
<td>${item.date || ""}</td>
<td>
${userRole === "admin"
    ? `<button onclick="deleteCase('${item.id}')">Delete</button>`
    : "No Access"}
</td>
</tr>
        `;
    });

    get("table").innerHTML = html;
}


// ================================
// DASHBOARD
// ================================

function updateDashboard() {

    get("totalCases") && (get("totalCases").innerText = allData.length);

    let refund = 0;
    let complaint = 0;
    let escalation = 0;

    allData.forEach(i => {
        if (i.issue === "Refund Request") refund++;
        if ((i.issue || "").includes("Complaint")) complaint++;
        if (i.issue === "Refund Request" || (i.issue || "").includes("Complaint")) escalation++;
    });

    get("refundCases") && (get("refundCases").innerText = refund);
    get("complaintCases") && (get("complaintCases").innerText = complaint);
    get("escalationCases") && (get("escalationCases").innerText = escalation);
}


// ================================
// REPORTS
// ================================

function updateReports() {

    let report = {};

    allData.forEach(i => {
        let key = i.issue || "Unknown";
        report[key] = (report[key] || 0) + 1;
    });

    let html = "";

    Object.keys(report).forEach(k => {
        html += `<div>${k} - ${report[k]}</div>`;
    });

    get("reportBox").innerHTML = html;
}


// ================================
// DELETE CASE
// ================================

window.deleteCase = async function (id) {

    if (userRole !== "admin") {
        alert("Only admin");
        return;
    }

    if (!confirm("Delete?")) return;

    await deleteDoc(doc(db, "cases", id));

    alert("Deleted");
};


// ================================
// CLEAR FORM
// ================================

window.clearForm = function () {

    ["name","phone","order","date","outlet","concern"].forEach(id => {
        get(id).value = "";
    });

    get("issue").selectedIndex = 0;
    get("partner").selectedIndex = 0;
    get("agent").selectedIndex = 0;
};


// ================================
// COPY NOTE (SIMPLE)
// ================================

window.copyCase = function () {
    navigator.clipboard.writeText(JSON.stringify(allData, null, 2));
    alert("Copied");
};


// ================================
// WHATSAPP
// ================================

window.whatsapp = function () {

    const url = "https://wa.me/?text=" +
        encodeURIComponent(JSON.stringify(allData));

    window.open(url, "_blank");
};


// ================================
// CSV EXPORT
// ================================

window.csv = function () {

    let csv = "Name,Phone,Order,Issue\n";

    allData.forEach(i => {
        csv += `${i.name},${i.phone},${i.order},${i.issue}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = "crm.csv";
    a.click();
};


// ================================
// START MESSAGE
// ================================

console.log("CRM READY 🚀");
