import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDn2Wl9jXQymaFNRCWR09abcYf_Fb6dKN4",
  authDomain: "amadrino-f3091.firebaseapp.com",
  projectId: "amadrino-f3091",
  storageBucket: "amadrino-f3091.appspot.com",  // Corrigido! (estava errado)
  messagingSenderId: "382818880105",
  appId: "1:382818880105:web:a1aec0cf8c6fd7c85070f8",
  measurementId: "G-07VPHCR7J2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById("login-btn").onclick = () => {
  signInWithPopup(auth, provider).then(result => {
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("conteudo").style.display = "block";
    console.log("Usuário autenticado:", result.user);
  }).catch(error => {
    console.error("Erro ao fazer login:", error);
    alert("Erro ao fazer login. Verifique se o domínio está autorizado no Firebase.");
  });
};

