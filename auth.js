import { auth } from "./firebase.js";

import {
signInWithEmailAndPassword,
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.login = async function(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

await signInWithEmailAndPassword(
auth,
email,
password
);

if(email.includes("admin")){
window.location.href="admin.html";
}else{
window.location.href="agent.html";
}

}catch(error){

document.getElementById("message").innerHTML =
error.message;

}

}

window.register = async function(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

await createUserWithEmailAndPassword(
auth,
email,
password
);

document.getElementById("message").innerHTML =
"Agent Registered Successfully";

}catch(error){

document.getElementById("message").innerHTML =
error.message;

}

}

