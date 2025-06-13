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
  storageBucket: "amadrino-f3091.appspot.com",
  messagingSenderId: "382818880105",
  appId: "1:382818880105:web:a1aec0cf8c6fd7c85070f8",
  measurementId: "G-07VPHCR7J2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

document.getElementById("login-btn").onclick = () => {
  signInWithPopup(auth, provider)
    .then(() => {
      document.getElementById("login-btn").style.display = "none";
      document.getElementById("conteudo").style.display = "block";
      carregarAnotacoes();
    })
    .catch((error) => {
      console.error("Erro ao fazer login:", error);
    });
};

document.getElementById("form-anotacao").onsubmit = async (e) => {
  e.preventDefault();
  const dataStr = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;

  const dataObj = new Date(dataStr);
  const anotacao = {
    data: dataObj,
    descricao,
    criadoEm: new Date(),
  };

  await addDoc(collection(db, "anotacoes"), anotacao);
  exibirNaLinhaDoTempo(anotacao);
  document.getElementById("form-anotacao").reset();
};

function formatarData(data) {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function exibirNaLinhaDoTempo(anotacao) {
  const container = document.getElementById("anotacoes");
  const dataFormatada = formatarData(new Date(anotacao.data));

  const div = document.createElement("div");
  div.className = "anotacao";
  div.innerHTML = `<p><strong>${dataFormatada}</strong> - ${anotacao.descricao}</p>`;
  container.prepend(div);
}

async function carregarAnotacoes() {
  const container = document.getElementById("anotacoes");
  container.innerHTML = "";

  const q = query(collection(db, "anotacoes"), orderBy("data", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const anotacao = doc.data();
    anotacao.data = new Date(anotacao.data.seconds * 1000);
    exibirNaLinhaDoTempo(anotacao);
  });
}
