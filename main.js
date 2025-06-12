import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDn2Wl9jXQymaFNRCWR09abcYf_Fb6dKN4",
  authDomain: "amadrino-f3091.firebaseapp.com",
  projectId: "amadrino-f3091",
  storageBucket: "amadrino-f3091.appspot.com", // Corrigido! (estava errado)
  messagingSenderId: "382818880105",
  appId: "1:382818880105:web:a1aec0cf8c6fd7c85070f8",
  measurementId: "G-07VPHCR7J2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

document.getElementById("login-btn").onclick = () => {
  signInWithPopup(auth, provider).then((result) => {
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("conteudo").style.display = "block";
    carregarAnotacoes();
  });
};

document.getElementById("form-anotacao").onsubmit = async (e) => {
  e.preventDefault();
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;

  await addDoc(collection(db, "anotacoes"), {
    data,
    descricao,
    criadoEm: new Date(),
  });

  alert("Anotação salva!");
  document.getElementById("form-anotacao").reset();
  carregarAnotacoes();
};

async function carregarAnotacoes() {
  const container = document.getElementById("anotacoes");
  container.innerHTML = "";
  const q = query(collection(db, "anotacoes"), orderBy("data", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const anotacao = doc.data();
    const div = document.createElement("div");
    div.className = "anotacao";
    div.innerHTML = `<strong>${anotacao.data}</strong><p>${anotacao.descricao}</p>`;
    container.appendChild(div);
  });
}
