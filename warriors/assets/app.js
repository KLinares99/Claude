/* ============================================================================
   THE WARRIORS PROJECT — App logic
   Renders the journey map and the module reader, and persists the warrior's
   progress + journal entries to localStorage (device-local).
============================================================================ */
(function () {
  "use strict";
  const { MODULES, RHYTHM, BRAND, pillarGroups } = window.WARRIORS;

  /* ── tiny helpers ───────────────────────────────────────────────────── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, html) => {
    const n = document.createElement(tag);
    for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const PILL_LABEL = (key) => {
    const g = window.WARRIORS.PILLARS[key];
    return g ? g.name : "";
  };

  /* ── progress store ─────────────────────────────────────────────────── */
  const KEY = "warriors.progress.v1";
  const store = {
    read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } },
    write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch {} },
    done(id) { return !!this.read()[`done.${id}`]; },
    setDone(id, v) { const o = this.read(); o[`done.${id}`] = !!v; this.write(o); },
    journal(id, field) { return this.read()[`j.${id}.${field}`] || ""; },
    setJournal(id, field, val) { const o = this.read(); o[`j.${id}.${field}`] = val; this.write(o); },
  };

  /* ── reveal-on-scroll ───────────────────────────────────────────────── */
  function observeReveals() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((n) => obs.observe(n));
  }

  /* ====================================================================== *
   *  JOURNEY MAP
   * ====================================================================== */
  function renderJourney() {
    const groups = pillarGroups();

    /* Pillar overview grid */
    const grid = $("#pillarGrid");
    if (grid) {
      groups.forEach((g) => {
        const tags = g.modules.map((m) => `<span>${m.id}. ${esc(m.name)}</span>`).join("");
        grid.appendChild(el("div", { class: "pillar-cell" },
          `<div class="pn">PILLAR ${g.n}</div>
           <h3>${esc(g.name)}</h3>
           <p>${esc(g.blurb)}</p>
           <div class="tags">${tags}</div>`));
      });
    }

    /* The winding path */
    const trail = $("#pathTrail");
    if (!trail) return;

    // Module 0 — "The Call" gateway station (full width feel via right side)
    const call = MODULES.find((m) => m.id === 0);
    trail.appendChild(stationEl(call, 0, "right"));

    // Pillar phases, each with its modules in order
    let idx = 1;
    groups.forEach((g) => {
      const banner = el("div", { class: "phase-banner reveal" },
        `<div class="chip"><span class="pn">PILLAR ${g.n}</span><span class="pname">${esc(g.name)}</span></div>`);
      trail.appendChild(banner);
      g.modules.sort((a, b) => a.id - b.id).forEach((m) => {
        trail.appendChild(stationEl(m, idx, idx % 2 ? "left" : "right"));
        idx++;
      });
    });

    observeReveals();
  }

  function stationEl(m, i, side) {
    const done = store.done(m.id);
    const isCall = m.id === 0;
    const nodeCls = done ? "node done" : (isCall ? "node" : "node");
    const dayLabel = isCall ? "MODULE 0" : `DAY ${String(m.day).padStart(2, "0")}`;
    const meta = `
      <div class="meta">
        <span class="daynum">${dayLabel}</span>
        <span class="pill">${esc(PILL_LABEL(m.pillar))}</span>
        ${done ? '<span class="pill" style="color:var(--gold-bright);border-color:var(--line)">✓ Walked</span>' : ""}
      </div>`;
    const ph = m.placeholder ? `<div class="ph-flag">◇ Outline pending</div>` : "";
    const card = `
      <a class="card ${isCall ? "is-call" : ""} ${m.placeholder ? "is-placeholder" : ""}" href="module.html?id=${m.id}">
        ${meta}
        <h4>${isCall ? "The Call to the Warrior's Path" : esc(m.name)}</h4>
        <div class="stitle">${esc(m.subtitle)}</div>
        <div class="idea">${esc(m.coreIdea)}</div>
        ${ph}
        <div class="go">${isCall ? "Enter the journey →" : "Walk this module →"}</div>
      </a>`;
    const wrap = el("div", { class: `station ${side} reveal` },
      `<span class="${nodeCls}"></span>${card}`);
    return wrap;
  }

  /* ====================================================================== *
   *  MODULE READER
   * ====================================================================== */
  function renderModule() {
    const id = parseInt(new URLSearchParams(location.search).get("id") || "0", 10);
    const m = MODULES.find((x) => x.id === id) || MODULES[0];
    const root = $("#reader");
    document.title = `Warriors — ${m.id === 0 ? "Welcome" : "Module " + m.id + " · " + m.name}`;

    root.appendChild(moduleHead(m));

    if (m.type === "welcome") renderWelcome(root, m);
    else renderSkeleton(root, m);

    root.appendChild(markDoneEl(m));
    root.appendChild(readerNav(m));

    wireJournal(root, m);
    updateProgressBar();
    observeReveals();
    window.scrollTo(0, 0);
  }

  function moduleHead(m) {
    const head = el("div", { class: "mod-head" },
      `<div class="roman">${m.id === 0 ? "MODULE 0" : "MODULE " + m.roman}</div>
       <h1>${esc(m.id === 0 ? "Welcome to the Journey" : m.name)}</h1>
       <div class="stitle">${esc(m.subtitle)}</div>
       <div class="idea">${esc(m.coreIdea)}</div>
       <div class="progress-track"><div class="progress-fill" id="pfill"></div></div>`);
    return head;
  }

  /* ---- Module 0: full welcome experience ----------------------------- */
  function renderWelcome(root, m) {
    const c = m.content;

    // I — Letter from Robert
    root.appendChild(block(c.letter.eyebrow, c.letter.title, () => {
      const p = c.letter.body.map((t) => `<p>${esc(t)}</p>`).join("");
      return `<div class="panel">${p}
        <p style="margin-top:18px"><span style="font-family:var(--f-display);letter-spacing:.08em;color:var(--gold-bright)">${esc(c.letter.signoff)}</span><br>
        <span class="dim" style="font-style:italic">${esc(c.letter.role)}</span></p></div>`;
    }));

    // II — This is for you
    root.appendChild(block(c.forYou.eyebrow, c.forYou.title, () => {
      const lis = c.forYou.lines.map((t) => `<li>${esc(t)}</li>`).join("");
      return `<ul class="litany">${lis}</ul><div class="litany"><div class="close">${esc(c.forYou.close)}</div></div>`;
    }));

    // III/IV — Welcome + transformation
    root.appendChild(block(c.welcome.eyebrow, c.welcome.title, () => {
      const su = c.welcome.summoned.map((s) => `<li><b>${esc(s.who)}</b> ${esc(s.where)}</li>`).join("");
      return `<p class="lead">${esc(c.welcome.intro)}</p>
        <ul class="summoned">${su}</ul>
        <p style="margin-top:22px" class="dim">${esc(c.welcome.transform)}</p>`;
    }));

    // V — Six pillars
    root.appendChild(block(c.pillars.eyebrow, c.pillars.title, () => {
      const items = pillarGroups().map((g) =>
        `<div class="pi"><div class="pn">PILLAR ${g.n}</div><h4>${esc(g.name)}</h4><p>${esc(g.blurb)}</p></div>`).join("");
      return `<p class="dim">${esc(c.pillars.intro)}</p>
        <div class="pillar-list" style="margin:22px 0">${items}</div>
        <div class="panel" style="text-align:center;font-style:italic">${esc(c.pillars.note)}</div>`;
    }));

    // VI — How each module works (the 7-part rhythm)
    root.appendChild(block(c.rhythm.eyebrow, c.rhythm.title, () => {
      const items = RHYTHM.map((r) =>
        `<div class="rhythm-item"><div class="rn">${r.n}</div><div><h4>${esc(r.name)}</h4><p>${esc(r.desc)}</p></div></div>`).join("");
      return `<p class="dim">${esc(c.rhythm.intro)}</p>
        <div class="rhythm-list" style="margin:22px 0">${items}</div>
        <p style="font-style:italic;color:var(--gold-bright)">${esc(c.rhythm.close)}</p>`;
    }));

    // VII — What you will become
    root.appendChild(block(c.promise.eyebrow, c.promise.title, () => {
      const cells = c.promise.pairs.flat().map((t) => {
        const i = t.indexOf(" in ");
        const head = i > 0 ? t.slice(0, i) : t;
        const tail = i > 0 ? t.slice(i) : "";
        return `<div><b>${esc(head)}</b>${esc(tail)}</div>`;
      }).join("");
      return `<p class="dim">${esc(c.promise.intro)}</p>
        <div class="promise-grid" style="margin:22px 0">${cells}</div>
        <div class="panel" style="text-align:center"><span style="font-family:var(--f-display);color:var(--gold-bright);letter-spacing:.04em;font-size:22px">${esc(c.promise.punch)}</span></div>
        <p style="margin-top:18px" class="dim">${esc(c.promise.close)}</p>`;
    }));

    // VIII — Warrior's posture
    root.appendChild(block(c.posture.eyebrow, c.posture.title, () => {
      const items = c.posture.items.map((p) =>
        `<div class="posture-item"><div class="word">${esc(p.word)}</div><p>${esc(p.desc)}</p></div>`).join("");
      return `<p class="dim">${esc(c.posture.intro)}</p>${items}
        <div class="panel" style="margin-top:22px;text-align:center;font-style:italic">${esc(c.posture.close)}</div>`;
    }));

    // IX — Questions before day one (journaling)
    root.appendChild(block(c.questions.eyebrow, c.questions.title, () => {
      const items = c.questions.items.map((q, i) =>
        `<li><div class="qbody">${esc(q)}<textarea data-journal="q${i}" placeholder="Write honestly…"></textarea></div></li>`).join("");
      return `<p class="dim">${esc(c.questions.intro)}</p><ul class="q-list" style="margin-top:18px">${items}</ul>`;
    }));

    // X — Commitment
    root.appendChild(block(c.commitment.eyebrow, c.commitment.title, () => {
      return `<p class="dim">${esc(c.commitment.intro)}</p>
        <div class="commit-panel" style="margin-top:18px">
          <div class="commit-fields">
            <div><input data-journal="name" placeholder="Your name" /><label>Warrior</label></div>
            <div><input data-journal="date" placeholder="Today's date" /><label>Date</label></div>
          </div>
          <p class="pledge">${esc(c.commitment.pledge)}</p>
          <div class="aloud">${esc(c.commitment.aloud)}</div>
        </div>`;
    }));

    // XI — Prayer of consecration
    root.appendChild(block(c.prayer.eyebrow, c.prayer.title, () => {
      const lines = c.prayer.body.map((t) => `<p>${esc(t)}</p>`).join("");
      return `<div class="panel prayer">${lines}<div class="amen">${esc(c.prayer.amen)}</div></div>`;
    }));
  }

  function block(eyebrow, title, bodyFn) {
    return el("section", { class: "block reveal" },
      `<span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${bodyFn()}`);
  }

  /* ---- Modules 1–14: skeleton scaffold ------------------------------- */
  function renderSkeleton(root, m) {
    // Anchor scriptures
    const scrip = el("section", { class: "skel-section reveal" });
    scrip.innerHTML = `
      <div class="lbl"><span class="n">01</span><h3>Anchor Scriptures</h3><span class="desc">Read slowly. Underline what arrests your heart.</span></div>`;
    if (m.scriptures && m.scriptures.length) {
      scrip.appendChild(el("div", { class: "scripture-chips" },
        m.scriptures.map((s) => `<span>${esc(s)}</span>`).join("")));
    } else {
      scrip.appendChild(el("div", { class: "placeholder-note", html: "Anchor scriptures to be selected." }));
    }
    root.appendChild(scrip);

    // Placeholder banner for modules without source copy yet
    if (m.placeholder) {
      root.appendChild(el("section", { class: "skel-section reveal" }, `
        <div class="placeholder-note">
          <b>◇ Outline pending.</b> This station is reserved in the 14-day path. The master
          workbook draft does not yet contain distinct copy for this module — drop the approved
          teaching here and the seven-part rhythm below will populate automatically.
        </div>`));
    }

    // The seven-part rhythm scaffold (2–7), with journal fields
    RHYTHM.slice(1).forEach((r, i) => {
      const sec = el("section", { class: "skel-section reveal" });
      sec.innerHTML = `<div class="lbl"><span class="n">${r.n}</span><h3>${esc(r.name)}</h3><span class="desc">${esc(r.desc)}</span></div>`;
      if (r.name === "The Warrior's Creed" && m.creed) {
        sec.appendChild(el("div", { class: "creed-banner" },
          `<div class="lbl-c"><span class="lbl">Write it · Say it · Own it</span></div>
           <div class="creed">"${esc(m.creed)}"</div>`));
        sec.appendChild(el("textarea", { class: "write", "data-journal": "creed", placeholder: "Your personal version…" }));
      } else if (r.name === "Prayer") {
        sec.appendChild(el("div", { class: "placeholder-note" },
          m.placeholder ? "Closing prayer to be added." : "A closing prayer will be written to seal the day's work."));
      } else {
        sec.appendChild(el("textarea", { class: "write", "data-journal": `s${r.n}`,
          placeholder: r.name === "Journal Space" ? "Be honest. Be raw. Write what you normally hide…" : "Your notes…" }));
      }
      root.appendChild(sec);
    });
  }

  /* ---- shared reader chrome ------------------------------------------ */
  function markDoneEl(m) {
    const done = store.done(m.id);
    const wrap = el("div", { class: "mark-done" });
    const btn = el("button", { class: "btn" + (done ? " ghost" : "") },
      done ? "✓ Module Walked — Undo" : (m.id === 0 ? "I Commit — Begin the Path →" : "Mark This Module Walked →"));
    btn.addEventListener("click", () => {
      store.setDone(m.id, !store.done(m.id));
      const nowDone = store.done(m.id);
      btn.textContent = nowDone ? "✓ Module Walked — Undo" : (m.id === 0 ? "I Commit — Begin the Path →" : "Mark This Module Walked →");
      btn.classList.toggle("ghost", nowDone);
      if (nowDone) {
        const next = MODULES.find((x) => x.id === m.id + 1);
        if (next) setTimeout(() => { location.href = `module.html?id=${next.id}`; }, 450);
      }
    });
    wrap.appendChild(btn);
    return wrap;
  }

  function readerNav(m) {
    const prev = MODULES.find((x) => x.id === m.id - 1);
    const next = MODULES.find((x) => x.id === m.id + 1);
    const nav = el("nav", { class: "reader-nav" });
    nav.appendChild(el("a", { class: "prev" + (prev ? "" : " disabled"), href: prev ? `module.html?id=${prev.id}` : "#" },
      prev ? `← Previous<span>${esc(prev.id === 0 ? "Welcome" : prev.name)}</span>` : "← Start<span>You're at the gate</span>"));
    nav.appendChild(el("a", { class: "next" + (next ? "" : " disabled"), href: next ? `module.html?id=${next.id}` : "index.html" },
      next ? `Next →<span>${esc(next.name)}</span>` : `Finish →<span>Return to the Path</span>`));
    return nav;
  }

  function wireJournal(root, m) {
    root.querySelectorAll("[data-journal]").forEach((node) => {
      const field = node.getAttribute("data-journal");
      node.value = store.journal(m.id, field);
      node.addEventListener("input", () => store.setJournal(m.id, field, node.value));
    });
  }

  function updateProgressBar() {
    const total = MODULES.length;
    const done = MODULES.filter((x) => store.done(x.id)).length;
    const fill = $("#pfill");
    if (fill) fill.style.width = Math.round((done / total) * 100) + "%";
  }

  /* expose */
  window.WarriorsApp = { renderJourney, renderModule };
})();
