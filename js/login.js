// Ler dados salvos no navegador
function lerDados(chave, padrao) {
  try {
    const texto = localStorage.getItem(chave);
    return texto ? JSON.parse(texto) : padrao;
  } catch {
    return padrao;
  }
}


// Salvar dados no navegador
function salvarDados(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch {
    throw new Error("Não foi possível salvar os dados. Confira se o navegador permite o armazenamento deste site e se há espaço disponível.");
  }
}


// Ler e conferir usuários cadastrados
function lerUsuarios() {
  let texto;
  try {
    texto = localStorage.getItem("rb-usuarios");
  } catch {
    throw new Error("Permita o armazenamento deste site no navegador para cadastrar ou entrar.");
  }
  if (!texto) return [];

  try {
    const usuarios = JSON.parse(texto);
    if (!Array.isArray(usuarios) || usuarios.some((usuario) =>
      !usuario || !Number.isSafeInteger(usuario.id) || usuario.id < 1 ||
      typeof usuario.nome !== "string" || typeof usuario.email !== "string" ||
      typeof usuario.senha_hash !== "string" || typeof usuario.sal !== "string" ||
      usuario.iteracoes !== 600000
    )) throw new Error();
    return usuarios;
  } catch {
    throw new Error("Os cadastros salvos neste navegador estão inválidos. Eles foram mantidos para evitar a perda dos dados.");
  }
}


// Buscar usuário conectado
function usuarioAtual() {
  try {
    const id = Number(sessionStorage.getItem("rb-sessao"));
    if (!id) return null;
    return lerUsuarios().find((usuario) => usuario.id === id) || null;
  } catch {
    return null;
  }
}

// Atualizar dados do usuário
function salvarUsuario(usuario) {
  const usuarios = lerUsuarios();
  const indice = usuarios.findIndex((outro) => outro.id === usuario.id);
  if (indice === -1) throw new Error("Entre novamente na sua conta para salvar os dados.");
  if (usuarios.some((outro) => outro.id !== usuario.id && outro.email.toLowerCase() === usuario.email.toLowerCase())) {
    throw new Error("Este e-mail já está cadastrado em outra conta.");
  }
  usuarios[indice] = usuario;
  salvarDados("rb-usuarios", usuarios);
}

// Definir página após o login
function destinoAposLogin() {
  const destino = new URLSearchParams(window.location.search).get("voltar");
  const paginas = ["index.html", "produtos.html", "pedidos.html", "carrinho.html", "perfil.html"];
  return paginas.includes(destino) ? destino : "index.html";
}

// Pedir login para acessar a página
function exigirLogin(destino) {
  const usuario = usuarioAtual();
  if (!usuario) window.location.replace("login.html?voltar=" + encodeURIComponent(destino));
  return usuario;
}

// Gerar hash da senha
async function criarHashSenha(senha, sal) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Abra o site pelo Live Server em localhost ou 127.0.0.1, ou use um endereço HTTPS.");
  }
  const codificador = new TextEncoder();
  const chave = await crypto.subtle.importKey(
    "raw", codificador.encode(senha), "PBKDF2", false, ["deriveBits"]
  );
  const resultado = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt: codificador.encode(sal),
    iterations: 600000,
    hash: "SHA-256",
  }, chave, 256);
  return Array.from(new Uint8Array(resultado), (numero) => numero.toString(16).padStart(2, "0")).join("");
}

// Conferir dados do item
function itemValido(item) {
  return item && Number.isSafeInteger(item.id) && item.id > 0 &&
    typeof item.nome === "string" && item.nome.trim() !== "" &&
    Number.isSafeInteger(item.preco) && item.preco > 0 &&
    Number.isInteger(item.quantidade) && item.quantidade >= 1 && item.quantidade <= 10 &&
    typeof item.imagem === "string" && /^[a-z0-9-]+$/.test(item.imagem);
}

// Identificar carrinho do usuário
function chaveCarrinho() {
  const usuario = usuarioAtual();
  return usuario ? "rb-carrinho-" + usuario.id : "rb-carrinho";
}

// Ler itens válidos do carrinho
function lerCarrinho(chave = chaveCarrinho()) {
  const itens = lerDados(chave, []);
  return Array.isArray(itens) ? itens.filter(itemValido) : [];
}

// Salvar carrinho do usuário
function salvarCarrinho(itens) {
  salvarDados(chaveCarrinho(), itens);
}

// Ler pedidos salvos
function lerPedidos() {
  const pedidos = lerDados("rb-pedidos", []);
  if (!Array.isArray(pedidos)) return [];
  return pedidos.filter((pedido) => pedido && Number.isSafeInteger(pedido.id) &&
    pedido.id > 0 && Number.isSafeInteger(pedido.total) && pedido.total >= 0 &&
    Array.isArray(pedido.itens) && pedido.itens.length > 0 && pedido.itens.every(itemValido));
}

// Abrir sessão e juntar carrinho do visitante
function entrarUsuario(usuario) {
  const visitante = lerCarrinho("rb-carrinho");
  if (visitante.length > 0) {
    const chave = "rb-carrinho-" + usuario.id;
    const carrinho = lerCarrinho(chave);
    visitante.forEach((item) => {
      const existente = carrinho.find((outro) => outro.id === item.id);
      if (existente) existente.quantidade = Math.min(10, existente.quantidade + item.quantidade);
      else carrinho.push(item);
    });
    salvarDados(chave, carrinho);
  }
  try {
    sessionStorage.setItem("rb-sessao", String(usuario.id));
  } catch {
    throw new Error("Não foi possível abrir a sessão. Permita o armazenamento deste site no navegador.");
  }
  if (visitante.length > 0) localStorage.removeItem("rb-carrinho");
}

// Botões de mostrar e esconder senha
document.querySelectorAll(".mostrar-senha").forEach((botao) => {
  botao.addEventListener("click", () => {
    const campo = document.getElementById(botao.dataset.campo);
    if (!campo) return;
    const mostrando = campo.type === "password";
    campo.type = mostrando ? "text" : "password";
    botao.setAttribute("aria-pressed", mostrando);
    botao.setAttribute("aria-label", mostrando ? "Esconder senha" : "Mostrar senha");
    const icone = botao.querySelector(".icone");
    if (icone) icone.classList.toggle("fechado", mostrando);
  });
});

// Manter destino ao trocar entre login e cadastro
if (new URLSearchParams(window.location.search).has("voltar")) {
  document.querySelectorAll('a[href="login.html"], a[href="cadastro.html"]').forEach((link) => {
    link.href = link.getAttribute("href") + "?voltar=" + encodeURIComponent(destinoAposLogin());
  });
}

const formLogin = document.querySelector("#form-login");
if (formLogin) {
  const botaoEntrar = document.querySelector("#entrar");
  const campoEmailLogin = document.querySelector("#email");
  const campoSenhaLogin = document.querySelector("#senha");
  const mensagemLogin = document.querySelector("#mensagem");

  // Mostrar mensagem do login
  function mostrarMensagemLogin(texto) {
    mensagemLogin.textContent = texto;
    mensagemLogin.hidden = false;
  }

  // Avisar que o cadastro foi concluído
  if (new URLSearchParams(window.location.search).get("cadastro") === "sucesso") {
    mostrarMensagemLogin("Conta criada! Entre com seu e-mail e sua senha.");
  }

  // Validar e-mail e senha para entrar
  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (botaoEntrar.disabled) return;
    mensagemLogin.hidden = true;
    campoEmailLogin.value = campoEmailLogin.value.trim().toLowerCase();
    if (!formLogin.reportValidity()) return;

    botaoEntrar.disabled = true;
    try {
      const usuario = lerUsuarios().find((outro) => outro.email.toLowerCase() === campoEmailLogin.value);
      if (!usuario || await criarHashSenha(campoSenhaLogin.value, usuario.sal) !== usuario.senha_hash) {
        mostrarMensagemLogin("E-mail ou senha incorretos.");
        return;
      }
      entrarUsuario(usuario);
      window.location.href = destinoAposLogin();
    } catch (erro) {
      mostrarMensagemLogin(erro.message);
    } finally {
      botaoEntrar.disabled = false;
    }
  });
}
