// ================================
// FIREBASE IMPORTS
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
    where,
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
    storageBucket: "customerdetailsuniserve.firebasestorage.app",
    messagingSenderId: "125960501611",
    appId: "1:125960501611:web:4fbbe720ce8a063afbb42e",
    measurementId: "G-YK03S135FK"
};


// ================================
// INITIALIZE FIREBASE
// ================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// ================================
// COLLECTION
// ================================

const caseRef = collection(db, "cases");


// ================================
// GLOBAL VARIABLES
// ================================

let allData = [];

let lastNote = "";

let userRole = "agent";

let unsubscribe = null;


// ================================
// SHORTCUT
// ================================

const get = (id) => document.getElementById(id);


// ================================
// LOGIN
// ================================

window.login = async function () {

    const email = get("email").value.trim();

    const password = get("password").value;

    if (!email || !password) {

        alert("Enter Email & Password");

        return;

    }

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        get("msg").innerText = "Login Successful";

    }

    catch (err) {

        console.error(err);

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

        if (unsubscribe) {

            unsubscribe();

            unsubscribe = null;

        }

        return;

    }

    get("authBox").style.display = "none";


    // ADMIN EMAIL

    if (user.email === "sankudas@crm.com") {

        userRole = "admin";

    } else {

        userRole = "agent";

    }

    console.log("Logged In:", user.email);

    console.log("Role:", userRole);

    loadCases();

});


// ================================
// CURRENT QUERY
// ================================

let currentQuery = query(

    caseRef,

    orderBy("time", "desc")

);

// ========================================
// ADD NEW CASE
// ========================================

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

        createdBy: auth.currentUser
            ? auth.currentUser.email
            : "Unknown",

        time: serverTimestamp()

    };

    if (!data.name || !data.order) {

        alert("Customer Name and Order ID are required.");

        return;

    }

    try {

        await addDoc(caseRef, data);

        lastNote =
`Customer Name : ${data.name}

Phone Number : ${data.phone}

Order ID : ${data.order}

Order Date : ${data.date}

Outlet : ${data.outlet}

Issue : ${data.issue}

Customer Concern :
${data.concern}

Delivery Partner :
${data.partner}

Handled By :
${data.agent}`;

        get("note").textContent = lastNote;

        alert("✅ Case Saved Successfully");

        clearForm();

    }

    catch (err) {

        console.error(err);

        alert("Error : " + err.message);

    }

};


// ========================================
// COPY NOTE
// ========================================

window.copyCase = async function () {

    if (lastNote === "") {

        alert("Generate a case first.");

        return;

    }

    try {

        await navigator.clipboard.writeText(lastNote);

        alert("Case copied.");

    }

    catch {

        alert("Clipboard not supported.");

    }

};


// ========================================
// CLEAR FORM
// ========================================

window.clearForm = function () {

    get("name").value = "";
    get("phone").value = "";
    get("order").value = "";
    get("date").value = "";
    get("outlet").value = "";
    get("concern").value = "";

    get("issue").selectedIndex = 0;
    get("partner").selectedIndex = 0;
    get("agent").selectedIndex = 0;

};


// ========================================
// WHATSAPP SHARE
// ========================================

window.whatsapp = function () {

    if (lastNote === "") {

        alert("Generate a case first.");

        return;

    }

    const url =
        "https://wa.me/?text=" +
        encodeURIComponent(lastNote);

    window.open(url, "_blank");

};


// ========================================
// SMALL HELPER
// ========================================

function safe(value) {

    return value ? value : "";

}


// =========================================
// LOAD FIRESTORE CASES (REALTIME)
// =========================================

function loadCases() {

    // Stop previous listener
    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = onSnapshot(currentQuery, (snapshot) => {

        allData = [];

        let html = "";

        let ticket = 1;

        snapshot.forEach((docSnap) => {

            let data = docSnap.data();

            data.id = docSnap.id;

            // Agent can see only own cases
            if (
                userRole !== "admin" &&
                auth.currentUser &&
                data.createdBy !== auth.currentUser.email
            ) {
                return;
            }

            allData.push(data);

        });

        // Latest first
        allData.reverse();

        allData.forEach((item) => {

            html += `

<tr>

<td>CX${String(ticket++).padStart(5,"0")}</td>

<td>${item.phone || ""}</td>

<td>${item.name || ""}</td>

<td>${item.order || ""}</td>

<td>${item.issue || ""}</td>

<td>${item.partner || ""}</td>

<td>${item.agent || ""}</td>

<td>${item.createdBy || ""}</td>

<td>${item.date || ""}</td>

<td>

${
userRole==="admin"

? `<button class="danger"
onclick="deleteCase('${item.id}')">
Delete
</button>`

: `<span style="color:#94a3b8">
No Access
</span>`
}

</td>

</tr>

`;

        });

        if(allData.length===0){

            html=`

<tr>

<td colspan="10"
style="padding:40px;text-align:center;color:#94a3b8">

No Cases Found

</td>

</tr>

`;

        }

        get("table").innerHTML=html;

        updateDashboard();

        updateReports();

    });

}


// =========================================
// DASHBOARD
// =========================================

function updateDashboard(){

    let total=allData.length;

    let refund=0;

    let complaint=0;

    let escalation=0;

    allData.forEach(item=>{

        if(item.issue==="Refund Request")
            refund++;

        if((item.issue||"").includes("Complaint"))
            complaint++;

        if(
            (item.issue||"").includes("Complaint") ||
            item.issue==="Refund Request"
        ){
            escalation++;
        }

    });

    if(get("totalCases"))
        get("totalCases").innerText=total;

    if(get("refundCases"))
        get("refundCases").innerText=refund;

    if(get("complaintCases"))
        get("complaintCases").innerText=complaint;

    if(get("escalationCases"))
        get("escalationCases").innerText=escalation;

}


// =========================================
// REPORTS
// =========================================

function updateReports(){

    let report={};

    allData.forEach(item=>{

        let key=item.issue || "Unknown";

        report[key]=(report[key]||0)+1;

    });

    let html="";

    Object.keys(report).forEach(issue=>{

        html+=`

<div style="
background:#1e293b;
padding:12px;
margin-bottom:8px;
border-radius:8px;
display:flex;
justify-content:space-between;
align-items:center;
">

<span>${issue}</span>

<b>${report[issue]}</b>

</div>

`;

    });

    if(get("reportBox")){

        get("reportBox").innerHTML=
        html || "No Reports Available";

    }

}

// =========================================
// SEARCH CASES
// =========================================

window.searchCases = function () {

    let search = get("searchBox").value.toLowerCase();

    let rows = document.querySelectorAll("#table tr");

    rows.forEach(row => {

        if (row.innerText.toLowerCase().includes(search)) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

};


// =========================================
// FILTER CASES
// =========================================

window.filterCases = function () {

    const issueFilter = get("filterIssue") ? get("filterIssue").value : "";
    const partnerFilter = get("filterPartner") ? get("filterPartner").value : "";

    const rows = document.querySelectorAll("#table tr");

    rows.forEach(row => {

        const txt = row.innerText;

        let show = true;

        if (issueFilter && !txt.includes(issueFilter))
            show = false;

        if (partnerFilter && !txt.includes(partnerFilter))
            show = false;

        row.style.display = show ? "" : "none";

    });

};


// =========================================
// DOWNLOAD CURRENT FIRESTORE QUERY
// =========================================

window.csv = function () {

    if (allData.length === 0) {

        alert("No Firestore data found.");

        return;

    }

    let csv =
`Ticket ID,Document ID,Agent,Concern,Created By,Date,Issue,Name,Order ID,Outlet,Partner,Phone\n`;

    allData.forEach((d, index) => {

        csv += `"CX${String(index + 1).padStart(5, "0")}",
"${d.id || ""}",
"${d.agent || ""}",
"${(d.concern || "").replace(/"/g,'""')}",
"${d.createdBy || ""}",
"${d.date || ""}",
"${d.issue || ""}",
"${d.name || ""}",
"${d.order || ""}",
"${d.outlet || ""}",
"${d.partner || ""}",
"${d.phone || ""}"\n`;

    });

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "Firestore_Query_Result.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

};


// =========================================
// DELETE CASE (ADMIN ONLY)
// =========================================

window.deleteCase = async function (id) {

    if (userRole !== "admin") {

        alert("Only Admin can delete.");

        return;

    }

    if (!confirm("Delete this case?"))
        return;

    try {

        await deleteDoc(doc(db, "cases", id));

        alert("Case Deleted");

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

};


// =========================================
// REFRESH TABLE
// =========================================

window.refreshCases = function () {

    loadCases();

};


// =========================================
// LOGOUT
// =========================================

window.logout = async function () {

    await signOut(auth);

};


// =========================================
// AUTO START
// =========================================

console.log("✅ Uniserve CRM Loaded Successfully");


// ===============================
// 📊 CRM JS — PART 5
// Dashboard + Reports System
// ===============================


// ===============================
// 📌 DASHBOARD STATE CACHE
// ===============================
let dashboardCache = {
    totalCases: 0,
    openCases: 0,
    resolvedCases: 0,
    breachedCases: 0,
    avgResolutionTime: 0
};


// ===============================
// 📊 UPDATE DASHBOARD METRICS
// ===============================
function updateDashboardMetrics(casesArray) {

    if (!casesArray) return;

    let total = casesArray.length;
    let open = 0;
    let resolved = 0;
    let breached = 0;

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    casesArray.forEach(c => {

        // Status counters
        if (c.status === "OPEN") open++;
        if (c.status === "RESOLVED") resolved++;

        // SLA check (basic)
        const created = c.createdAt || Date.now();
        const slaLimit = 24 * 60 * 60 * 1000;

        if (Date.now() - created > slaLimit && c.status !== "RESOLVED") {
            breached++;
        }

        // Resolution time (if resolvedAt exists)
        if (c.resolvedAt) {
            totalResolutionTime += (c.resolvedAt - created);
            resolvedCount++;
        }
    });

    let avgTime = resolvedCount > 0
        ? (totalResolutionTime / resolvedCount) / (1000 * 60 * 60)
        : 0;

    dashboardCache = {
        totalCases: total,
        openCases: open,
        resolvedCases: resolved,
        breachedCases: breached,
        avgResolutionTime: avgTime.toFixed(2)
    };

    renderDashboard();
}


// ===============================
// 🖥️ RENDER DASHBOARD UI
// ===============================
function renderDashboard() {

    // These IDs MUST exist in your HTML
    const totalEl = document.getElementById("totalCases");
    const openEl = document.getElementById("openCases");
    const resolvedEl = document.getElementById("resolvedCases");
    const breachedEl = document.getElementById("breachedCases");
    const avgEl = document.getElementById("avgResolutionTime");

    if (totalEl) totalEl.innerText = dashboardCache.totalCases;
    if (openEl) openEl.innerText = dashboardCache.openCases;
    if (resolvedEl) resolvedEl.innerText = dashboardCache.resolvedCases;
    if (breachedEl) breachedEl.innerText = dashboardCache.breachedCases;
    if (avgEl) avgEl.innerText = dashboardCache.avgResolutionTime + " hrs";
}


// ===============================
// 📈 GENERATE REPORT DATA
// ===============================
function generateReportData(casesArray) {

    let report = {
        byIssueType: {},
        byStatus: {},
        byAgent: {}
    };

    casesArray.forEach(c => {

        // Issue type breakdown
        const issue = c.issueType || "UNKNOWN";
        report.byIssueType[issue] = (report.byIssueType[issue] || 0) + 1;

        // Status breakdown
        const status = c.status || "UNKNOWN";
        report.byStatus[status] = (report.byStatus[status] || 0) + 1;

        // Agent breakdown
        const agent = c.assignedTo || "UNASSIGNED";
        report.byAgent[agent] = (report.byAgent[agent] || 0) + 1;
    });

    return report;
}


// ===============================
// 📋 RENDER REPORT SECTION
// ===============================
function renderReports(casesArray) {

    const report = generateReportData(casesArray);

    const reportBox = document.getElementById("reportBox");
    if (!reportBox) return;

    let html = "";

    html += "<h3>📌 Issue Type Breakdown</h3>";
    for (let key in report.byIssueType) {
        html += `<p>${key}: ${report.byIssueType[key]}</p>`;
    }

    html += "<h3>📌 Status Breakdown</h3>";
    for (let key in report.byStatus) {
        html += `<p>${key}: ${report.byStatus[key]}</p>`;
    }

    html += "<h3>📌 Agent Workload</h3>";
    for (let key in report.byAgent) {
        html += `<p>${key}: ${report.byAgent[key]}</p>`;
    }

    reportBox.innerHTML = html;
}


// ===============================
// 🔄 DASHBOARD REFRESH PIPELINE
// ===============================
function refreshDashboard(casesArray) {

    updateDashboardMetrics(casesArray);
    renderReports(casesArray);
}


// ===============================
// ⚡ AUTO DASHBOARD UPDATE (optional live mode)
// ===============================
function startDashboardLiveMode(getCasesCallback, interval = 15000) {

    setInterval(async () => {
        try {
            const cases = await getCasesCallback();
            refreshDashboard(cases);
        } catch (err) {
            console.error("Dashboard live update failed", err);
        }
    }, interval);
}


// ===============================
// 🔍 CRM JS — PART 6
// Search + Filters Engine
// ===============================


// ===============================
// 📦 FILTER STATE
// ===============================
let filterState = {
    search: "",
    status: "ALL",
    issueType: "ALL",
    agent: "ALL"
};


// ===============================
// ⏱️ DEBOUNCE HELPER (for search input)
// ===============================
function debounce(func, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}


// ===============================
// 🔍 GLOBAL SEARCH HANDLER
// ===============================
const handleSearchInput = debounce(function (value) {
    filterState.search = value.toLowerCase().trim();
    applyFilters();
}, 300);


// ===============================
// 🎯 UPDATE FILTERS
// ===============================
function updateFilter(type, value) {
    filterState[type] = value;
    applyFilters();
}


// ===============================
// ⚙️ CORE FILTER PIPELINE
// ===============================
function applyFilters() {

    if (!window.allCasesCache) return;

    let filtered = [...window.allCasesCache];

    // ===========================
    // 🔍 SEARCH FILTER
    // ===========================
    if (filterState.search) {
        const q = filterState.search;

        filtered = filtered.filter(c =>
            (c.customerName || "").toLowerCase().includes(q) ||
            (c.phone || "").includes(q) ||
            (c.issueType || "").toLowerCase().includes(q) ||
            (c.status || "").toLowerCase().includes(q) ||
            (c.assignedTo || "").toLowerCase().includes(q)
        );
    }

    // ===========================
    // 📌 STATUS FILTER
    // ===========================
    if (filterState.status !== "ALL") {
        filtered = filtered.filter(c => c.status === filterState.status);
    }

    // ===========================
    // 🧾 ISSUE TYPE FILTER
    // ===========================
    if (filterState.issueType !== "ALL") {
        filtered = filtered.filter(c => c.issueType === filterState.issueType);
    }

    // ===========================
    // 👤 AGENT FILTER
    // ===========================
    if (filterState.agent !== "ALL") {
        filtered = filtered.filter(c => c.assignedTo === filterState.agent);
    }

    // Update UI
    renderCaseTable(filtered);
}


// ===============================
// 🧾 RENDER CASE TABLE (UI CORE)
// ===============================
function renderCaseTable(casesArray) {

    const table = document.getElementById("caseTableBody");
    if (!table) return;

    table.innerHTML = "";

    if (!casesArray || casesArray.length === 0) {
        table.innerHTML = `<tr><td colspan="6">No cases found</td></tr>`;
        return;
    }

    casesArray.forEach(c => {

        const row = `
        <tr>
            <td>${c.customerName || "-"}</td>
            <td>${c.phone || "-"}</td>
            <td>${c.issueType || "-"}</td>
            <td>${c.status || "-"}</td>
            <td>${c.assignedTo || "Unassigned"}</td>
            <td>
                <button onclick="openEditModal('${c.id}')">Edit</button>
                <button onclick="deleteCase('${c.id}')">Delete</button>
            </td>
        </tr>
        `;

        table.innerHTML += row;
    });
}


// ===============================
// 📥 SET GLOBAL CACHE (called from Part 4 loadCases)
// ===============================
function setCasesCache(casesArray) {
    window.allCasesCache = casesArray || [];
    applyFilters();
}


// ===============================
// 🔄 RESET ALL FILTERS
// ===============================
function resetFilters() {

    filterState = {
        search: "",
        status: "ALL",
        issueType: "ALL",
        agent: "ALL"
    };

    applyFilters();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";
}


// ===============================
// 📤 CRM JS — PART 7
// Export + WhatsApp + Copy Tools
// ===============================


// ===============================
// 📦 EXPORT FULL CSV (ENHANCED)
// ===============================
function exportToCSVEnhanced(casesArray = []) {

    if (!casesArray.length) {
        showToast("No data to export", "error");
        return;
    }

    let csv = "Customer Name,Phone,Issue Type,Status,Assigned To,Created At,Last Updated\n";

    casesArray.forEach(c => {
        csv += `"${c.customerName || ""}","${c.phone || ""}","${c.issueType || ""}","${c.status || ""}","${c.assignedTo || ""}","${formatDate(c.createdAt)}","${formatDate(c.lastUpdated)}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `crm_export_${Date.now()}.csv`;
    a.click();

    URL.revokeObjectURL(url);

    showToast("CSV exported successfully", "success");
}


// ===============================
// 📅 FORMAT DATE HELPER
// ===============================
function formatDate(timestamp) {
    if (!timestamp) return "-";
    const d = new Date(timestamp);
    return d.toLocaleString();
}


// ===============================
// 💬 GENERATE WHATSAPP MESSAGE
// ===============================
function generateWhatsAppMessage(caseData) {

    if (!caseData) return "";

    return `
Hello ${caseData.customerName || "Customer"},

We have received your issue:
📌 Issue: ${caseData.issueType || "N/A"}
📊 Status: ${caseData.status || "OPEN"}
👤 Assigned To: ${caseData.assignedTo || "Support Team"}

We will update you shortly.

- Support Team
`.trim();
}


// ===============================
// 📲 SEND ON WHATSAPP (OPEN LINK)
// ===============================
function sendWhatsApp(caseData) {

    if (!caseData || !caseData.phone) {
        showToast("Phone number missing", "error");
        return;
    }

    const message = encodeURIComponent(generateWhatsAppMessage(caseData));

    const phone = caseData.phone.replace(/\D/g, ""); // clean number

    const url = `https://wa.me/${phone}?text=${message}`;

    window.open(url, "_blank");

    logActivity("WHATSAPP_SENT", caseData.customerName);
}


// ===============================
// 📋 COPY CUSTOMER DETAILS
// ===============================
function copyCustomerDetails(caseData) {

    if (!caseData) return;

    const text = `
Customer Details:
-----------------------
Name: ${caseData.customerName || "-"}
Phone: ${caseData.phone || "-"}
Issue: ${caseData.issueType || "-"}
Status: ${caseData.status || "-"}
Assigned: ${caseData.assignedTo || "-"}
Created: ${formatDate(caseData.createdAt)}
    `.trim();

    navigator.clipboard.writeText(text)
        .then(() => showToast("Copied to clipboard", "success"))
        .catch(() => showToast("Copy failed", "error"));
}


// ===============================
// 📤 QUICK SHARE SUMMARY
// ===============================
function shareCaseSummary(caseData) {

    const summary = `
Case Summary:
Name: ${caseData.customerName}
Issue: ${caseData.issueType}
Status: ${caseData.status}
Assigned: ${caseData.assignedTo}
`;

    if (navigator.share) {
        navigator.share({
            title: "Case Summary",
            text: summary
        });
    } else {
        copyCustomerDetails(caseData);
    }
}


// ===============================
// ⚡ BULK EXPORT SELECTED CASES
// ===============================
function exportSelectedCases(selectedIds = []) {

    if (!window.allCasesCache) return;

    const selectedCases = window.allCasesCache.filter(c =>
        selectedIds.includes(c.id)
    );

    exportToCSVEnhanced(selectedCases);
}


// ===============================
// 🔥 CRM JS — PART 8 (FINAL)
// Delete + Admin + Initialization
// ===============================


// ===============================
// 🗑️ SAFE DELETE CASE (FINAL VERSION)
// ===============================
async function deleteCase(caseId) {

    if (!caseId) return;

    const confirmDelete = confirm("⚠️ Are you sure you want to delete this case?");
    if (!confirmDelete) return;

    try {
        await firebase.database().ref("cases/" + caseId).remove();

        logActivity("CASE_DELETED", caseId);

        showToast("Case deleted successfully", "success");

        loadCases(); // refresh

    } catch (err) {
        console.error("Delete Error:", err);
        showToast("Failed to delete case", "error");
    }
}


// ===============================
// 👑 ADMIN CHECK SYSTEM
// ===============================
function isAdmin(user) {

    if (!user) return false;

    // You can later replace this with Firebase role check
    const adminEmails = [
        "admin@crm.com",
        "support@crm.com"
    ];

    return adminEmails.includes(user.email);
}


// ===============================
// 🔒 PROTECTED ACTION WRAPPER
// ===============================
function requireAdminAction(user, callback) {

    if (!isAdmin(user)) {
        showToast("Access Denied: Admin only", "error");
        return;
    }

    callback();
}


// ===============================
// ⚙️ LOAD CASES (MAIN PIPELINE)
// ===============================
async function loadCases() {

    try {
        const snapshot = await firebase.database().ref("cases").once("value");

        const data = snapshot.val();

        const casesArray = data
            ? Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }))
            : [];

        // Cache globally
        window.allCasesCache = casesArray;

        // Feed into all systems
        setCasesCache(casesArray);      // Part 6 (filters)
        refreshDashboard(casesArray);   // Part 5 (dashboard)
        renderCaseTable(casesArray);    // Part 6 (table fallback)

    } catch (err) {
        console.error("Load Cases Error:", err);
        showToast("Failed to load cases", "error");
    }
}


// ===============================
// 🚀 CRM INITIALIZATION (BOOT SYSTEM)
// ===============================
function initCRM() {

    console.log("🚀 CRM Initializing...");

    // Check auth state first
    firebase.auth().onAuthStateChanged((user) => {

        if (user) {
            currentUser = user;

            document.getElementById("loginPage").style.display = "none";
            document.getElementById("dashboardPage").style.display = "block";

            loadCases();
        } else {
            currentUser = null;

            document.getElementById("dashboardPage").style.display = "none";
            document.getElementById("loginPage").style.display = "block";
        }
    });

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

    console.log("✅ CRM Ready");
}


// ===============================
// 🔄 FORCE REFRESH SYSTEM (ADMIN TOOL)
// ===============================
function forceRefreshSystem() {

    if (!currentUser) {
        showToast("Not logged in", "error");
        return;
    }

    loadCases();
    showToast("System refreshed", "success");
}


// ===============================
// 🧹 RESET CRM DATA (ADMIN ONLY)
// ===============================
async function resetAllData() {

    requireAdminAction(currentUser, async () => {

        const confirmReset = confirm("⚠️ This will delete ALL cases. Continue?");
        if (!confirmReset) return;

        try {
            await firebase.database().ref("cases").remove();

            logActivity("SYSTEM_RESET", "All cases deleted");

            showToast("All data reset", "success");

            loadCases();

        } catch (err) {
            console.error(err);
            showToast("Reset failed", "error");
        }
    });
}


// ===============================
// 📊 SYSTEM HEALTH CHECK
// ===============================
function systemHealthCheck() {

    const health = {
        firebase: !!firebase,
        auth: !!firebase?.auth,
        db: !!firebase?.database,
        userLoggedIn: !!currentUser,
        cacheLoaded: !!window.allCasesCache
    };

    console.log("🧠 CRM HEALTH:", health);

    return health;
}


// ===============================
// 🎯 GLOBAL EXPORT (DEBUG / DEV MODE)
// ===============================
window.crm = {
    loadCases,
    initCRM,
    deleteCase,
    forceRefreshSystem,
    resetAllData,
    systemHealthCheck,
    sendWhatsApp,
    exportToCSVEnhanced,
    copyCustomerDetails
};
