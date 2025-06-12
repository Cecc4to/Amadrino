import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  // Coloque// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDn2Wl9jXQymaFNRCWR09abcYf_Fb6dKN4",
  authDomain: "amadrino-f3091.firebaseapp.com",
  projectId: "amadrino-f3091",
  storageBucket: "amadrino-f3091.firebasestorage.app",
  messagingSenderId: "382818880105",
  appId: "1:382818880105:web:a1aec0cf8c6fd7c85070f8",
  measurementId: "G-07VPHCR7J2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); suas credenciais do Firebase aqui
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById("login-btn").onclick = () => {
  signInWithPopup(auth, provider).then(result => {
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("conteudo").style.display = "block";
    // aqui carregaremos os dados do Firebase futuramente
  });
};
