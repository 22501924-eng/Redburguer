// Manter somente números
function apenasDigitos(texto) {
  return texto.replace(/\D/g, "");
}

// Formatar CEP
function mascararCep(valor) {
  const digitos = apenasDigitos(valor).slice(0, 8);
  return digitos.length > 5 ? digitos.slice(0, 5) + "-" + digitos.slice(5) : digitos;
}

// Formatar telefone com DDD
function mascararTelefone(valor) {
  const digitos = apenasDigitos(valor).slice(0, 11);
  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return "(" + digitos;
  if (digitos.length <= 6) return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2);
  if (digitos.length <= 10) {
    return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 6) + "-" + digitos.slice(6);
  }
  return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 7) + "-" + digitos.slice(7);
}

// Conferir login antes de abrir o perfil
const usuarioPerfil = exigirLogin("perfil.html");
if (usuarioPerfil) {
  // Carregar dados pessoais
  const formPerfil = document.querySelector("#form-perfil");
  const campoNome = document.querySelector("#nome");
  const campoEmail = document.querySelector("#email");
  const campoTelefone = document.querySelector("#telefone");
  const nomePerfil = document.querySelector("#nome-perfil");
  const mensagemPerfil = document.querySelector("#mensagem-perfil");

  campoNome.value = usuarioPerfil.nome;
  campoEmail.value = usuarioPerfil.email;
  campoTelefone.value = mascararTelefone(usuarioPerfil.telefone || "");
  nomePerfil.textContent = usuarioPerfil.nome;

  // Salvar alterações do perfil
  formPerfil.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensagemPerfil.hidden = true;
    campoNome.value = campoNome.value.trim();
    campoEmail.value = campoEmail.value.trim().toLowerCase();
    if (!formPerfil.reportValidity()) return;

    const telefone = apenasDigitos(campoTelefone.value);
    if (telefone && telefone.length !== 10 && telefone.length !== 11) {
      mensagemPerfil.textContent = "Informe o telefone com DDD, usando 10 ou 11 números.";
      mensagemPerfil.hidden = false;
      campoTelefone.focus();
      return;
    }

    const usuario = exigirLogin("perfil.html");
    if (!usuario) return;
    usuario.nome = campoNome.value;
    usuario.email = campoEmail.value;
    usuario.telefone = telefone;

    try {
      salvarUsuario(usuario);
      nomePerfil.textContent = usuario.nome;
      mensagemPerfil.textContent = "Dados salvos com sucesso.";
    } catch (erro) {
      mensagemPerfil.textContent = erro.message;
    }
    mensagemPerfil.hidden = false;
  });

  // Formatar telefone ao digitar
  campoTelefone.addEventListener("input", () => {
    campoTelefone.value = mascararTelefone(campoTelefone.value);
  });

  // Endereço
  const formEndereco = document.querySelector("#form-endereco");
  const campoCep = document.querySelector("#cep");
  const campoUf = document.querySelector("#uf");
  const botaoAbrirEndereco = document.querySelector("#abrir-endereco");
  const botaoFecharEndereco = document.querySelector("#fechar-endereco");
  const textoEndereco = document.querySelector("#endereco-salvo");
  const mensagemEndereco = document.querySelector("#mensagem-endereco");
  const camposEndereco = ["cep", "rua", "numero", "complemento", "bairro", "cidade", "uf"];
  let endereco = usuarioPerfil.endereco;

  // Preencher formulário com o endereço salvo
  function preencherFormulario() {
    camposEndereco.forEach((campo) => {
      document.getElementById(campo).value = endereco ? endereco[campo] || "" : "";
    });
    campoCep.value = mascararCep(campoCep.value);
  }

  // Mostrar endereço no perfil
  function mostrarEndereco() {
    if (!endereco) {
      textoEndereco.hidden = true;
      return;
    }
    const numeroComplemento = endereco.complemento
      ? endereco.numero + ", " + endereco.complemento : endereco.numero;
    textoEndereco.textContent = endereco.rua + ", " + numeroComplemento + " - " +
      endereco.bairro + " - " + endereco.cidade + "/" + endereco.uf +
      " - CEP " + mascararCep(endereco.cep);
    textoEndereco.hidden = false;
    botaoAbrirEndereco.textContent = "Editar endereço";
  }

  // Formatar CEP ao digitar
  campoCep.addEventListener("input", () => {
    campoCep.value = mascararCep(campoCep.value);
  });

  // Deixar a sigla do estado em maiúsculas
  campoUf.addEventListener("input", () => {
    campoUf.value = campoUf.value.toUpperCase();
  });

  // Validar e salvar endereço
  formEndereco.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensagemEndereco.hidden = true;
    camposEndereco.forEach((campo) => {
      const input = document.getElementById(campo);
      input.value = input.value.trim();
    });
    campoUf.value = campoUf.value.toUpperCase();
    if (!formEndereco.reportValidity()) return;

    const novo = {};
    camposEndereco.forEach((campo) => {
      novo[campo] = document.getElementById(campo).value;
    });
    novo.cep = apenasDigitos(novo.cep);

    const usuario = exigirLogin("perfil.html");
    if (!usuario) return;
    usuario.endereco = novo;
    try {
      salvarUsuario(usuario);
      endereco = novo;
      mostrarEndereco();
      formEndereco.hidden = true;
      mensagemEndereco.textContent = "Endereço salvo com sucesso.";
    } catch (erro) {
      mensagemEndereco.textContent = erro.message;
    }
    mensagemEndereco.hidden = false;
  });

  // Abrir formulário de endereço
  botaoAbrirEndereco.addEventListener("click", () => {
    preencherFormulario();
    mensagemEndereco.hidden = true;
    formEndereco.hidden = false;
    campoCep.focus();
  });

  // Cancelar edição do endereço
  botaoFecharEndereco.addEventListener("click", () => {
    formEndereco.hidden = true;
    mensagemEndereco.hidden = true;
    botaoAbrirEndereco.focus();
  });

  // Carregar endereço ao abrir o perfil
  mostrarEndereco();
  // Abrir cadastro de endereço pelo link
  if (window.location.hash === "#endereco" && !endereco) {
    preencherFormulario();
    formEndereco.hidden = false;
    campoCep.focus();
  }
}
