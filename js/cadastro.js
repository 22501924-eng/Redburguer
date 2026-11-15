const form = document.querySelector("#form-cadastro");
const botaoCadastrar = document.querySelector("#cadastrar");
const campoNome = document.querySelector("#nome");
const campoEmail = document.querySelector("#email");
const campoSenha = document.querySelector("#nova-senha");
const campoConfirmar = document.querySelector("#confirmar-senha");
const mensagem = document.querySelector("#mensagem");

// Mostrar mensagem do cadastro
function mostrarMensagem(texto) {
  mensagem.textContent = texto;
  mensagem.hidden = false;
}

// Validar e cadastrar usuário
form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (botaoCadastrar.disabled) return;
  mensagem.hidden = true;
  campoNome.value = campoNome.value.trim();
  campoEmail.value = campoEmail.value.trim().toLowerCase();
  if (!form.reportValidity()) return;

  if (campoSenha.value !== campoConfirmar.value) {
    mostrarMensagem("As senhas não são iguais.");
    campoConfirmar.focus();
    return;
  }

  botaoCadastrar.disabled = true;
  try {
    const email = campoEmail.value;
    if (lerUsuarios().some((usuario) => usuario.email.toLowerCase() === email)) {
      mostrarMensagem("Este e-mail já está cadastrado. Entre na sua conta.");
      return;
    }
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Abra o site pelo Live Server em localhost ou 127.0.0.1, ou use um endereço HTTPS.");
    }
    const sal = Array.from(crypto.getRandomValues(new Uint8Array(16)),
      (numero) => numero.toString(16).padStart(2, "0")).join("");
    const senhaHash = await criarHashSenha(campoSenha.value, sal);
    const usuarios = lerUsuarios();
    if (usuarios.some((usuario) => usuario.email.toLowerCase() === email)) {
      mostrarMensagem("Este e-mail já está cadastrado. Entre na sua conta.");
      return;
    }

    usuarios.push({
      id: usuarios.reduce((maior, usuario) => Math.max(maior, usuario.id), 0) + 1,
      nome: campoNome.value,
      email,
      telefone: "",
      endereco: null,
      senha_hash: senhaHash,
      sal,
      iteracoes: 600000,
    });
    salvarDados("rb-usuarios", usuarios);
    window.location.href = "login.html?cadastro=sucesso&voltar=" + encodeURIComponent(destinoAposLogin());
  } catch (erro) {
    mostrarMensagem(erro.message);
  } finally {
    botaoCadastrar.disabled = false;
  }
});
