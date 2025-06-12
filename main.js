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

let contadores = { restaurante: 0, viagem: 0, cinema: 0 };
let restaurantesRegistrados = {};

document.getElementById("login-btn").onclick = () => {
  signInWithPopup(auth, provider)
    .then(() => {
      document.getElementById("login-btn").style.display = "none";
      document.getElementById("conteudo").style.display = "block";
      carregarAnotacoes();

      document.getElementById("descricao").addEventListener("input", () => {
        verificarRestauranteRepetido(document.getElementById("descricao").value);
      });
    })
    .catch(console.error);
};

document.getElementById("form-anotacao").onsubmit = async (e) => {
  e.preventDefault();
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;
  contarPalavras(descricao);
  atualizarTabela();

  const imagens = [];
  document.querySelectorAll(".imagem-bloco").forEach(async (bloco) => {
    const fileInput = bloco.querySelector(".imagem");
    const descInput = bloco.querySelector(".descricao-imagem");
    if (fileInput.files[0]) {
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(fileInput.files[0]);
      });
      imagens.push({ src: base64, descricao: descInput.value });
    }
  });

  const anotacao = {
    data: new Date(data),
    descricao,
    imagens,
    criadoEm: new Date(),
  };

  await addDoc(collection(db, "anotacoes"), anotacao);
  exibirAnotacaoNaLinhaDoTempo(anotacao);
  document.getElementById("form-anotacao").reset();
  document.getElementById("mensagem-restaurante").style.display = "none";
};

async function carregarAnotacoes() {
  const container = document.getElementById("anotacoes");
  container.innerHTML = "";
  restaurantesRegistrados = {};
  contadores = { restaurante: 0, viagem: 0, cinema: 0 };

  const q = query(collection(db, "anotacoes"), orderBy("data", "desc"));
  const snapshot = await getDocs(q);
  const grupos = {};

  snapshot.forEach((doc) => {
    const anotacao = doc.data();
    let data = new Date(anotacao.data?.seconds ? anotacao.data.seconds * 1000 : anotacao.data);
    anotacao.data = data;
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
    (grupos[chave] ||= []).push(anotacao);
    contarPalavras(anotacao.descricao);
    registrarRestaurantes(anotacao.descricao);
  });

  for (const chave of Object.keys(grupos).sort().reverse()) {
    const [ano, mes, dia] = chave.split("-");
    const divDia = document.createElement("div");
    divDia.id = `dia-${chave}`;
    divDia.className = "dia-bloco";
    divDia.innerHTML = `<h3>${dia}/${mes}/${ano}</h3>`;
    grupos[chave].forEach((anotacao) => exibirAnotacaoNaLinhaDoTempo(anotacao, divDia));
    container.appendChild(divDia);
  }

  atualizarTabela();
}

function exibirAnotacaoNaLinhaDoTempo(anotacao, divDia = null) {
  const container = document.getElementById("anotacoes");
  const data = new Date(anotacao.data);
  const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
  const idDia = `dia-${chave}`;

  if (!divDia) {
    divDia = document.getElementById(idDia) || document.createElement("div");
    divDia.id = idDia;
    divDia.className = "dia-bloco";
    divDia.innerHTML = `<h3>${data.getDate().toString().padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}</h3>`;
    container.prepend(divDia);
  }

  const div = document.createElement("div");
  div.className = "anotacao";
  div.innerHTML = `<p><strong>${data.getDate().toString().padStart(2, "0")}/${String(data.getMonth() + 1).padStart(2, "0")}/${data.getFullYear()}</strong> - ${anotacao.descricao}</p>`;

  if (anotacao.imagens?.length) {
    anotacao.imagens.forEach((imgObj) => {
      const img = document.createElement("img");
      img.src = imgObj.src;
      img.style = "width: 100%; margin-top: 10px;";
      div.appendChild(img);
      const desc = document.createElement("p");
      desc.textContent = imgObj.descricao;
      desc.style = "font-style: italic; font-size: 0.9em;";
      div.appendChild(desc);
    });
  }

  divDia.appendChild(div);
}

function contarPalavras(texto) {
  texto.toLowerCase().split(/[\s,.!?]+/).forEach(p => contadores[p] !== undefined && contadores[p]++);
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
    restaurantesRegistrados[nome] = (restaurantesRegistrados[nome] || 0) + 1;
  }
}

function verificarRestauranteRepetido(texto) {
  const mensagem = document.getElementById("mensagem-restaurante");
  mensagem.style.display = "none";
  const regex = /restaurante\s+([\wãõéíçêâôàáéú]+)/gi;
  let match;
  while ((match = regex.exec(texto)) !== null) {
    const nome = match[1].toLowerCase();
    if (restaurantesRegistrados[nome]) {
      mensagem.style.display = "inline";
      break;
    }
  }
}

document.getElementById("add-imagem").onclick = () => {
  const container = document.getElementById("imagem-container");
  const bloco = document.createElement("div");
  bloco.className = "imagem-bloco";
  bloco.innerHTML = \`
    <input type="file" accept="image/*" class="imagem" />
    <input type="text" placeholder="Descrição da imagem" class="descricao-imagem" />
  \`;
  container.appendChild(bloco);
};
