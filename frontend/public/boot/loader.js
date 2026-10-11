/* ═══════════════════════════════════════════════════════════════
   Лоадер «Нулевой закон» — boot-экран из сканера вин на чистом JS.

   Лежит в public/, а не в бандле: рисуется до того, как скачается и
   разберётся приложение. Пропускается любой клавишей или касанием; не
   показывается при prefers-reduced-motion, на /auth/* (возврат из
   Keycloak) и повторно в той же вкладке — решение принято в <head>.

   Строки лога — живые ответы стенда: /api/v1/health, /api/v1/ready
   (PostgreSQL и Redis) и OIDC-discovery Keycloak. На моках MSW бэкенда
   нет, и лог так и говорит.

   По завершении: body теряет loading, получает loader-gone, документ —
   событие loader:gone.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const root = document.getElementById("page-loader");

  function gone() {
    document.body.classList.remove("loading");
    document.body.classList.add("loader-gone");
    document.dispatchEvent(new CustomEvent("loader:gone"));
  }

  if (!root || document.documentElement.classList.contains("boot-skip")) {
    root?.remove();
    gone();
    return;
  }
  try { sessionStorage.setItem("scout.boot", "1"); } catch {}

  /* Настройки сборки приходят через %VITE_…% в index.html; незаданная
     переменная остаётся плейсхолдером */
  const env = (v) => (v && !v.startsWith("%") ? v : null);
  const apiMock = env(root.dataset.mock) !== "false";
  const authority = (env(root.dataset.authority) ?? "http://localhost:8080/realms/scout").replace(/\/$/, "");

  /* ── Тайминги ── */
  const FIRST_STEP = 250;   // первая строка лога
  const STEP       = 150;   // шаг между строками
  const HOLD       = 750;   // выдержка после последней строки
  const LEAVE_MS   = 860;   // полный уход
  const HEALTH_MS  = 1200;  // дольше стенд не ждём

  /* ── Знак: перечёркнутый ноль. Кольцо — внешний эллипс по часовой,
     внутренний против (дыра по nonzero), черта — по часовой ── */
  const MARK =
    "M8 60 A42 52 0 1 1 92 60 A42 52 0 1 1 8 60 Z " +
    "M28 60 A22 36 0 1 0 72 60 A22 36 0 1 0 28 60 Z " +
    "M33 92 L63 24 L71 28 L41 96 Z";

  /* ── Буквы 5×7 ── */
  const GLYPHS = {
    "Н": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "У": ["10001", "10001", "10001", "01111", "00001", "00001", "11110"],
    "Л": ["00111", "01001", "01001", "01001", "01001", "01001", "11001"],
    "Е": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "В": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "О": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "Й": ["01010", "10001", "10011", "10101", "11001", "10001", "10001"],
    "З": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
    "А": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "К": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  };

  /* ── Разметка ── */

  /* Сетка 31×13: задержка и яркость растут от центра, каждая ~десятая
     точка — акцентная */
  function gridCells() {
    const far = Math.hypot(15, 6);
    let html = "";
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 31; col++) {
        const dist = Math.hypot(col - 15, (row - 6) * 1.6);
        const k = 31 * row + col;
        const accent = (0x9e3779b1 * k) % 97 < 9;
        const fade = Math.max(0, 1 - dist / (1.25 * far));
        const peak = (accent ? 1 : .55) * (.35 + .65 * fade);
        const rest = ((accent ? .5 : .14) * fade).toFixed(3);
        html += `<span class="boot__cell${accent ? " boot__cell--accent" : ""}" ` +
                `style="--d:${120 + Math.round(48 * dist)}ms;--peak:${peak};--rest:${rest}"></span>`;
      }
    }
    return html;
  }

  /* Буквы встают по очереди, точки внутри зажигаются сверху вниз */
  function wordHtml(text) {
    let i = 0;
    return text.split(" ").map((w) => {
      const letters = [...w].map((ch) => {
        const d = 700 + 55 * i++;
        const px = GLYPHS[ch].join("").split("").map((on, j) => on === "1"
          ? `<span class="boot__px boot__px--on" style="--pd:${d + 120 + 22 * Math.floor(j / 5) + 9 * (j % 5)}ms"></span>`
          : '<span class="boot__px"></span>').join("");
        return `<span class="boot__letter" style="--d:${d}ms">${px}</span>`;
      }).join("");
      return `<span class="boot__group">${letters}</span>`;
    }).join("");
  }

  const coarse = matchMedia("(pointer: coarse)").matches;

  root.className = "boot";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <div class="boot__half boot__half--top"></div>
    <div class="boot__half boot__half--bottom"></div>
    <div class="boot__seam"></div>
    <div class="boot__stage">
      <div class="boot__emblem">
        <div class="boot__grid">${gridCells()}</div>
        <span class="boot__glow"></span>
        <span class="boot__shade"></span>
        <svg class="boot__mark" viewBox="0 0 100 120">
          <path class="boot__trace" d="${MARK}" pathLength="1" fill-rule="nonzero"
                fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="boot__word">${wordHtml("НУЛЕВОЙ ЗАКОН")}</div>
      <div class="boot__progress">
        <div class="boot__meta">
          <span class="boot__label boot__count">00/00</span>
          <span class="boot__label boot__version">скаут × фсп</span>
        </div>
        <div class="boot__bar"></div>
        <div class="boot__log"></div>
      </div>
      <span class="boot__label boot__hint">${coarse ? "коснись, чтобы пропустить" : "нажми любую клавишу"}</span>
    </div>`;

  const count = root.querySelector(".boot__count");
  const bar = root.querySelector(".boot__bar");
  const log = root.querySelector(".boot__log");

  /* ── Строки лога со стенда ── */

  function getJson(url, ctl) {
    return fetch(url, { signal: ctl.signal, cache: "no-store" }).then((r) =>
      r.json().catch(() => ({})).then((body) => ({ ok: r.ok, body })));
  }

  function fetchLines() {
    if (apiMock) return Promise.resolve([["режим", "демо-данные, бэкенд не нужен", true]]);
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), HEALTH_MS);
    const fail = () => ({ ok: false, body: {} });
    return Promise.all([
      getJson("/api/v1/health", ctl).catch(fail),
      getJson("/api/v1/ready", ctl).catch(fail),
      getJson(`${authority}/.well-known/openid-configuration`, ctl).catch(fail),
    ]).then(([health, ready, oidc]) => {
      const realm = typeof oidc.body.issuer === "string" ? oidc.body.issuer.split("/").pop() : null;
      return [
        ["api", health.ok ? health.body.status || "ok" : "нет ответа", health.ok],
        ["postgres · redis", ready.ok ? "ok" : "недоступны", ready.ok],
        ["keycloak", oidc.ok && realm ? `realm ${realm}` : "нет ответа", oidc.ok && !!realm],
      ];
    }).finally(() => clearTimeout(timer));
  }

  /* ── Ход ── */

  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let lines = [];
  let leaving = false;

  function step(p) {
    const total = lines.length;
    const done = p >= total;
    count.textContent = done ? "готово" : `${pad(p)}/${pad(total)}`;
    count.classList.toggle("is-ready", done);
    bar.classList.toggle("is-ready", done);
    [...bar.children].forEach((seg, i) => {
      seg.className = "boot__seg" + (i < p ? " is-done" : "") + (i === p ? " is-live" : "");
    });
    if (p > 0) {
      const [name, value, ok] = lines[p - 1];
      log.innerHTML = `<span class="boot__line"><span class="boot__n">${pad(p)}</span>` +
        `<span class="boot__ok${ok ? "" : " boot__ok--err"}">${ok ? "ok" : "err"}</span>` +
        `<span class="boot__text">${esc(name)}  ${esc(value)}</span></span>`;
    }
  }

  function leave() {
    if (leaving) return;
    leaving = true;
    timers.forEach(clearTimeout);
    root.classList.add("is-leaving");
    document.body.classList.remove("loading");
    setTimeout(() => { root.remove(); gone(); }, LEAVE_MS);
  }

  /* Знак и слово дорисовываются к ~1.6 с — лог не уходит раньше */
  const MIN_SHOW = 1900;
  const started = performance.now();

  fetchLines().then((got) => {
    if (leaving) return;
    lines = got;
    bar.innerHTML = lines.map(() => '<span class="boot__seg"></span>').join("");
    step(0);
    const elapsed = performance.now() - started;
    const offset = Math.max(0, FIRST_STEP - elapsed);
    const stepMs = Math.max(STEP, (MIN_SHOW - elapsed - offset - HOLD) / Math.max(1, lines.length - 1));
    lines.forEach((_, i) => later(() => step(i + 1), offset + stepMs * i));
    later(leave, offset + stepMs * (lines.length - 1) + HOLD);
  });

  /* Пропуск — любая клавиша или касание */
  addEventListener("keydown", leave, { once: true });
  addEventListener("pointerdown", leave, { once: true });
})();
