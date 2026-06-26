
// ===============================
// 📊 REPORTS.JS — FINAL MODULE
// Advanced CRM Analytics Engine
// ===============================


// ===============================
// 📌 SAFE GET CASES
// ===============================
function getAllCasesSafe() {
    return window.allCasesCache || [];
}


// ===============================
// 📊 GENERATE FULL ANALYTICS REPORT
// ===============================
function generateFullReport() {

    const cases = getAllCasesSafe();

    let report = {
        total: cases.length,
        open: 0,
        resolved: 0,
        breached: 0,

        issueMap: {},
        statusMap: {},
        agentMap: {},

        slaRiskCases: []
    };

    cases.forEach(c => {

        // =====================
        // STATUS ANALYSIS
        // =====================
        if (c.status === "OPEN") report.open++;
        if (c.status === "RESOLVED") report.resolved++;

        // =====================
        // SLA CHECK
        // =====================
        const created = c.createdAt || Date.now();
        const isBreached = (Date.now() - created) > (24 * 60 * 60 * 1000);

        if (isBreached && c.status !== "RESOLVED") {
            report.breached++;
            report.slaRiskCases.push(c);
        }

        // =====================
        // ISSUE BREAKDOWN
        // =====================
        const issue = c.issueType || "UNKNOWN";
        report.issueMap[issue] = (report.issueMap[issue] || 0) + 1;

        // =====================
        // STATUS BREAKDOWN
        // =====================
        const status = c.status || "UNKNOWN";
        report.statusMap[status] = (report.statusMap[status] || 0) + 1;

        // =====================
        // AGENT PERFORMANCE
        // =====================
        const agent = c.assignedTo || "UNASSIGNED";
        report.agentMap[agent] = (report.agentMap[agent] || 0) + 1;
    });

    return report;
}


// ===============================
// 📈 RENDER ADVANCED REPORT VIEW
// ===============================
function renderAdvancedReports() {

    const report = generateFullReport();

    const box = document.getElementById("reportBox");
    if (!box) return;

    let html = "";

    // =====================
    // SUMMARY SECTION
    // =====================
    html += `
        <h2>📊 CRM Analytics Report</h2>
        <p>Total Cases: <b>${report.total}</b></p>
        <p>Open: <b>${report.open}</b></p>
        <p>Resolved: <b>${report.resolved}</b></p>
        <p>SLA Breached: <b>${report.breached}</b></p>
        <hr>
    `;

    // =====================
    // ISSUE BREAKDOWN
    // =====================
    html += `<h3>📌 Issue Breakdown</h3>`;
    for (let key in report.issueMap) {
        html += `<p>${key}: ${report.issueMap[key]}</p>`;
    }

    // =====================
    // STATUS BREAKDOWN
    // =====================
    html += `<h3>📌 Status Breakdown</h3>`;
    for (let key in report.statusMap) {
        html += `<p>${key}: ${report.statusMap[key]}</p>`;
    }

    // =====================
    // AGENT PERFORMANCE
    // =====================
    html += `<h3>👤 Agent Performance</h3>`;
    for (let key in report.agentMap) {
        html += `<p>${key}: ${report.agentMap[key]} cases</p>`;
    }

    // =====================
    // SLA RISK SECTION
    // =====================
    html += `<h3>⚠️ SLA Risk Cases</h3>`;

    if (report.slaRiskCases.length === 0) {
        html += `<p>No SLA risk cases 🎉</p>`;
    } else {
        report.slaRiskCases.forEach(c => {
            html += `
                <div style="padding:8px;border:1px solid #ccc;margin:5px 0;">
                    <b>${c.customerName}</b><br>
                    ${c.issueType} - ${c.status}
                </div>
            `;
        });
    }

    box.innerHTML = html;
}


// ===============================
// 📊 AGENT RANKING SYSTEM
// ===============================
function getTopAgents(limit = 5) {

    const report = generateFullReport();

    const sorted = Object.entries(report.agentMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

    return sorted.map(([agent, count]) => ({
        agent,
        cases: count
    }));
}


// ===============================
// 📉 ISSUE TREND ANALYSIS
// ===============================
function getIssueTrends() {

    const report = generateFullReport();

    return Object.entries(report.issueMap)
        .sort((a, b) => b[1] - a[1]);
}


// ===============================
// ⚡ QUICK INSIGHT ENGINE
// ===============================
function getQuickInsights() {

    const report = generateFullReport();

    return {
        busiestAgent: getTopAgents(1)[0] || null,
        topIssue: getIssueTrends()[0] || null,
        slaRisk: report.slaRiskCases.length,
        resolutionRate: report.total
            ? ((report.resolved / report.total) * 100).toFixed(2)
            : 0
    };
}


// ===============================
// 🔄 AUTO REPORT REFRESH
// ===============================
function startReportAutoRefresh(interval = 20000) {

    setInterval(() => {
        renderAdvancedReports();
    }, interval);
}