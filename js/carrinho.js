const lista = document.querySelector("#lista-carrinho");
const modelo = document.querySelector("#modelo-item");
const semItens = document.querySelector("#sem-itens");
const subtotalEl = document.querySelector("#subtotal");
const totalEl = document.querySelector("#total strong");
const botaoFinalizar = document.querySelector("#finalizar");
const mensagemCarrinho = document.querySelector("#mensagem-carrinho");
let finalizando = false;

// Mostrar erro no carrinho
function mostrarErroCarrinho(texto) {
  mensagemCarrinho.textContent = texto;
  mensagemCarrinho.hidden = false;
}

// Formatar valor em reais
function formatarReais(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Calcular total do carrinho
function calcularTotal(carrinho) {
  return carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
}

// Mostrar itens e total do carrinho
function mostrarCarrinho() {
  const carrinho = lerCarrinho();
  lista.replaceChildren();

  carrinho.forEach((item) => {
    const copia = modelo.content.cloneNode(true);
    copia.querySelector(".nome").textContent = item.nome;
    copia.querySelector(".preco").textContent = formatarReais(item.preco);
    copia.querySelector(".subtotal-item").textContent = formatarReais(item.preco * item.quantidade);

    const imagem = copia.querySelector(".imagem");
    imagem.classList.add(item.imagem);
    imagem.setAttribute("aria-label", item.nome);

    const campoQuantidade = copia.querySelector(".quantidade");
    campoQuantidade.value = item.quantidade;
    // Alterar quantidade do produto
    campoQuantidade.addEventListener("change", () => {
      mensagemCarrinho.hidden = true;
      const nova = Number(campoQuantidade.value);
      if (campoQuantidade.value.trim() === "" || !Number.isInteger(nova) || nova < 1 || nova > 10) {
        mostrarErroCarrinho("Informe uma quantidade inteira de 1 a 10.");
      } else {
        const atual = lerCarrinho();
        const produto = atual.find((outro) => outro.id === item.id);
        if (produto) produto.quantidade = nova;
        try {
          salvarCarrinho(atual);
        } catch (erro) {
          mostrarErroCarrinho(erro.message);
        }
      }
      mostrarCarrinho();
    });

    // Remover produto do carrinho
    copia.querySelector(".remover").addEventListener("click", () => {
      mensagemCarrinho.hidden = true;
      try {
        salvarCarrinho(lerCarrinho().filter((outro) => outro.id !== item.id));
      } catch (erro) {
        mostrarErroCarrinho(erro.message);
      }
      mostrarCarrinho();
    });

    lista.appendChild(copia);
  });

  const total = calcularTotal(carrinho);
  subtotalEl.textContent = formatarReais(total);
  totalEl.textContent = formatarReais(total);
  semItens.hidden = carrinho.length > 0;
  botaoFinalizar.disabled = finalizando || carrinho.length === 0;
}


// Montar dados do pedido para o JSON
function montarTabelaPedido(pedido, usuario, endereco) {

  const produtos = pedido.itens.map((item) => {
    return item.quantidade + "x " + item.nome;
  }).join("; ");

  const enderecoCompleto = [
    endereco.rua + ", " + endereco.numero,
    endereco.complemento,
    endereco.bairro,
    endereco.cidade + "/" + endereco.uf,
    "CEP " + endereco.cep
  ].filter(Boolean).join(", ");

  return {
    usuario_nome: usuario.nome,
    usuario_email: usuario.email,
    produtos_comprados: produtos,
    endereco_entrega: enderecoCompleto,
    data_hora: pedido.data_hora,
    total: Number((pedido.total / 100).toFixed(2))
  };
}



// Baixar pedido em JSON
function baixarJson(nomeArquivo, dados) {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Finalizar pedido e salvar no histórico
botaoFinalizar.addEventListener("click", () => {
  if (finalizando) return;
  const carrinho = lerCarrinho();
  if (carrinho.length === 0) return;

  const usuario = exigirLogin("carrinho.html");
  if (!usuario) return;
  const endereco = usuario.endereco;
  if (!endereco || ["cep", "rua", "numero", "bairro", "cidade", "uf"].some((campo) => !endereco[campo])) {
    alert("Salve seu endereço no perfil antes de finalizar o pedido.");
    window.location.href = "perfil.html#endereco";
    return;
  }

  finalizando = true;
  botaoFinalizar.disabled = true;
  mensagemCarrinho.hidden = true;

  try {
    const pedidos = lerPedidos();
    const ultimoSalvo = lerDados("rb-ultimo-pedido", 0);
    const maiorId = pedidos.reduce((maior, pedido) => Math.max(maior, pedido.id), 0);
    const pedido = {
      id: Math.max(maiorId, Number.isSafeInteger(ultimoSalvo) ? ultimoSalvo : 0) + 1,
      usuario_id: usuario.id,
      data_hora: new Date().toISOString(),
      itens: carrinho.map((item) => ({ ...item })),
      total: calcularTotal(carrinho),
    };

    const tabela = montarTabelaPedido(pedido, usuario, endereco);
    salvarDados("rb-ultimo-pedido", pedido.id);
    salvarDados("rb-pedidos", [...pedidos, pedido]);
    localStorage.removeItem(chaveCarrinho());
    baixarJson("pedido-" + pedido.id + ".json", tabela);
    window.location.href = "pedidos.html";
  } catch (erro) {
    finalizando = false;
    mostrarErroCarrinho(erro.message);
    mostrarCarrinho();
  }
});

// Carregar carrinho ao abrir a página
mostrarCarrinho();
