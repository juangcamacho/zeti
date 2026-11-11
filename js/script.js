/* =========================================================
   ZéTI — scripts do site
   ========================================================= */

// EDITE AQUI: dados de contato reais da ZéTI
const CONFIG = {
  whatsapp: "5500000000000",          // DDI + DDD + número, só dígitos (ex.: 5511999998888)
  email: "contato@zeti.com.br",
  whatsappMsg: "Olá, ZéTI! Gostaria de mais informações sobre os serviços."
};

document.documentElement.classList.remove("no-js");

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Links de contato ---------- */
const waLink = (msg = CONFIG.whatsappMsg) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

$$("[data-whatsapp]").forEach((a) => {
  a.href = waLink();
  a.target = "_blank";
  a.rel = "noopener";
});
$$("[data-email]").forEach((a) => {
  a.href = `mailto:${CONFIG.email}`;
  a.textContent = CONFIG.email;
});

/* ---------- Header + botão topo ---------- */
const header = $("#header");
const toTop = $("#toTop");

const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 20);
  toTop.classList.toggle("show", y > 600);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

/* ---------- Menu mobile ---------- */
const menuToggle = $("#menuToggle");
const nav = $("#nav");

const setMenu = (open) => {
  nav.classList.toggle("open", open);
  header.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  document.body.style.overflow = open ? "hidden" : "";
};

menuToggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
$$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
window.addEventListener("resize", () => window.innerWidth > 860 && setMenu(false));

/* ---------- Link ativo conforme a seção ---------- */
const links = $$(".nav__link");
const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${entry.target.id}`));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => spy.observe(s));

/* ---------- Animações de entrada ---------- */
const revealEls = $$(".reveal");

// pequeno atraso escalonado entre irmãos
revealEls.forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  const i = siblings.indexOf(el);
  el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
});

if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

/* ---------- Contadores ---------- */
const animateCounter = (el) => {
  const target = Number(el.dataset.target);
  if (reduceMotion) { el.textContent = target; return; }
  const duration = 1600;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counterIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
$$(".counter").forEach((c) => counterIO.observe(c));

/* ---------- Texto digitado no hero ---------- */
(() => {
  const el = $("#typed");
  if (!el) return;
  const words = ["tecnologia.", "segurança.", "eficiência.", "inovação.", "automação."];
  if (reduceMotion) { el.textContent = "tecnologia, segurança e eficiência."; return; }

  let w = 0, c = 0, deleting = false;
  const loop = () => {
    const word = words[w];
    c += deleting ? -1 : 1;
    el.textContent = word.slice(0, c);
    let delay = deleting ? 45 : 95;
    if (!deleting && c === word.length) { delay = 1800; deleting = true; }
    else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
    setTimeout(loop, delay);
  };
  el.textContent = "";
  setTimeout(loop, 600);
})();

/* ---------- Terminal animado ---------- */
(() => {
  const term = $("#terminal");
  if (!term) return;

  const lines = [
    { t: "$ zeti status --all", cls: "c-prompt" },
    { t: "→ verificando servidores ........ OK", ok: true },
    { t: "→ firewall e antivírus .......... OK", ok: true },
    { t: "→ backup diário ................. OK", ok: true },
    { t: "→ Microsoft 365 ................. OK", ok: true },
    { t: "→ automações em execução ........ 12", ok: true },
    { t: "# tudo funcionando. bom trabalho! 🚀", cls: "c-dim" }
  ];

  const render = (line, text) => {
    const span = document.createElement("span");
    if (line.ok && text.endsWith(line.t.split(" ").pop())) {
      const parts = text.split(" ");
      const last = parts.pop();
      span.append(parts.join(" ") + " ");
      const ok = document.createElement("span");
      ok.className = "c-ok";
      ok.textContent = last;
      span.append(ok);
    } else {
      if (line.cls) span.className = line.cls;
      span.textContent = text;
    }
    return span;
  };

  if (reduceMotion) {
    lines.forEach((l) => { term.append(render(l, l.t), "\n"); });
    return;
  }

  let li = 0, ci = 0, current;
  const step = () => {
    if (li >= lines.length) {
      setTimeout(() => { term.textContent = ""; li = 0; ci = 0; step(); }, 4500);
      return;
    }
    const line = lines[li];
    if (ci === 0) { current = document.createElement("span"); term.append(current); }
    ci++;
    const node = render(line, line.t.slice(0, ci));
    current.replaceWith(node);
    current = node;
    if (ci >= line.t.length) {
      term.append("\n");
      li++; ci = 0;
      setTimeout(step, li === 1 ? 500 : 260);
    } else {
      setTimeout(step, li === 0 ? 55 : 14);
    }
  };
  setTimeout(step, 900);
})();

/* ---------- Brilho que segue o mouse nos cards ---------- */
$$(".service").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

/* ---------- Formulário de contato ---------- */
(() => {
  const form = $("#contactForm");
  if (!form) return;
  const feedback = $("#formFeedback");
  const phone = $("#telefone");

  // máscara de telefone (00) 00000-0000
  phone.addEventListener("input", () => {
    const d = phone.value.replace(/\D/g, "").slice(0, 11);
    let v = d;
    if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    phone.value = v;
  });

  const rules = {
    nome: (v) => v.trim().length >= 2 || "Informe seu nome.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Informe um e-mail válido.",
    telefone: (v) => !v || v.replace(/\D/g, "").length >= 10 || "Telefone incompleto.",
    servico: (v) => !!v || "Selecione um serviço.",
    mensagem: (v) => v.trim().length >= 10 || "Escreva ao menos 10 caracteres."
  };

  const validateField = (input) => {
    const rule = rules[input.name];
    if (!rule) return true;
    const result = rule(input.value);
    const field = input.closest(".field");
    const msg = result === true ? "" : result;
    field.classList.toggle("invalid", !!msg);
    $(".field__error", field).textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  };

  $$("input, select, textarea", form).forEach((el) => {
    el.addEventListener("blur", () => validateField(el));
    el.addEventListener("input", () => el.closest(".field").classList.contains("invalid") && validateField(el));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const channel = e.submitter?.dataset.channel || "whatsapp";
    const fields = $$("input, select, textarea", form);
    const valid = fields.map(validateField).every(Boolean);

    if (!valid) {
      feedback.className = "form__feedback err";
      feedback.textContent = "Confira os campos destacados.";
      fields.find((f) => f.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const text =
      `Olá, ZéTI!\n\n` +
      `Nome: ${data.nome}\n` +
      (data.empresa ? `Empresa: ${data.empresa}\n` : "") +
      `E-mail: ${data.email}\n` +
      (data.telefone ? `Telefone: ${data.telefone}\n` : "") +
      `Serviço: ${data.servico}\n\n` +
      `${data.mensagem}`;

    if (channel === "email") {
      const subject = `Contato pelo site – ${data.servico}`;
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(waLink(text), "_blank", "noopener");
    }

    feedback.className = "form__feedback ok";
    feedback.textContent = "Tudo certo! Finalize o envio na janela que abriu. Obrigado pelo contato.";
    form.reset();
  });
})();

/* ---------- Ano no rodapé ---------- */
$("#year").textContent = new Date().getFullYear();
