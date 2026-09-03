/* =========================================================
   FLASHMARKET — SUPORTE
========================================================= */

const topics = {

    pedido: {
      title: "Pedido e entrega",
      message:
        "Posso ajudar com rastreamento, prazo de entrega e situação do seu pedido."
    },
  
    pagamento: {
      title: "Pagamento",
      message:
        "Posso ajudar com pagamentos, aprovação, cobranças e formas de pagamento."
    },
  
    troca: {
      title: "Troca e devolução",
      message:
        "Posso orientar sobre troca, devolução e procedimentos após o recebimento."
    },
  
    conta: {
      title: "Conta e login",
      message:
        "Posso ajudar com acesso à conta, login e recuperação de informações."
    },
  
    afiliado: {
      title: "Afiliado",
      message:
        "Posso ajudar com informações sobre o programa de afiliados FlashMarket."
    },
  
    produtos: {
      title: "Produtos",
      message:
        "Posso ajudar com informações, disponibilidade e características dos produtos."
    }
  
  };
  
  
  const categories =
    document.querySelectorAll(
      ".support-category"
    );
  
  const selectedTopic =
    document.getElementById(
      "selectedTopic"
    );
  
  const chatThread =
    document.getElementById(
      "chatThread"
    );
  
  const chatForm =
    document.getElementById(
      "supportChatForm"
    );
  
  const chatInput =
    document.getElementById(
      "supportChatInput"
    );
  
  const humanButton =
    document.getElementById(
      "humanSupportBtn"
    );
  
  
  /* =========================================================
     SELEÇÃO DE ASSUNTO
  ========================================================= */
  
  categories.forEach(category => {
  
    category.addEventListener(
      "click",
      () => {
  
        categories.forEach(item => {
  
          item.classList.remove(
            "active"
          );
  
        });
  
        category.classList.add(
          "active"
        );
  
  
        const topic =
          category.dataset.topic;
  
        const data =
          topics[topic];
  
        if (!data) return;
  
  
        selectedTopic.textContent =
          data.title;
  
  
        const firstStep =
          document.querySelector(
            ".triage-step strong"
          );
  
        const firstDescription =
          document.querySelector(
            ".triage-step small"
          );
  
  
        if (firstStep) {
  
          firstStep.textContent =
            getFirstStep(topic);
  
        }
  
  
        if (firstDescription) {
  
          firstDescription.textContent =
            getFirstDescription(topic);
  
        }
  
      }
  
    );
  
  });
  
  
  /* =========================================================
     PRIMEIRA ETAPA
  ========================================================= */
  
  function getFirstStep(topic) {
  
    const steps = {
  
      pedido: "Confirmar pedido",
  
      pagamento: "Verificar pagamento",
  
      troca: "Verificar pedido",
  
      conta: "Validar conta",
  
      afiliado: "Consultar cadastro",
  
      produtos: "Consultar produto"
  
    };
  
    return steps[topic] || "Identificar solicitação";
  
  }
  
  
  function getFirstDescription(topic) {
  
    const descriptions = {
  
      pedido:
        "Informe o número do pedido",
  
      pagamento:
        "Informe a situação do pagamento",
  
      troca:
        "Informe o pedido que deseja trocar",
  
      conta:
        "Informe o e-mail da conta",
  
      afiliado:
        "Consulte seu cadastro",
  
      produtos:
        "Informe o produto desejado"
  
    };
  
    return descriptions[topic]
      || "Informe os detalhes";
  
  }
  
  
  /* =========================================================
     CHAT
  ========================================================= */
  
  chatForm.addEventListener(
    "submit",
    event => {
  
      event.preventDefault();
  
      const message =
        chatInput.value.trim();
  
      if (!message) return;
  
  
      addMessage(
        message,
        "user"
      );
  
      chatInput.value = "";
  
  
      setTimeout(() => {
  
        const response =
          generateResponse(message);
  
        addMessage(
          response,
          "bot"
        );
  
      }, 700);
  
    }
  );
  
  
  /* =========================================================
     ADICIONAR MENSAGEM
  ========================================================= */
  
  function addMessage(
    message,
    type
  ) {
  
    const wrapper =
      document.createElement("div");
  
    wrapper.className =
      `chat-message ${type}`;
  
  
    if (type === "bot") {
  
      wrapper.innerHTML = `
  
        <span class="message-avatar">
          ✦
        </span>
  
        <div>
  
          <p>
            ${escapeHTML(message)}
          </p>
  
          <small>
            Agora
          </small>
  
        </div>
  
      `;
  
    } else {
  
      wrapper.innerHTML = `
  
        <div>
  
          <p>
            ${escapeHTML(message)}
          </p>
  
          <small>
            Agora
          </small>
  
        </div>
  
      `;
  
    }
  
  
    chatThread.appendChild(
      wrapper
    );
  
  
    chatThread.scrollTop =
      chatThread.scrollHeight;
  
  }
  
  
  /* =========================================================
     RESPOSTAS DA IA
  ========================================================= */
  
  function generateResponse(message) {
  
    const text =
      message.toLowerCase();
  
  
    if (
      text.includes("pedido") ||
      text.includes("rastre") ||
      text.includes("entrega")
    ) {
  
      return "Claro! Para acompanhar sua entrega, acesse a página de rastreamento e informe o código do pedido. Se preferir, posso orientar você sobre as etapas da entrega.";
  
    }
  
  
    if (
      text.includes("pagamento") ||
      text.includes("cartão") ||
      text.includes("pix")
    ) {
  
      return "Posso ajudar com dúvidas sobre pagamento. Verifique primeiro se a transação foi aprovada e, caso continue com problema, nossa equipe poderá analisar o pedido.";
  
    }
  
  
    if (
      text.includes("troca") ||
      text.includes("devolução")
    ) {
  
      return "Para solicitar uma troca ou devolução, precisamos localizar o pedido e verificar as condições da compra. Nossa equipe poderá orientar você durante o processo.";
  
    }
  
  
    if (
      text.includes("produto") ||
      text.includes("preço")
    ) {
  
      return "Posso ajudar com informações sobre produtos. Informe o nome do produto ou o que você gostaria de saber.";
  
    }
  
  
    if (
      text.includes("afiliado")
    ) {
  
      return "A Área de Afiliado possui informações sobre cadastro e participação no programa. Acesse a página de afiliados para continuar.";
  
    }
  
  
    if (
      text.includes("oi") ||
      text.includes("olá") ||
      text.includes("ola")
    ) {
  
      return "Olá! 👋 Seja bem-vindo à FlashMarket. Como posso ajudar você hoje?";
  
    }
  
  
    return "Entendi. Para que eu possa ajudar melhor, informe se sua dúvida é sobre pedido, entrega, pagamento, troca, produto, conta ou afiliado.";
  
  }
  
  
  /* =========================================================
     ATENDIMENTO HUMANO
  ========================================================= */
  
  humanButton.addEventListener(
    "click",
    () => {
  
      window.open(
        "https://wa.me/5511997255630?text=Olá!%20Preciso%20de%20atendimento.",
        "_blank"
      );
  
    }
  );
  
  
  /* =========================================================
     SEGURANÇA
  ========================================================= */
  
  function escapeHTML(text) {
  
    const div =
      document.createElement("div");
  
    div.textContent =
      text;
  
    return div.innerHTML;
  
  }