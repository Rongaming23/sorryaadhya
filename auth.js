// ===============================
// UNISERVE CRM
// auth.js
// ===============================

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// -------------------------------
// LOGIN
// -------------------------------

window.login = async function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const msg = document.getElementById("msg");

    msg.style.color = "#ef4444";
    msg.innerHTML = "";

    if (!email || !password) {
        msg.innerHTML = "Please enter email and password.";
        return;
    }

    try {

        // Keep user logged in
        await setPersistence(auth, browserLocalPersistence);

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        msg.style.color = "#16a34a";
        msg.innerHTML = "Login Successful...";

        setTimeout(() => {

            window.location.href = "index.html";

        }, 800);

    } catch (error) {

        switch (error.code) {

            case "auth/invalid-email":
                msg.innerHTML = "Invalid email address.";
                break;

            case "auth/user-not-found":
                msg.innerHTML = "User not found.";
                break;

            case "auth/wrong-password":
                msg.innerHTML = "Incorrect password.";
                break;

            case "auth/invalid-credential":
                msg.innerHTML = "Invalid email or password.";
                break;

            default:
                msg.innerHTML = error.message;

        }

    }

};

// -------------------------------
// LOGOUT
// -------------------------------

window.logout = async function () {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

};

// -------------------------------
// AUTH CHECK
// -------------------------------

onAuthStateChanged(auth, (user) => {

    const page = window.location.pathname
        .split("/")
        .pop();

    // User is NOT logged in
    if (!user) {

        if (page !== "login.html") {

            window.location.href = "login.html";

        }

        return;

    }

    // User IS logged in
    if (page === "login.html") {

        window.location.href = "index.html";

    }

});

// -------------------------------
// USER DETAILS
// -------------------------------

window.currentUser = function () {

    return auth.currentUser;

};

window.currentEmail = function () {

    return auth.currentUser
        ? auth.currentUser.email
        : "";

};

window.isAdmin = function () {

    if (!auth.currentUser) return false;

    return auth.currentUser.email === "sankudas@crm.com";

};