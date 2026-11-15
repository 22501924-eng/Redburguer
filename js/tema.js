const body = document.body;
const botaoTema = document.querySelector("#trocar-tema");
const botaoPerfil = document.querySelector("#tema-perfil");

// Aplicar e salvar tema
function aplicarTema(tema) {
  const escuro = tema === "escuro";

  body.classList.toggle("escuro", escuro);
  body.classList.toggle("claro", !escuro);
  try {
    localStorage.setItem("rb-tema", escuro ? "escuro" : "claro");
  } catch {}

  if (botaoTema) {
    botaoTema.setAttribute("aria-pressed", escuro);
    botaoTema.setAttribute(
      "aria-label",
      escuro ? "Ativar modo claro" : "Ativar modo escuro"
    );
  }

  if (botaoPerfil) {
    botaoPerfil.setAttribute("aria-checked", escuro);
  }
}

// Alternar entre tema claro e escuro
function alternarTema() {
  const novoTema = body.classList.contains("escuro") ? "claro" : "escuro";
  aplicarTema(novoTema);
}

// Botão de tema no cabeçalho
if (botaoTema) {
  botaoTema.addEventListener("click", alternarTema);
}

// Botão de tema no perfil
if (botaoPerfil) {
  botaoPerfil.addEventListener("click", alternarTema);
}
// Carregar tema salvo
let temaSalvo = "claro";
try {
  temaSalvo = localStorage.getItem("rb-tema") || "claro";
} catch {}
aplicarTema(temaSalvo);