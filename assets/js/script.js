// comunicado.html
document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".news-item");

  items.forEach((item, idx) => {
    const header = item.querySelector(".news-header");
    const panel = item.querySelector(".news-content");
    const inner = item.querySelector(".news-content-inner");

    if (!header || !panel || !inner) return;

    // Acessibilidade
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.setAttribute("aria-controls", panel.id || `news-panel-${idx}`);
    panel.id = panel.id || `news-panel-${idx}`;
    header.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    // Funções utilitárias
    const open = () => {
      item.classList.add("active");
      panel.style.height = "0px"; // garante estado inicial
      panel.style.overflow = "hidden";
      // mede em frame seguinte para forçar reflow estável
      requestAnimationFrame(() => {
        const target = inner.scrollHeight;
        panel.style.height = target + "px";
      });

      const onEnd = (ev) => {
        if (ev.propertyName !== "height") return;
        panel.style.height = "auto"; // trava no tamanho intrínseco
        panel.style.overflow = "visible";
        panel.removeEventListener("transitionend", onEnd);
      };
      panel.addEventListener("transitionend", onEnd);

      header.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
    };

    const close = () => {
      item.classList.remove("active");
      // se estava em auto, precisamos pegar a altura corrente
      const current = panel.getBoundingClientRect().height;
      panel.style.height = current + "px";
      panel.style.overflow = "hidden";
      // força recálculo e anima para 0
      requestAnimationFrame(() => {
        panel.style.height = "0px";
      });

      const onEnd = (ev) => {
        if (ev.propertyName !== "height") return;
        panel.removeEventListener("transitionend", onEnd);
      };
      panel.addEventListener("transitionend", onEnd);

      header.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
    };

    const toggle = () => {
      const isActive = item.classList.contains("active");

      // (Opcional) fechar outros
      items.forEach((other) => {
        if (other !== item && other.classList.contains("active")) {
          const ph = other.querySelector(".news-header");
          const pp = other.querySelector(".news-content");
          const pi = other.querySelector(".news-content-inner");
          if (ph && pp && pi) {
            const curr = pp.getBoundingClientRect().height;
            pp.style.height = curr + "px";
            requestAnimationFrame(() => {
              pp.style.height = "0px";
            });
            other.classList.remove("active");
            ph.setAttribute("aria-expanded", "false");
            pp.setAttribute("aria-hidden", "true");
          }
        }
      });

      isActive ? close() : open();
    };

    header.addEventListener("click", toggle);
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });

    // Observa mudanças internas (imagens/fontes/listas que expandem depois)
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(() => {
        if (!item.classList.contains("active")) return;
        // se aberto e height = auto, não anima; apenas mantém altura intrínseca
        if (panel.style.height === "auto") return;
        panel.style.height = inner.scrollHeight + "px";
      });
      ro.observe(inner);
    }
  });

  // // Para abrir o primeiro por padrão, descomente:
  // const first = document.querySelector('.news-item');
  // if (first) { first.querySelector('.news-header').click(); }
});

// faq.html
document.addEventListener("DOMContentLoaded", function () {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      // Toggle active class on the clicked question
      this.classList.toggle("active");

      // Select the sibling answer element
      const answer = this.nextElementSibling;

      // Toggle max-height for smooth opening/closing
      if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
      } else {
        // Adiciona um buffer para garantir que o padding e margens sejam incluídos
        answer.style.maxHeight = (answer.scrollHeight + 50) + "px";
      }
    });
  });
});

// ibs.html
// Scripts específicos da página podem ser adicionados aqui se necessário.
// O script do menu mobile antigo foi removido.
document.addEventListener("DOMContentLoaded", function () {
  // Exemplo: console.log("Página Sobre o IBS carregada.");
});

// index.html
/* Ponteiro “Estamos aqui!” */
document.addEventListener("DOMContentLoaded", () => {
  const timeline = document.querySelector(".timeline");
  const pointer = document.getElementById("timelinePointer");
  const items = Array.from(
    timeline.querySelectorAll(".timeline-item[data-year]")
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = null;
  for (let i = 0; i < items.length; i++) {
    const label = items[i].getAttribute("data-year");
    const startYear = parseInt(label.split("–")[0].trim(), 10);
    const start = new Date(startYear, 0, 1);
    let end;
    if (i + 1 < items.length) {
      const nextLabel = items[i + 1].getAttribute("data-year");
      const nextStart = parseInt(nextLabel.split("–")[0].trim(), 10);
      end = new Date(nextStart, 0, 1);
    } else {
      end = new Date(9999, 11, 31);
    }
    if (today >= start && today < end) {
      current = items[i];
      break;
    }
  }
  if (!current && items.length) {
    const firstYear = parseInt(
      items[0].getAttribute("data-year").split("–")[0].trim(),
      10
    );
    current =
      today < new Date(firstYear, 0, 1) ? items[0] : items[items.length - 1];
  }
  if (current && pointer) {
    const dot = current.querySelector(".timeline-dot");
    if (dot) {
      let top = dot.offsetTop,
        p = dot.offsetParent;
      while (p && p !== timeline && p.tagName !== "BODY") {
        top += p.offsetTop;
        p = p.offsetParent;
      }
      const y = top + dot.offsetHeight / 2 - pointer.offsetHeight / 2;
      pointer.style.top = y + "px";
      pointer.style.display = "flex";
    }
  }
});
// Visor interno de PDF (usado nas páginas que tiverem #pdf-viewer-overlay)
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("pdf-viewer-overlay");
  const frame = document.getElementById("pdfViewerFrame");
  const downloadLink = document.getElementById("pdfViewerDownload");
  const closeBtn = document.getElementById("pdfViewerClose");

  // Se a página não tiver o componente, não faz nada
  if (!overlay || !frame || !downloadLink) return;

  const pdfLinks = document.querySelectorAll('[data-open-pdf="inline"]');

  // Domínios conhecidos que bloqueiam exibição em iframe
  const BLOCK_IFRAME_DOMAINS = [
    "assets/img-pdf/ebook-cadastramento-e-emissao-nfe-fev-2023.pdf",
    // Adicione outros se necessário
  ];

  function mustOpenInNewTab(url) {
    try {
      const u = new URL(url, window.location.href);
      return BLOCK_IFRAME_DOMAINS.some(
        (d) => u.hostname === d || u.hostname.endsWith("." + d)
      );
    } catch (e) {
      return false;
    }
  }

  pdfLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      // clique com Ctrl / botão do meio → comportamento padrão
      if (event.button === 1 || event.metaKey || event.ctrlKey) {
        return;
      }

      const url = link.getAttribute("href");
      if (!url) return;

      // Se o domínio já é conhecido por bloquear iframe, abre direto em nova aba
      if (mustOpenInNewTab(url)) {
        event.preventDefault();
        window.open(url, "_blank", "noopener");
        return;
      }

      // Caso normal: abre no visor interno
      event.preventDefault();
      frame.src = url;
      downloadLink.href = url;

      overlay.classList.add("is-visible");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    });
  });

  function closePdfViewer() {
    overlay.classList.remove("is-visible");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    frame.src = "";
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closePdfViewer);
  }

  overlay.addEventListener("click", function (event) {
    if (event.target.classList.contains("pdf-overlay-backdrop")) {
      closePdfViewer();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePdfViewer();
    }
  });
});
// legislacao.html
// Script do acordeão e timeline (do nfse.html) - não encontrarão os elementos aqui,
// mas as verificações internas evitam erros.
document.addEventListener("DOMContentLoaded", function () {
  /* --- 1. Lógica do Acordeão --- */
  const accordionItems = document.querySelectorAll(".nfse-accordion-item"); // Tentará encontrar, não achará
  if (accordionItems.length > 0) {
    accordionItems.forEach((item) => {
      // ... lógica do acordeão ...
    });
  }

  /* --- 2. Lógica do Menu Mobile (REMOVIDA) --- */

  /* --- 3. Lógica do Ponteiro da Timeline --- */
  const timelineNfse = document.querySelector(".nfse-timeline"); // Tentará encontrar, não achará
  const pointerNfse = document.getElementById("nfseTimelinePointer"); // Tentará encontrar, não achará

  if (timelineNfse && pointerNfse) {
    // ... lógica da timeline ...
  }

  // Adiciona IDs aos decretos para os links internos funcionarem
  const decretos = document.querySelectorAll(".section .decreto-titulo-main");
  if (decretos.length >= 1) decretos[0].closest(".section").id = "decreto7619";
  if (decretos.length >= 2) decretos[1].closest(".section").id = "decreto7620";
});

// nfse.html
document.addEventListener("DOMContentLoaded", function () {
  const accordionItems = document.querySelectorAll(".nfse-accordion-item");
  accordionItems.forEach((item) => {
    const header = item.querySelector(".nfse-accordion-header");
    const content = item.querySelector(".nfse-accordion-content");
    if (header && content) {
      header.addEventListener("click", () => {
        // Fecha outros itens
        accordionItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains("active")) {
            otherItem.classList.remove("active");
            const otherContent = otherItem.querySelector(
              ".nfse-accordion-content"
            );
            if (otherContent) otherContent.style.maxHeight = null;
          }
        });
        // Toggle do item clicado
        const isActive = item.classList.contains("active");
        item.classList.toggle("active");
        if (isActive) {
          content.style.maxHeight = null; // Fecha
        } else {
          content.style.maxHeight = content.scrollHeight + "px"; // Abre
        }
      });
    }
  });
  const timelineNfse = document.querySelector(".nfse-timeline");
  const pointerNfse = document.getElementById("nfseTimelinePointer");

  if (timelineNfse && pointerNfse) {
    const itemsNfse = Array.from(
      timelineNfse.querySelectorAll(".nfse-timeline-item[data-date]")
    );
    const currentDateNfse = new Date();
    currentDateNfse.setHours(0, 0, 0, 0);
    let currentItemNfse = null;
    let currentItemIndex = -1;

    function parseLocalDate(dateStr) {
      if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return null;
      }
      const parts = dateStr.split("-");
      const date = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );
      date.setHours(0, 0, 0, 0);
      if (
        date.getFullYear() === parseInt(parts[0]) &&
        date.getMonth() === parseInt(parts[1]) - 1 &&
        date.getDate() === parseInt(parts[2])
      ) {
        return date;
      }
      return null;
    }

    // Encontra o ÚLTIMO item cuja data de início é MENOR OU IGUAL à data atual
    for (let i = 0; i < itemsNfse.length; i++) {
      const itemDateStr = itemsNfse[i].getAttribute("data-date");
      const startDate = parseLocalDate(itemDateStr);

      if (
        startDate &&
        !isNaN(startDate.getTime()) &&
        startDate <= currentDateNfse
      ) {
        currentItemNfse = itemsNfse[i];
        currentItemIndex = i;
      } else if (
        startDate &&
        !isNaN(startDate.getTime()) &&
        startDate > currentDateNfse
      ) {
        break;
      } else {
        console.warn(
          `Data inválida ou ausente no item ${i + 1}: ${itemDateStr}`
        );
      }
    }

    // Fallback: Se NENHUM item teve data <= currentDate (ex: todas datas futuras)
    if (!currentItemNfse && itemsNfse.length > 0) {
      for (let i = 0; i < itemsNfse.length; i++) {
        const firstItemDateStr = itemsNfse[i].getAttribute("data-date");
        const firstValidStartDate = parseLocalDate(firstItemDateStr);
        if (firstValidStartDate && !isNaN(firstValidStartDate.getTime())) {
          currentItemNfse = itemsNfse[i];
          currentItemIndex = i;
          break; // Pega o primeiro válido
        }
      }
    }

    // Posiciona o ponteiro
    if (currentItemNfse) {
      const contentElement = currentItemNfse.querySelector(
        ".nfse-timeline-content"
      );
      if (contentElement) {
        // Lógica de posicionamento (dependente do @media)
        const isMobileView = window.matchMedia("(max-width: 600px)").matches;
        let targetTop;

        if (isMobileView) {
          targetTop =
            currentItemNfse.offsetTop +
            contentElement.offsetTop / 2 -
            pointerNfse.offsetHeight / 2;
        } else {
          targetTop =
            currentItemNfse.offsetTop + contentElement.offsetHeight / 2;
        }

        pointerNfse.style.top = `${targetTop}px`;
        pointerNfse.style.display = "flex";
      } else {
        console.error("Elemento '.nfse-timeline-content' não encontrado.");
      }
    } else {
      console.warn(
        "Não foi possível determinar nenhum item válido na timeline da NFS-e."
      );
    }
  } else {
    if (!timelineNfse)
      console.error("Elemento '.nfse-timeline' não encontrado.");
    if (!pointerNfse)
      console.error("Elemento '#nfseTimelinePointer' não encontrado.");
  }
});

/**
 * Função: iniciarMigracaoAssistida
 * Objetivo: Gerenciar a experiência de "Dupla Tela" com segurança básica.
 */
function iniciarMigracaoAssistida() {
  // SEGURANÇA: URL Hardcoded. Nunca use window.location.search para definir isso.
  const urlPortalNacional =
    "https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2fEmissorNacional%2f";

  const elementoPassoAPasso = document.getElementById("passo-a-passo");

  if (!elementoPassoAPasso) {
    console.error(
      "Erro Crítico: Elemento guia não encontrado. Abortando para segurança."
    );
    return;
  }

  // Captura o HTML.
  // SEGURANÇA: Certifique-se que este HTML no index.html é estático e não contém inputs de usuário.
  const conteudoGuia = elementoPassoAPasso.innerHTML;

  const largura = 420;
  const altura = window.screen.availHeight - 60;
  const esquerda = window.screen.width - largura;

  // noopener é difícil de usar aqui pois precisamos da referência para escrever nela,
  // mas como escrevemos em 'about:blank', o risco é mitigado pelo Same Origin Policy inicial.
  const features = `width=${largura},height=${altura},left=${esquerda},top=0,resizable=yes,scrollbars=yes,status=no,menubar=no`;

  const janelaGuia = window.open("", "GuiaFlutuanteNFS", features);

  // Verificação se o Popup foi bloqueado
  if (
    !janelaGuia ||
    janelaGuia.closed ||
    typeof janelaGuia.closed == "undefined"
  ) {
    alert(
      "O navegador bloqueou a janela auxiliar. Por favor, permita pop-ups para ver o guia passo a passo."
    );
    return;
  }

  if (janelaGuia) {
    janelaGuia.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="utf-8">
            <!-- SEGURANÇA: CSP restrito dentro da janela flutuante -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'unsafe-inline' https://cdnjs.cloudflare.com; font-src https://cdnjs.cloudflare.com; script-src 'unsafe-inline'">
            <title>Guia Seguro NFS-e</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet" />
            <style>
                /* --- SYSTEM DESIGN APPLE --- */
                :root { --sys-bg: #F2F2F7; --sys-card: #FFFFFF; --sys-blue: #007AFF; --sys-text: #1C1C1E; --sys-text-sec: #8E8E93; }
                body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif; margin: 0; padding: 0; background: var(--sys-bg); color: var(--sys-text); }
                
                .floating-header { position: sticky; top: 0; z-index: 99; background: rgba(242, 242, 247, 0.85); backdrop-filter: saturate(180%) blur(20px); padding: 14px 20px; border-bottom: 1px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
                .floating-header h1 { font-size: 15px; margin: 0; font-weight: 600; color: var(--sys-text); }
                .close-btn { color: var(--sys-blue); font-size: 14px; font-weight: 500; background: none; border: none; cursor: pointer; }
                
                .content-wrapper { padding: 20px; padding-bottom: 60px; } /* Espaço extra footer */
                
                /* Segurança Visual */
                .security-badge {
                    background: #e8f5e9; border: 1px solid #c8e6c9; color: #2e7d32;
                    padding: 10px; border-radius: 8px; font-size: 12px; margin-bottom: 15px;
                    display: flex; align-items: center; gap: 8px;
                }

                /* Estilos de Conteúdo */
                .nfse-section-intro h2 { display: none; }
                .nfse-section-intro p { font-size: 13px; color: var(--sys-text-sec); margin-bottom: 15px; }
                .nfse-resources-grid { display: flex; flex-direction: column; gap: 14px; }
                .nfse-resource-card { background: var(--sys-card); padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                .nfse-resource-card h3 { font-size: 15px; margin: 0 0 10px 0; font-weight: 600; display: flex; gap: 8px; color: var(--sys-blue); }
                .nfse-resource-card h3 i { font-size: 14px; }
                
                ol { padding-left: 0; margin: 0; list-style: none; counter-reset: step; }
                ol > li { position: relative; padding-left: 28px; margin-bottom: 8px; font-size: 13px; line-height: 1.4; color: #333; }
                ol > li::before { counter-increment: step; content: counter(step); position: absolute; left: 0; top: 0; width: 18px; height: 18px; background: #E5E5EA; color: #666; border-radius: 50%; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
                
                ul { padding-left: 0; margin: 4px 0; list-style: none; }
                ul li { padding-left: 12px; margin-bottom: 3px; color: var(--sys-text-sec); font-size: 12px; position: relative; }
                ul li::before { content: "•"; position: absolute; left: 0; color: var(--sys-blue); }
                
                strong { font-weight: 600; color: var(--sys-text); }
                a { color: var(--sys-blue); text-decoration: none; }
                small { color: #999; font-size: 11px; display: block; margin-top: 2px; }
                .no-popup { display: none !important; }
            </style>
        </head>
        <body>
            <div class="floating-header">
                <h1><i class="fa-solid fa-book-open"></i> Guia de Navegação</h1>
                <button class="close-btn" onclick="window.close()">Fechar</button>
            </div>
            
            <div class="content-wrapper">
                <!-- Aviso de Segurança -->
                <div class="security-badge">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span><strong>Segurança:</strong> Este é apenas um guia visual. Nunca solicitamos suas senhas aqui.</span>
                </div>
            
                ${conteudoGuia}
            </div>
        </body>
        </html>
        `);
    janelaGuia.document.close();
    if (window.focus) {
      janelaGuia.focus();
    }

    // Redireciona a janela pai para o site oficial
    // Usamos replace() em vez de href para que o botão 'voltar' funcione melhor
    setTimeout(() => {
      window.location.replace(urlPortalNacional);
    }, 1000);
  }
}
// ================================
// Abas da timeline (técnica x cidadão)
// ================================
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".timeline-tab");
  const panels = document.querySelectorAll(".timeline-panel");

  if (!tabs.length || !panels.length) return;

  function activateTab(targetId) {
    tabs.forEach((tab) => {
      const target = tab.getAttribute("data-target");
      const isActive = target === targetId;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    panels.forEach((panel) => {
      const isActive = panel.id === targetId;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-target");
      if (targetId) {
        activateTab(targetId);
      }
    });

    tab.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        const targetId = tab.getAttribute("data-target");
        if (targetId) {
          activateTab(targetId);
        }
      }
    });
  });
});
// ================================
// Timeline horizontal – marca período atual
// ================================
document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".htimeline-item");
  if (!items.length) return;

  const currentYear = new Date().getFullYear();

  items.forEach((item) => {
    const start = parseInt(item.getAttribute("data-start"), 10);
    const endAttr = item.getAttribute("data-end");
    const end = endAttr ? parseInt(endAttr, 10) : start;

    if (!isNaN(start) && !isNaN(end)) {
      if (currentYear >= start && currentYear <= end) {
        item.classList.add("is-current");
      }
    }
  });
});
