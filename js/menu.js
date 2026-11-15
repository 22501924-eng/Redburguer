const botaoMenu = document.querySelector("#abrir-menu");
const menu = document.querySelector("#menu");

// Fechar menu
function fecharMenu() {
  menu.classList.remove("aberto");
  botaoMenu.setAttribute("aria-expanded", "false");
  botaoMenu.setAttribute("aria-label", "Abrir menu");
}

// Botão de abrir e fechar menu
botaoMenu.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  botaoMenu.setAttribute("aria-expanded", aberto);
  botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
});

// Fechar menu ao escolher uma página
menu.addEventListener("click", (evento) => {
  if (evento.target.closest("a")) fecharMenu();
});

// Fechar menu com a tecla Escape
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && menu.classList.contains("aberto")) {
    fecharMenu();
    botaoMenu.focus();
  }
});

// Mostrar botões da conta conectada
if (usuarioAtual()) {
  const conta = document.querySelector("#conta");
  const perfil = document.createElement("a");
  perfil.className = "botao borda";
  perfil.href = "perfil.html";
  perfil.textContent = "Minha conta";

  const sair = document.createElement("button");
  sair.className = "botao";
  sair.id = "sair";
  sair.type = "button";
  sair.textContent = "Sair";
  // Sair da conta
  sair.addEventListener("click", () => {
    sessionStorage.removeItem("rb-sessao");
    window.location.href = "login.html";
  });

  conta.replaceChildren(perfil, sair);
}

// Atualizar sessão ao voltar pelo navegador
window.addEventListener("pageshow", (evento) => {
  if (evento.persisted) window.location.reload();
});
