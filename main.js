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

let contadores = {
  restaurante: 0,
  viagem: 0,
  cinema: 0,
};

let restaurantesRegistrados = {};

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
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;

  // Verificar restaurante repetido
  verificarRestauranteRepetido(descricao);

  // Atualizar contadores
  contarPalavras(descricao);
  atualizarTabela();

  await addDoc(collection(db, "anotacoes"), {
    data,
    descricao,
    criadoEm: new Date(),
  });

  alert("Anotação salva!");
  document.getElementById("form-anotacao").reset();
  document.getElementById("mensagem-restaurante").textContent = ""; // limpa mensagem
  carregarAnotacoes();
};

async function carregarAnotacoes() {
  const container = document.getElementById("anotacoes");
  container.innerHTML = "";
  restaurantesRegistrados = {};
  contadores = { restaurante: 0, viagem: 0, cinema: 0 };

  const q = query(collection(db, "anotacoes"), orderBy("data", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const anotacao = doc.data();
    const div = document.createElement("div");
    div.className = "anotacao";
    div.innerHTML = `<strong>${anotacao.data}</strong><p>${anotacao.descricao}</p>`;
    container.appendChild(div);
    contarPalavras(anotacao.descricao);
    registrarRestaurantes(anotacao.descricao);
  });
  atualizarTabela();
}

function contarPalavras(texto) {
  const palavras = texto.toLowerCase().split(/[\s,.!?]+/);
  for (let palavra of palavras) {
    if (contadores.hasOwnProperty(palavra)) {
      contadores[palavra]++;
    }
  }
}

function atualizarTabela() {
  const tabela = document.getElementById("tabela-contador");
  tabela.innerHTML = "<tr><th>Palavra</th><th>Contagem</th></tr>";
  for (const palavra in contadores) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${palavra}</td><td>${contadores[palavra]}</td>`;
    tabela.appendChild(tr);
  }
}

function registrarRestaurantes(texto) {
  const regex = /restaurante\s+([\wãõéíçêâôàáéú]+)/gi;
  let match;
  while ((match = regex.exec(texto)) !== null) {
    const nome = match[1].toLowerCase();
    if (!restaurantesRegistrados[nome]) {
      restaurantesRegistrados[nome] = 1;
    } else {
      restaurantesRegistrados[nome]++;
    }
  }
}

function verificarRestauranteRepetido(texto) {
  const mensagem = document.getElementById("mensagem-restaurante");
  mensagem.textContent = "";

  const regex = /restaurante\s+([\wãõéíçêâôàáéú]+)/gi;
  let match;
  while ((match = regex.exec(texto)) !== null) {
    const nome = match[1].toLowerCase();
    if (restaurantesRegistrados[nome]) {
      mensagem.textContent = `Você já foi ao restaurante "${nome}" ${restaurantesRegistrados[nome]}x antes.`;
    }
  }
}
