/* =========================================================
   BANCO DE DADOS DEMONSTRATIVO
========================================================= */

const pedidos = {

  "FM-20487": {

    numero: "FM-20487",

    rastreio: "FM204871BR",

    transportadora: "Flash Express",

    status: "Em transporte",

    statusAtual: "Pedido em transporte",

    descricao:
      "Seu pedido está a caminho do centro de distribuição da sua região.",

    progresso: 75,

    etapa: 3,

    previsao: "02/09/2026",

    endereco: `
      Rua das Flores, 125<br>
      Centro — Barueri/SP<br>
      CEP 06400-000
    `,

    produtos: [

      {
        nome: "Moletom Street Flash",
        quantidade: 1,
        preco: "R$ 119,90"
      },

      {
        nome: "Mouse Sem Fio Slim",
        quantidade: 1,
        preco: "R$ 64,90"
      },

      {
        nome: "Kit Canetas",
        quantidade: 1,
        preco: "R$ 24,90"
      }

    ],

    eventos: [

      {
        titulo: "Pedido confirmado",
        descricao:
          "Pagamento aprovado e pedido recebido pela FlashMarket.",
        data: "31/08/2026",
        hora: "09:14",
        local: "FlashMarket"
      },

      {
        titulo: "Pedido separado",
        descricao:
          "Os produtos foram separados e preparados para envio.",
        data: "31/08/2026",
        hora: "11:26",
        local: "Centro de distribuição — Barueri/SP"
      },

      {
        titulo: "Pedido em transporte",
        descricao:
          "A encomenda foi coletada pela transportadora e está em rota.",
        data: "31/08/2026",
        hora: "12:48",
        local: "Barueri/SP"
      },

      {
        titulo: "Entrega",
        descricao:
          "Previsão de entrega no endereço informado.",
        data: "02/09/2026",
        hora: "—",
        local: "Endereço do destinatário"
      }

    ]

  },


  "FM-31592": {

    numero: "FM-31592",

    rastreio: "FM315920BR",

    transportadora: "Flash Express",

    status: "Pedido confirmado",

    statusAtual: "Pagamento confirmado",

    descricao:
      "Recebemos seu pedido e estamos preparando os produtos para envio.",

    progresso: 25,

    etapa: 1,

    previsao: "04/09/2026",

    endereco: `
      Avenida Central, 890<br>
      Alphaville — Barueri/SP<br>
      CEP 06454-000
    `,

    produtos: [

      {
        nome: "Tênis Urban Flash",
        quantidade: 1,
        preco: "R$ 189,90"
      },

      {
        nome: "Boné Street",
        quantidade: 1,
        preco: "R$ 49,90"
      }

    ],

    eventos: [

      {
        titulo: "Pedido confirmado",
        descricao:
          "Pagamento aprovado e pedido recebido pela FlashMarket.",
        data: "31/08/2026",
        hora: "10:32",
        local: "FlashMarket"
      },

      {
        titulo: "Separação",
        descricao:
          "O pedido será preparado pela equipe logística.",
        data: "—",
        hora: "—",
        local: "Centro de distribuição"
      },

      {
        titulo: "Transporte",
        descricao:
          "A encomenda será encaminhada para a transportadora.",
        data: "—",
        hora: "—",
        local: "Aguardando postagem"
      },

      {
        titulo: "Entrega",
        descricao:
          "Previsão de entrega após o envio.",
        data: "04/09/2026",
        hora: "—",
        local: "Endereço do destinatário"
      }

    ]

  },


  "FM-78214": {

    numero: "FM-78214",

    rastreio: "FM782140BR",

    transportadora: "Flash Express",

    status: "Entregue",

    statusAtual: "Pedido entregue",

    descricao:
      "O pedido foi entregue com sucesso no endereço informado.",

    progresso: 100,

    etapa: 4,

    previsao: "29/08/2026",

    endereco: `
      Rua das Palmeiras, 245<br>
      Jardim Paulista — São Paulo/SP<br>
      CEP 01400-000
    `,

    produtos: [

      {
        nome: "Camiseta Flash Basic",
        quantidade: 2,
        preco: "R$ 89,90"
      },

      {
        nome: "Mochila Urban",
        quantidade: 1,
        preco: "R$ 139,90"
      }

    ],

    eventos: [

      {
        titulo: "Pedido confirmado",
        descricao:
          "Pagamento aprovado.",
        data: "26/08/2026",
        hora: "14:20",
        local: "FlashMarket"
      },

      {
        titulo: "Pedido separado",
        descricao:
          "Produtos separados e embalados.",
        data: "26/08/2026",
        hora: "16:41",
        local: "São Paulo/SP"
      },

      {
        titulo: "Em transporte",
        descricao:
          "Pedido encaminhado para entrega.",
        data: "27/08/2026",
        hora: "08:15",
        local: "São Paulo/SP"
      },

      {
        titulo: "Entregue",
        descricao:
          "Pedido entregue com sucesso.",
        data: "29/08/2026",
        hora: "13:47",
        local: "Endereço do destinatário"
      }

    ]

  }

};


/* =========================================================
   ELEMENTOS
========================================================= */

const form =
  document.getElementById("trackingForm");

const input =
  document.getElementById("trackingCode");

const result =
  document.getElementById("trackingResult");

const loading =
  document.getElementById("loadingState");

const error =
  document.getElementById("errorState");

const timeline =
  document.getElementById("timeline");

const productsList =
  document.getElementById("productsList");


/* =========================================================
   CONSULTAR PEDIDO
========================================================= */

form.addEventListener("submit", function (event) {

  event.preventDefault();

  const codigo =
    input.value
      .trim()
      .toUpperCase();

  if (!codigo) {

    mostrarErro();

    return;

  }

  consultarPedido(codigo);

});


/* =========================================================
   CONSULTA
========================================================= */

function consultarPedido(codigo) {

  esconderTudo();

  loading.classList.remove("hidden");

  /*
    Simula uma consulta a uma API.
    Em um projeto real, este trecho seria substituído
    por uma chamada fetch() para o backend.
  */

  setTimeout(() => {

    const pedido =
      pedidos[codigo];

    loading.classList.add("hidden");

    if (!pedido) {

      mostrarErro();

      return;

    }

    renderizarPedido(pedido);

    /*
      Salva o último pedido consultado.
    */

    localStorage.setItem(
      "flashmarket_ultimo_pedido",
      codigo
    );

  }, 900);

}


/* =========================================================
   RENDERIZAR PEDIDO
========================================================= */

function renderizarPedido(pedido) {

  result.classList.remove("hidden");

  document.getElementById(
    "orderNumber"
  ).textContent = pedido.numero;

  document.getElementById(
    "trackingNumber"
  ).textContent = pedido.rastreio;

  document.getElementById(
    "carrier"
  ).textContent = pedido.transportadora;

  document.getElementById(
    "deliveryDate"
  ).textContent = pedido.previsao;

  document.getElementById(
    "orderStatus"
  ).textContent = pedido.status;

  document.getElementById(
    "currentTitle"
  ).textContent = pedido.statusAtual;

  document.getElementById(
    "currentDescription"
  ).textContent = pedido.descricao;

  document.getElementById(
    "progressPercentage"
  ).textContent =
    `${pedido.progresso}%`;

  document.getElementById(
    "progressBar"
  ).style.width =
    `${pedido.progresso}%`;

  document.getElementById(
    "progressText"
  ).textContent =
    `${pedido.etapa} de 4 etapas concluídas`;

  document.getElementById(
    "deliveryAddress"
  ).innerHTML =
    pedido.endereco;


  renderizarTimeline(
    pedido.eventos,
    pedido.etapa
  );


  renderizarProdutos(
    pedido.produtos
  );

}


/* =========================================================
   LINHA DO TEMPO
========================================================= */

function renderizarTimeline(eventos, etapaAtual) {

  timeline.innerHTML = "";

  eventos.forEach((evento, index) => {

    const concluido =
      index < etapaAtual;

    const atual =
      index === etapaAtual - 1;

    const div =
      document.createElement("div");

    div.className =
      "timeline-item";

    if (concluido) {

      div.classList.add("completed");

    }

    if (atual) {

      div.classList.add("current");

    }

    div.innerHTML = `

      <div class="timeline-marker">

        ${
          concluido
            ? "✓"
            : index + 1
        }

      </div>

      <div class="timeline-content">

        <div class="timeline-top">

          <strong>
            ${evento.titulo}
          </strong>

          <span>
            ${evento.data}
            ${evento.hora !== "—"
              ? ` • ${evento.hora}`
              : ""}
          </span>

        </div>

        <p>
          ${evento.descricao}
        </p>

        <small>
          📍 ${evento.local}
        </small>

      </div>

    `;

    timeline.appendChild(div);

  });

}


/* =========================================================
   PRODUTOS
========================================================= */

function renderizarProdutos(produtos) {

  productsList.innerHTML = "";

  produtos.forEach(produto => {

    const item =
      document.createElement("div");

    item.className =
      "product-track-item";

    item.innerHTML = `

      <div class="product-track-icon">
        📦
      </div>

      <div class="product-track-info">

        <strong>
          ${produto.nome}
        </strong>

        <span>
          Quantidade: ${produto.quantidade}
        </span>

      </div>

      <strong>
        ${produto.preco}
      </strong>

    `;

    productsList.appendChild(item);

  });

}


/* =========================================================
   ERRO
========================================================= */

function mostrarErro() {

  esconderTudo();

  error.classList.remove("hidden");

}


/* =========================================================
   ESCONDER ESTADOS
========================================================= */

function esconderTudo() {

  result.classList.add("hidden");

  loading.classList.add("hidden");

  error.classList.add("hidden");

}


/* =========================================================
   EXEMPLOS DE CÓDIGOS
========================================================= */

document
  .querySelectorAll("[data-example]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        input.value =
          button.dataset.example;

        consultarPedido(
          button.dataset.example
        );

      }
    );

  });


/* =========================================================
   RECUPERAR ÚLTIMO PEDIDO
========================================================= */

window.addEventListener(
  "DOMContentLoaded",
  () => {

    const ultimoPedido =
      localStorage.getItem(
        "flashmarket_ultimo_pedido"
      );

    if (ultimoPedido) {

      input.value =
        ultimoPedido;

    }

  }
);