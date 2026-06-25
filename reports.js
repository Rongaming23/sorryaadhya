import { db } from "./firebase.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.exportCSV = async function(){

const snapshot = await getDocs(
collection(db,"cases")
);

let csv =
"Ticket ID,Name,Phone,Order ID,Order Date,Outlet,Issue,Concern,Delivery Partner,Status,Agent,Created At\n";

snapshot.forEach(doc=>{

const d = doc.data();

csv += `"${d.ticketId||""}",`;
csv += `"${d.name||""}",`;
csv += `"${d.phone||""}",`;
csv += `"${d.orderId||""}",`;
csv += `"${d.orderDate||""}",`;
csv += `"${d.outlet||""}",`;
csv += `"${d.issue||""}",`;
csv += `"${d.concern||""}",`;
csv += `"${d.deliveryPartner||""}",`;
csv += `"${d.status||""}",`;
csv += `"${d.agent||""}",`;
csv += `"${d.createdAt||""}"\n`;

});

const blob = new Blob([csv],{
type:"text/csv;charset=utf-8;"
});

const url =
window.URL.createObjectURL(blob);

const a =
document.createElement("a");

a.href = url;
a.download =
"CRM_Report.csv";

a.click();

window.URL.revokeObjectURL(url);

};

window.agentPerformance = async function(){

const snapshot = await getDocs(
collection(db,"cases")
);

let stats = {};

snapshot.forEach(doc=>{

const d = doc.data();

if(!stats[d.agent]){

stats[d.agent] = 0;

}

stats[d.agent]++;

});

let html = "<h3>Agent Performance</h3><br>";

Object.keys(stats).forEach(agent=>{

html += `
<div class="card" style="margin-bottom:10px;">
<b>${agent}</b><br>
Cases Handled : ${stats[agent]}
</div>
`;

});

document.getElementById("reportArea")
.innerHTML = html;

};
