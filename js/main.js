/* =========================================================
   Lunguinho Mangabeira – scripts da landing page
   ========================================================= */

// Número principal do WhatsApp (só dígitos, com 55 + DDD)
const WHATSAPP_PADRAO = "5561981993806";

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Ano no rodapé ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Links de WhatsApp ---------- */
  const waLink = (phone, msg) =>
    `https://wa.me/${phone}?text=${encodeURIComponent(msg || "")}`;

  document.querySelectorAll(".js-whatsapp").forEach((el) => {
    el.href = waLink(el.dataset.phone || WHATSAPP_PADRAO, el.dataset.msg);
    el.target = "_blank";
    el.rel = "noopener";
  });

  /* ---------- Header ao rolar ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* ---------- Link ativo no menu ---------- */
  const links = [...document.querySelectorAll(".nav__link")];
  const sections = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));

    /* ---------- Animação ao aparecer ---------- */
    const revealObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      revealObs.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Vídeos: garante autoplay e respeita "reduzir movimento" ---------- */
  const videos = document.querySelectorAll(".hero video");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  videos.forEach((v) => {
    v.muted = true;
    if (reduce) { v.pause(); v.removeAttribute("autoplay"); return; }
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  });
  // Pausa o vídeo grande quando ele está escondido (celular) para economizar bateria
  const frameVideo = document.querySelector(".hero__video");
  const mq = window.matchMedia("(max-width: 900px)");
  const syncFrame = () => {
    if (!frameVideo || reduce) return;
    if (mq.matches) frameVideo.pause();
    else frameVideo.play().catch(() => {});
  };
  syncFrame();
  mq.addEventListener ? mq.addEventListener("change", syncFrame) : mq.addListener(syncFrame);

  /* ---------- Galeria (lightbox) ---------- */
  const lightbox = document.getElementById("lightbox");
  const lbImg = lightbox.querySelector("img");
  const openLb = (src, alt) => {
    lbImg.src = src;
    lbImg.alt = alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  document.querySelectorAll(".gallery__item").forEach((item) => {
    item.addEventListener("click", () => openLb(item.dataset.full, item.querySelector("img").alt));
  });
  lightbox.addEventListener("click", (e) => { if (e.target !== lbImg) closeLb(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });

  /* ---------- Formulário → WhatsApp ---------- */
  const form = document.getElementById("contactForm");
  const phoneInput = form.querySelector('[name="telefone"]');

  // máscara simples de telefone
  phoneInput.addEventListener("input", () => {
    let d = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    if (d.length > 10) d = d.replace(/^(\d{2})(\d)(\d{4})(\d{0,4}).*/, "($1) $2 $3-$4");
    else if (d.length > 6) d = d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    else if (d.length > 2) d = d.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    else if (d.length) d = d.replace(/^(\d*)/, "($1");
    phoneInput.value = d;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    let ok = true;
    ["nome", "telefone"].forEach((name) => {
      const field = form.querySelector(`[name="${name}"]`);
      const invalid = !String(data[name] || "").trim();
      field.classList.toggle("is-invalid", invalid);
      if (invalid) ok = false;
    });
    if (!ok) {
      form.querySelector(".is-invalid").focus();
      return;
    }

    const msg =
      `Olá! Vim pelo site.\n\n` +
      `*Nome:* ${data.nome}\n` +
      `*Telefone:* ${data.telefone}\n` +
      `*Assunto:* ${data.assunto}\n` +
      (data.mensagem ? `*Mensagem:* ${data.mensagem}` : "");

    window.open(waLink(WHATSAPP_PADRAO, msg), "_blank", "noopener");
    form.reset();
  });

  form.querySelectorAll("input").forEach((i) =>
    i.addEventListener("input", () => i.classList.remove("is-invalid"))
  );
});
