// Identificar produto pelo link
const parametros = new URLSearchParams(window.location.search);
const idProduto = parametros.get("produto");

const semPedidos = document.querySelector("#sem-pedidos");
const artigo = /^[1-9][0-9]*$/.test(idProduto) ? document.getElementById("pedido-" + idProduto) : null;

// Mostrar produto escolhido
if (artigo) {
  artigo.hidden = false;
  if (semPedidos) semPedidos.hidden = true;
  const produto = {
    id: Number(artigo.dataset.id),
    nome: artigo.dataset.nome,
    preco: Number(artigo.dataset.preco),
    imagem: artigo.dataset.imagem,
  };

  const campoQuantidade = artigo.querySelector(".quantidade");
  const botaoGuardar = artigo.querySelector(".guardar");

  // Adicionar produto ao carrinho
  botaoGuardar.addEventListener("click", () => {
    const quantidade = Number(campoQuantidade.value);
    const valida =
      campoQuantidade.value.trim() !== "" &&
      Number.isInteger(quantidade) &&
      quantidade >= 1 &&
      quantidade <= 10;

    if (!valida) {
      alert("Informe uma quantidade inteira de 1 a 10.");
      campoQuantidade.focus();
      return;
    }

    const carrinho = lerCarrinho();
    const existente = carrinho.find((item) => item.id === produto.id);

    if (existente) {
      if (existente.quantidade + quantidade > 10) {
        alert("O limite é de 10 unidades por produto. Ajuste a quantidade no carrinho.");
        return;
      }
      existente.quantidade += quantidade;
    } else {
      carrinho.push({ ...produto, quantidade });
    }

    try {
      salvarCarrinho(carrinho);
      window.location.href = "carrinho.html";
    } catch (erro) {
      alert(erro.message);
    }
  });
}
const listaPedidos = document.querySelector("#lista-pedidos");
const modeloPedido = document.querySelector("#modelo-pedido");

// Formatar valor em reais
function formatarReais(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Mostrar histórico do usuário
function mostrarHistorico() {
  if (!listaPedidos || !modeloPedido) return;

  listaPedidos.replaceChildren();
  const usuario = usuarioAtual();
  const pedidos = usuario ? lerPedidos().filter((pedido) => pedido.usuario_id === usuario.id) : [];

  pedidos.forEach((pedido) => {
    const copia = modeloPedido.content.cloneNode(true);

    copia.querySelector(".numero").textContent = pedido.id;
    copia.querySelector(".total strong").textContent = formatarReais(pedido.total);

    const itens = copia.querySelector(".itens");
    pedido.itens.forEach((item) => {
      const li = document.createElement("li");
      li.textContent =
        item.quantidade + "x " + item.nome + " - " +
        formatarReais(item.preco * item.quantidade);
      itens.appendChild(li);
    });

    listaPedidos.appendChild(copia);
  });

  if (pedidos.length > 0 && semPedidos && !idProduto) {
    semPedidos.hidden = true;
  }
}

// Avisar quando o produto não existe
if (idProduto && !artigo && semPedidos) {
  semPedidos.querySelector("h2").textContent = "Produto não encontrado.";
  semPedidos.querySelector("p").textContent = "Escolha um dos produtos disponíveis no cardápio.";
}

// Carregar histórico ao abrir a página
mostrarHistorico();
