const campoBusca = document.querySelector("#buscar-produto");
const cartoes = document.querySelectorAll(".produto");
const botoesCategoria = document.querySelectorAll("#categorias [data-categoria]");
const semProdutos = document.querySelector("#sem-produtos");

let categoriaAtual = "todos";

// Filtrar produtos por nome e categoria
function filtrar() {
  const termo = campoBusca ? campoBusca.value.trim().toLowerCase() : "";
  let encontrados = 0;

  cartoes.forEach((cartao) => {
    const nome = cartao.querySelector("h3").textContent.trim().toLowerCase();
    const categoria = cartao.dataset.categoria;

    const combinaNome = nome.includes(termo);
    const combinaCategoria = categoriaAtual === "todos" || categoria === categoriaAtual;
    const visivel = combinaNome && combinaCategoria;

    cartao.hidden = !visivel;
    if (visivel) encontrados++;
  });

  if (semProdutos) {
    semProdutos.hidden = encontrados > 0;
  }
}

// Marcar categoria escolhida
function escolherCategoria(botao) {
  categoriaAtual = botao.dataset.categoria;

  botoesCategoria.forEach((b) => {
    const ativo = b === botao;
    b.classList.toggle("ativo", ativo);
    b.setAttribute("aria-pressed", ativo);
  });

  filtrar();
}

// Buscar produto ao digitar
if (campoBusca) {
  campoBusca.addEventListener("input", filtrar);
}

// Botões das categorias
botoesCategoria.forEach((botao) => {
  botao.addEventListener("click", () => escolherCategoria(botao));
});

// Carregar filtro ao abrir a página
filtrar();