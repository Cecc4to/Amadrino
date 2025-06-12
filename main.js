
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

      document.getElementById("descricao").addEventListener("input", () => {
        const texto = document.getElementById("descricao").value;
        verificarRestauranteRepetido(texto);
      });
    })
    .catch((error) => {
      console.error("Erro ao fazer login:", error);
    });
};

document.getElementById("form-anotacao").onsubmit = async (e) => {
  e.preventDefault();
  const data = document.getElementById("data").value;
  const descricao = document.getElementById("descricao").value;

  contarPalavras(descricao);
  atualizarTabela();

  const imagens = [];
  const imagemInputs = document.querySelectorAll(".imagem-bloco");
  for (const bloco of imagemInputs) {
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
  }

  const anotacao = {
    data: new Date(data),
    descricao,
    imagens,
    criadoEm: new Date(),
  };

  await addDoc(collection(db, "anotacoes"), anotacao);
  exibirAnotacaoNaLinhaDoTempo(anotacao);

  alert("Anotação salva!");
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
    let data = anotacao.data;
    if (data && data.seconds) {
      data = new Date(data.seconds * 1000);
    } else {
      data = new Date(data);
    }
    anotacao.data = data;

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    const chave = `${ano}-${mes}-${dia}`;

    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(anotacao);

    contarPalavras(anotacao.descricao);
    registrarRestaurantes(anotacao.descricao);
  });

  for (const chave of Object.keys(grupos).sort().reverse()) {
    const [ano, mes, dia] = chave.split("-");
    const divDia = document.createElement("div");
    divDia.id = `dia-${chave}`;
    divDia.className = "dia-bloco";
    divDia.innerHTML = `<h3>${dia}/${mes}/${ano}</h3>`;
    grupos[chave].forEach((anotacao) => {
      exibirAnotacaoNaLinhaDoTempo(anotacao, divDia);
    });
    container.appendChild(divDia);
  }

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
  mensagem.style.display = "none";

  const regex = /restaurante\s+([\wãõéíçêâôàáéú]+)/gi;
  let match;
  while ((match = regex.exec(texto)) !== null) {
    const nome = match[1].toLowerCase();
    if (restaurantesRegistrados[nome]) {
      mensagem.style.display = "inline";
    }
  }
}

document.getElementById("add-imagem").onclick = () => {
  const container = document.getElementById("imagem-container");
  const bloco = document.createElement("div");
  bloco.className = "imagem-bloco";
  bloco.innerHTML = `
    <input type="file" accept="image/*" class="imagem" />
    <input type="text" placeholder="Descrição da imagem" class="descricao-imagem" />
  `;
  container.appendChild(bloco);
};


function exibirAnotacaoNaLinhaDoTempo(anotacao) {
  const container = document.getElementById("anotacoes");

  const data = new Date(anotacao.data);
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  const chave = `${ano}-${mes}-${dia}`;
  const idDia = `dia-${chave}`;

  let divDia = document.getElementById(idDia);
  if (!divDia) {
    divDia = document.createElement("div");
    divDia.id = idDia;
    divDia.className = "dia-bloco";
    container.prepend(divDia);
  }

  const div = document.createElement("div");
  div.className = "anotacao";
  div.innerHTML = `<p><strong>${dia}/${mes}/${ano}</strong> - ${anotacao.descricao}</p>`;

  if (anotacao.imagens && anotacao.imagens.length) {
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
-${dia}`;
  const idDia = `dia-${chave}`;

  let divDia = targetDia || document.getElementById(idDia);
  if (!divDia) {
    divDia = document.createElement("div");
    divDia.id = idDia;
    divDia.className = "dia-bloco";
    divDia.innerHTML = `<h3>${dia}/${mes}/${ano}</h3>`;
    container.prepend(divDia);
  }

  const div = document.createElement("div");
  div.className = "anotacao";
  div.innerHTML = `<p>${anotacao.descricao}</p>`;

  if (anotacao.imagens && anotacao.imagens.length) {
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
