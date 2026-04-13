(function () {
  // ---------- i18n ----------
  const STORAGE_KEY = "pss_lang";
  const supported = ["cs", "en"];
  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && supported.includes(saved)) return saved;
    return "cs";
  }
  function t(key, lang) {
    return (window.I18N[lang] && window.I18N[lang][key]) || window.I18N.cs[key] || key;
  }
  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key, lang);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = val;
      else el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      el.innerHTML = t(key, lang).replace(/\n/g, "<br>");
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr"); // e.g. "title:key,alt:key"
      spec.split(",").forEach((pair) => {
        const [attr, key] = pair.split(":").map((s) => s.trim());
        el.setAttribute(attr, t(key, lang));
      });
    });
    document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
    // Re-render galleries if present
    if (typeof window.renderGalleries === "function") window.renderGalleries(lang);
    // Update doc title
    const base = document.body.getAttribute("data-title-" + lang);
    if (base) document.title = base;
  }
  function setLang(lang) {
    if (!supported.includes(lang)) return;
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }
  window.setLang = setLang;
  window.getLang = getLang;

  // ---------- mobile menu ----------
  function initMenu() {
    const btn = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        btn.classList.remove("open");
      })
    );
  }

  // ---------- lightbox ----------
  let lbState = { imgs: [], index: 0, el: null };
  function ensureLightbox() {
    if (lbState.el) return lbState.el;
    const el = document.createElement("div");
    el.className = "lightbox";
    el.innerHTML = `
      <button class="lb-close" aria-label="Close">✕</button>
      <button class="lb-prev" aria-label="Previous">‹</button>
      <button class="lb-next" aria-label="Next">›</button>
      <img alt="">
      <div class="lb-counter"></div>`;
    document.body.appendChild(el);
    const imgEl = el.querySelector("img");
    const counter = el.querySelector(".lb-counter");
    function show() {
      imgEl.src = lbState.imgs[lbState.index];
      counter.textContent = `${lbState.index + 1} / ${lbState.imgs.length}`;
    }
    function close() {
      el.classList.remove("open");
      document.body.style.overflow = "";
    }
    function next() {
      lbState.index = (lbState.index + 1) % lbState.imgs.length;
      show();
    }
    function prev() {
      lbState.index = (lbState.index - 1 + lbState.imgs.length) % lbState.imgs.length;
      show();
    }
    el.querySelector(".lb-close").addEventListener("click", close);
    el.querySelector(".lb-next").addEventListener("click", next);
    el.querySelector(".lb-prev").addEventListener("click", prev);
    el.addEventListener("click", (e) => {
      if (e.target === el) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
    lbState.el = el;
    lbState.show = show;
    return el;
  }
  function openLightbox(imgs, index) {
    const el = ensureLightbox();
    lbState.imgs = imgs;
    lbState.index = index;
    lbState.show();
    el.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  window.openLightbox = openLightbox;

  // ---------- gallery rendering ----------
  window.renderGalleries = function (lang) {
    const container = document.querySelector("[data-gallery]");
    if (!container || !window.GALLERIES || !window.GALLERY_IMAGES) return;
    const cat = container.getAttribute("data-gallery");
    const projects = window.GALLERIES[cat] || [];
    lang = lang || getLang();
    const html = projects
      .map((p) => {
        const imgs = window.GALLERY_IMAGES[p.folder] || [];
        if (!imgs.length) return "";
        const thumbs = imgs
          .map(
            (url, i) =>
              `<button class="thumb" data-open="${p.folder}:${i}" aria-label="${p.title[lang].replace(/"/g, "&quot;")} — ${i + 1}"><img loading="lazy" src=".${url}" alt="${p.title[lang].replace(/"/g, "&quot;")}"></button>`
          )
          .join("");
        const num = String(projects.indexOf(p) + 1).padStart(2, "0");
        return `
      <article class="project">
        <header class="project-head">
          <span class="num">№ ${num}</span>
          <h3>${p.title[lang]}</h3>
          <span class="count">${imgs.length} ${t("gal.images", lang)}</span>
        </header>
        <div class="project-grid">${thumbs}</div>
      </article>`;
      })
      .join("");
    container.innerHTML = html;

    container.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [folder, idx] = btn.getAttribute("data-open").split(":");
        const imgs = (window.GALLERY_IMAGES[folder] || []).map((u) => "." + u);
        openLightbox(imgs, parseInt(idx, 10));
      });
    });
  };

  // ---------- category cards on gallery landing ----------
  window.renderCategoryCards = function (lang) {
    const container = document.querySelector("[data-gallery-cats]");
    if (!container || !window.GALLERIES) return;
    lang = lang || getLang();
    const cats = [
      { id: "rekonstrukce", href: "galerie-rekonstrukce.html" },
      { id: "novostavby", href: "galerie-novostavby.html" },
      { id: "ocelove", href: "galerie-ocelove.html" },
      { id: "ostatni", href: "galerie-ostatni.html" },
    ];
    container.innerHTML = cats
      .map((c, i) => {
        const items = window.GALLERIES[c.id] || [];
        const count = items.length;
        let cover = "";
        for (const it of items) {
          const imgs = window.GALLERY_IMAGES[it.folder];
          if (imgs && imgs.length) {
            cover = "." + imgs[0];
            break;
          }
        }
        const num = String(i + 1).padStart(2, "0");
        return `
      <a class="cat-card" href="${c.href}">
        <img src="${cover}" alt="${t("gal." + c.id, lang)}" loading="lazy">
        <div class="label">
          <span class="num">— № ${num}</span>
          <h3>${t("gal." + c.id, lang)}</h3>
          <span class="count">${count} ${t("gal.projects", lang)}</span>
        </div>
      </a>`;
      })
      .join("");
  };

  // ---------- scroll reveal ----------
  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    document.body.classList.add("js-ready");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-in").forEach((el) => io.observe(el));
  }

  // ---------- init ----------
  document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    applyLang(getLang());
    if (document.querySelector("[data-gallery-cats]")) window.renderCategoryCards(getLang());
    if (document.querySelector("[data-gallery]")) window.renderGalleries(getLang());
    document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        setLang(btn.getAttribute("data-lang"));
      });
    });
    initReveal();
  });
})();
