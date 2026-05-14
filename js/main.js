const GRAFIKA_ITEMS = [
  {
    title: "Miniaturka 3D",
    subtitle: "Stworzona pod Twój projekt",
    desc: "Czysta kompozycja, czytelna z daleka. Idealna pod kanał i skróty.",
    thumb: "img/miniaturka1.png",
    full: "img/miniaturka1.png",
  },
  {
    title: "Miniaturka 3D",
    subtitle: "Stworzona pod Twój projekt",
    desc: "Spójna paleta z brandingiem serwera, zero losowych kolorów.",
    thumb: "img/miniaturka2.png",
    full: "img/miniaturka2.png",
  },
  {
    title: "Miniaturka 3D",
    subtitle: "Stworzona pod Twój projekt",
    desc: "Miniaturka 3D — Neon i głębia bez przeładowania — pasuje do trailera i live.",
    thumb: "img/miniaturka3.png",
    full: "img/miniaturka3.png",
  },
  {
    title: "Miniaturka 3D",
    subtitle: "Stworzona pod Twój projekt",
    desc: "Kontrast pod małe miniatury — tytuł czytelny na telefonie.",
    thumb: "img/miniaturka4.png",
    full: "img/miniaturka4.png",
  },
  {
    title: "Miniaturka 3D",
    subtitle: "Stworzona pod Twój projekt",
    desc: "Klimat „premium” bez sztucznego błysku — stonowane światło.",
    thumb: "img/miniaturka5.png",
    full: "img/miniaturka5.png",
  },
  {
    title: "Miniaturka 3D",
    subtitle: "Stworzona pod Twój projekt",
    desc: "Szybka iteracja: wersje pod A/B i sezonowe okładki.",
    thumb: "img/miniaturka6.png",
    full: "img/miniaturka6.png",
  },
];

function parseJsonScript(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const t = el.textContent.trim();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

function getGraphicsItems() {
  const raw = parseJsonScript("graphics-portfolio");
  if (Array.isArray(raw) && raw.length > 0) {
    const ok = raw.filter((x) => x && typeof x.thumb === "string" && typeof x.full === "string");
    if (ok.length > 0) return ok;
  }
  return GRAFIKA_ITEMS;
}

function getTikTokUrls() {
  const raw = parseJsonScript("portfolio-tiktok-urls");
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter((x) => typeof x === "string" && x.trim());
  }
  return [];
}

function extractTikTokVideoId(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  try {
    const href = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    const u = new URL(href);
    const m = u.pathname.match(/\/video\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function buildTikTokPlayerUrl(videoId) {
  const q = new URLSearchParams({
    music_info: "0",
    description: "0",
  });
  return `https://www.tiktok.com/player/v1/${videoId}?${q}`;
}

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return () => {};
  const img = lightbox.querySelector(".lightbox-img");
  const cap = lightbox.querySelector(".lightbox-caption");
  const closeBtn = lightbox.querySelector(".lightbox-close");

  function close() {
    lightbox.hidden = true;
    if (img) img.src = "";
    document.body.style.overflow = "";
  }

  function open(src, title, desc) {
    if (img) {
      img.src = src;
      img.alt = title || "";
    }
    if (cap) cap.textContent = desc ? `${title} — ${desc}` : title || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  if (closeBtn) closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.hidden && e.key === "Escape") close();
  });

  return open;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initGraphicsGrid(openLightbox) {
  const grid = document.getElementById("graphics-grid");
  if (!grid) return;

  const items = getGraphicsItems();
  grid.innerHTML = "";

  items.forEach((item, index) => {
    const title = item.title || `Praca ${index + 1}`;
    const subtitle = item.subtitle || "Stworzona pod Twój projekt";
    const desc = item.desc || "";
    const thumb = item.thumb;
    const full = item.full;

    const article = document.createElement("article");
    article.className = "graphic-tile";
    article.setAttribute("role", "listitem");
    article.tabIndex = 0;
    article.setAttribute("aria-label", `Powiększ: ${title}`);

    article.innerHTML = `
      <div class="graphic-tile-thumb">
        <img src="${escapeHtml(thumb)}" alt="" width="640" height="360" loading="lazy" decoding="async" />
      </div>
      <div class="graphic-tile-body">
        <h3 class="graphic-tile-title">${escapeHtml(title)}</h3>
        <p class="graphic-tile-sub">${escapeHtml(subtitle)}</p>
        ${desc ? `<p class="graphic-tile-desc">${escapeHtml(desc)}</p>` : ""}
      </div>
    `;

    const open = () => openLightbox(full, title, desc);
    article.addEventListener("click", open);
    article.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });

    grid.appendChild(article);
  });
}

function initTikTokStrip() {
  const container = document.getElementById("films-scroller");
  const emptyHint = document.getElementById("films-empty");
  if (!container) return;

  const urls = getTikTokUrls();
  container.innerHTML = "";

  if (urls.length === 0) {
    if (emptyHint) emptyHint.hidden = false;
    return;
  }
  if (emptyHint) emptyHint.hidden = true;

  urls.forEach((url) => {
    const id = extractTikTokVideoId(url);
    if (!id) return;

    const card = document.createElement("div");
    card.className = "tiktok-card";
    card.setAttribute("role", "listitem");

    const wrap = document.createElement("div");
    wrap.className = "tiktok-embed";

    const iframe = document.createElement("iframe");
    iframe.src = buildTikTokPlayerUrl(id);
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute(
      "allow",
      "fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    );
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("title", `TikTok ${id}`);
    iframe.referrerPolicy = "strict-origin-when-cross-origin";

    wrap.appendChild(iframe);
    card.appendChild(wrap);
    container.appendChild(card);
  });
}

document.getElementById("year").textContent = String(new Date().getFullYear());

const openLightbox = initLightbox();
initGraphicsGrid(openLightbox);
initTikTokStrip();

function initToolsCarousel() {
  const wrap = document.getElementById("hero-tools");
  if (!wrap) return;

  const buttons = Array.from(wrap.querySelectorAll(".tool-logo"));
  if (buttons.length === 0) return;

  const clearActive = () => {
    buttons.forEach((b) => b.classList.remove("is-active"));
  };

  const setActive = (i) => {
    clearActive();
    if (buttons[i]) buttons[i].classList.add("is-active");
  };

  // Start: same szarości (kolor tylko na najeździe / fokusu)
  clearActive();

  buttons.forEach((btn, i) => {
    btn.addEventListener("mouseenter", () => setActive(i));
    btn.addEventListener("mouseleave", clearActive);
    btn.addEventListener("focus", () => setActive(i));
    btn.addEventListener("blur", clearActive);
    btn.addEventListener("click", () => setActive(i));
  });
}

initToolsCarousel();

function initIntroWords() {
  const overlay = document.getElementById("intro-overlay");
  if (!overlay) return;

  const words = Array.from(overlay.querySelectorAll(".intro-word"));
  if (words.length === 0) {
    overlay.classList.add("is-hidden");
    document.body.classList.remove("intro-lock");
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    overlay.classList.add("is-hidden");
    document.body.classList.remove("intro-lock");
    return;
  }

  let idx = 0;
  const fontClasses = ["font-variant-a", "font-variant-b", "font-variant-c", "font-variant-d"];
  let fontTimer = null;
  let fontIdx = 0;

  const clearFontClasses = (el) => {
    fontClasses.forEach((c) => el.classList.remove(c));
  };

  const startFontShuffle = (el) => {
    clearFontClasses(el);
    el.classList.add(fontClasses[0]);
    if (fontTimer) window.clearInterval(fontTimer);
    fontTimer = window.setInterval(() => {
      fontIdx = (fontIdx + 1) % fontClasses.length;
      clearFontClasses(el);
      el.classList.add(fontClasses[fontIdx]);
    }, 95);
  };

  const stopFontShuffle = () => {
    if (fontTimer) {
      window.clearInterval(fontTimer);
      fontTimer = null;
    }
  };

  const showWord = (i) => {
    words.forEach((w, n) => w.classList.toggle("is-visible", n === i));
    fontIdx = 0;
    startFontShuffle(words[i]);
  };

  showWord(idx);

  const stepMs = 620;
  const holdMs = 380;
  const timer = window.setInterval(() => {
    idx += 1;
    if (idx >= words.length) {
      window.clearInterval(timer);
      stopFontShuffle();
      window.setTimeout(() => {
        overlay.classList.add("is-hidden");
        document.body.classList.remove("intro-lock");
      }, holdMs);
      return;
    }
    showWord(idx);
  }, stepMs);
}

initIntroWords();

(function syncDiscordHeroLink() {
  const main = document.getElementById("link-discord");
  const hero = document.getElementById("hero-discord-link");
  if (!main || !hero) return;
  const u = main.getAttribute("href") || "";
  if (u && u !== "https://discord.gg/" && u !== "#") {
    hero.href = u;
  }
})();
