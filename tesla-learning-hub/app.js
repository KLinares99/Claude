/* Tesla Learning Hub — vanilla JS single-page app, no build step. */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var nav = document.getElementById("nav");

  var SECTIONS = [
    { id: "home", label: "⚡ Home" },
    { id: "life", label: "Life & Times" },
    { id: "inventions", label: "Inventions & Projects" },
    { id: "patents", label: "Patents & Blueprints" },
    { id: "mind", label: "The Mind Lab" },
    { id: "library", label: "Library" },
    { id: "quiz", label: "Quiz" }
  ];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function paras(arr) {
    return arr.map(function (p) { return "<p>" + p + "</p>"; }).join("");
  }
  function patentUrl(num) {
    return "https://patents.google.com/patent/US" + num.replace(/^US/, "") + "A/en";
  }
  function fmtNum(num) {
    return num.replace(/^US/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* ── Home ─────────────────────────────────────────────── */
  function renderHome() {
    return (
      '<div class="hero">' +
        "<h2>The Man Who Invented the Twentieth Century</h2>" +
        '<p class="lead">Nikola Tesla (1856–1943) gave the world the alternating-current power system, the induction motor, ' +
        "the Tesla coil, the fundamentals of radio, and the first remote control — and left behind one of history's most " +
        "fascinating accounts of how a mind can be trained to invent: nightly dream-journeys, total-immersion visualization, " +
        "and machines built and tested entirely in imagination.</p>" +
        "<blockquote>&ldquo;It is absolutely immaterial to me whether I run my turbine in thought or test it in my shop&hellip; " +
        "Invariably my device works as I conceived that it should.&rdquo;" +
        "<cite>— Nikola Tesla, <em>My Inventions</em> (1919)</cite></blockquote>" +
      "</div>" +
      '<div class="stats">' +
        '<div class="stat"><span class="n">~300</span><span class="l">patents worldwide</span></div>' +
        '<div class="stat"><span class="n">1888</span><span class="l">AC polyphase patents</span></div>' +
        '<div class="stat"><span class="n">100+ ft</span><span class="l">artificial lightning bolts</span></div>' +
        '<div class="stat"><span class="n">8</span><span class="l">languages spoken</span></div>' +
        '<div class="stat"><span class="n">1 T</span><span class="l">the SI unit bearing his name</span></div>' +
      "</div>" +
      '<h2 class="section-title">Explore the Hub</h2>' +
      '<div class="grid cols-3">' +
        homeCard("life", "Life &amp; Times", "From a lightning-storm birth in Smiljan to room 3327 of the Hotel New Yorker — six chapters and a full interactive timeline.") +
        homeCard("inventions", "Inventions &amp; Projects", "AC power, the induction motor, radio, remote control, Niagara, Colorado Springs, Wardenclyffe, the turbine and valve — what each was and why it mattered.") +
        homeCard("patents", "Patents &amp; Blueprints", "A searchable library of his landmark patents, each linking to the complete original documents and drawings — the actual blueprints.") +
        homeCard("mind", "The Mind Lab ✦", "His documented visions, nightly dream-journeys, and visualization method — plus a practical toolkit of lucid dreaming and mental-prototyping exercises.") +
        homeCard("library", "Library", "Tesla's own writings free to read, verified (and debunked) quotes, myths vs facts, and the world's best Tesla archives.") +
        homeCard("quiz", "Quiz", "Twelve questions to test what you've learned. Explanations included — missing is learning too.") +
      "</div>"
    );
  }
  function homeCard(id, title, desc) {
    return '<div class="card clickable" data-nav="' + id + '"><h3>' + title + "</h3><p class=\"dim\">" + desc + "</p></div>";
  }

  /* ── Life ─────────────────────────────────────────────── */
  function renderLife() {
    var chapters = window.TESLA_BIO.map(function (ch, i) {
      return (
        "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(ch.title) +
        ' <span class="pill gold">' + esc(ch.period) + "</span></summary>" +
        '<div class="body">' + paras(ch.body) + "</div></details>"
      );
    }).join("");

    var tl = window.TESLA_TIMELINE.map(function (t) {
      return (
        '<div class="t-item' + (t.major ? " major" : "") + '">' +
        '<span class="t-year">' + esc(t.year) + "</span> — " +
        '<span class="t-title">' + esc(t.title) + "</span>" +
        '<div class="t-body">' + t.body + "</div></div>"
      );
    }).join("");

    return (
      '<h2 class="section-title">Life &amp; Times</h2>' +
      '<p class="section-sub">Six chapters of a singular life, drawn from Tesla’s autobiography and the standard biographies. Open each chapter, then walk the full timeline below.</p>' +
      chapters +
      '<h2 class="section-title">Timeline: 1856–2013</h2>' +
      '<p class="section-sub">Bright dots mark the pivotal moments.</p>' +
      '<div class="timeline">' + tl + "</div>"
    );
  }

  /* ── Inventions ───────────────────────────────────────── */
  function renderInventions() {
    var cards = window.TESLA_INVENTIONS.map(function (inv, i) {
      var pat = inv.patents.length
        ? '<p class="dim">Patents: ' + inv.patents.map(function (p) {
            return '<a href="' + patentUrl(p) + '" target="_blank" rel="noopener">US ' + fmtNum(p) + "</a>";
          }).join(" &middot; ") + "</p>"
        : "";
      return (
        "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(inv.name) +
        ' <span class="pill blue">' + esc(inv.tag) + '</span><span class="pill">' + esc(inv.year) + "</span></summary>" +
        '<div class="body"><p><strong>' + esc(inv.summary) + "</strong></p><p>" + inv.detail + "</p>" + pat + "</div></details>"
      );
    }).join("");
    return (
      '<h2 class="section-title">Inventions &amp; Great Projects</h2>' +
      '<p class="section-sub">What he built, what he almost built, and what he saw coming. Patent links open the original documents with full drawings.</p>' +
      cards
    );
  }

  /* ── Patents ──────────────────────────────────────────── */
  function renderPatents() {
    var f = window.TESLA_PATENT_FACTS;
    var cats = [];
    window.TESLA_PATENTS.forEach(function (p) { if (cats.indexOf(p.cat) === -1) cats.push(p.cat); });

    return (
      '<h2 class="section-title">Patents &amp; Blueprints</h2>' +
      '<p class="section-sub">Tesla held ' + f.usCount + " and " + f.worldCount +
      ". Every link below opens the complete original patent — full text <em>and</em> the drawings, i.e. the actual blueprints — free on Google Patents. " +
      'Or browse <a href="https://patents.google.com/?inventor=nikola+tesla" target="_blank" rel="noopener">every Tesla patent at once</a>.</p>' +
      '<div class="stats">' +
        '<div class="stat"><span class="n">112</span><span class="l">U.S. patents</span></div>' +
        '<div class="stat"><span class="n">26</span><span class="l">countries with Tesla patents</span></div>' +
        '<div class="stat"><span class="n">1886</span><span class="l">first patent</span></div>' +
        '<div class="stat"><span class="n">1928</span><span class="l">last patent (VTOL aircraft)</span></div>' +
      "</div>" +
      '<div class="filter-row">' +
        '<input id="patent-search" type="search" placeholder="Search patents… (e.g. motor, wireless, turbine, 1898)" aria-label="Search patents" />' +
      "</div>" +
      '<div class="table-wrap"><table id="patent-table"><thead><tr>' +
      "<th>Patent</th><th>Year</th><th>Title</th><th>Category</th><th>Why it matters</th>" +
      "</tr></thead><tbody>" +
      window.TESLA_PATENTS.map(function (p) {
        return (
          '<tr data-search="' + esc((p.num + " " + p.year + " " + p.title + " " + p.cat + " " + p.note).toLowerCase()) + '">' +
          '<td><a href="' + patentUrl(p.num) + '" target="_blank" rel="noopener">US ' + fmtNum(p.num) + "</a></td>" +
          "<td>" + p.year + "</td>" +
          "<td><strong>" + esc(p.title) + "</strong></td>" +
          '<td><span class="pill violet">' + esc(p.cat) + "</span></td>" +
          '<td class="dim">' + esc(p.note) + "</td></tr>"
        );
      }).join("") +
      "</tbody></table></div>" +
      '<div class="note blue">Tip: on each Google Patents page, the original drawings are viewable and downloadable as PDF — Tesla’s hand-approved figures of motors, coils, the remote-control boat, the turbine, and the Wardenclyffe transmitter.</div>'
    );
  }

  /* ── Mind Lab ─────────────────────────────────────────── */
  function renderMind() {
    var M = window.TESLA_MIND;
    var docs = M.documented.map(function (d, i) {
      return (
        "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(d.title) + "</summary>" +
        '<div class="body">' + paras(d.body) +
        '<p class="dim">Source: ' + esc(d.source) + "</p></div></details>"
      );
    }).join("");

    var pracs = M.practices.map(function (p) {
      return (
        "<details><summary>" + esc(p.title) + "</summary>" +
        '<div class="body"><p><strong>Goal:</strong> ' + esc(p.goal) + "</p>" +
        '<ol class="steps">' + p.steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>" +
        '<div class="note violet">' + p.note + "</div></div></details>"
      );
    }).join("");

    return (
      '<h2 class="section-title">The Mind Lab ✦</h2>' +
      '<p class="section-sub">' + M.intro + "</p>" +
      '<h2 class="section-title">What Tesla Actually Described</h2>' +
      '<p class="section-sub">The documented record, mostly in his own words from <em>My Inventions</em> (1919).</p>' +
      docs +
      '<h2 class="section-title">The Practice Toolkit</h2>' +
      '<p class="section-sub">' + M.practiceIntro + "</p>" +
      pracs +
      '<div class="note">' + M.disclaimer + "</div>"
    );
  }

  /* ── Library ──────────────────────────────────────────── */
  function renderLibrary() {
    var writings = window.TESLA_WRITINGS.map(function (w) {
      return (
        '<div class="card"><h3><a href="' + w.link + '" target="_blank" rel="noopener">' + esc(w.title) + "</a></h3>" +
        '<p class="dim">' + esc(w.year) + " &middot; " + esc(w.where) + "</p><p>" + esc(w.desc) + "</p></div>"
      );
    }).join("");

    var quotes = window.TESLA_QUOTES.map(function (q) {
      return (
        '<div class="card quote-card"><blockquote>&ldquo;' + esc(q.text) + "&rdquo;</blockquote>" +
        "<cite>" + (q.verified ? "✅ Documented — " : "⚠️ Attributed — ") + esc(q.src) + "</cite></div>"
      );
    }).join("");

    var myths = window.TESLA_MYTHS.map(function (m) {
      return (
        '<div class="card mf"><span class="myth">Myth: ' + esc(m.myth) + "</span>" +
        '<span class="fact">Fact:</span><p>' + esc(m.fact) + "</p></div>"
      );
    }).join("");

    var res = window.TESLA_RESOURCES.map(function (r) {
      return (
        '<div class="card"><h3><a href="' + r.link + '" target="_blank" rel="noopener">' + esc(r.name) + "</a></h3>" +
        '<p class="dim">' + esc(r.desc) + "</p></div>"
      );
    }).join("");

    return (
      '<h2 class="section-title">Tesla in His Own Words</h2>' +
      '<p class="section-sub">His most important writings — every one free to read online.</p>' +
      '<div class="grid cols-2">' + writings + "</div>" +
      '<h2 class="section-title">Quotes — Verified and Otherwise</h2>' +
      '<p class="section-sub">The internet loves putting words in Tesla’s mouth. Here’s which famous lines are documented and which are folklore.</p>' +
      '<div class="grid cols-2">' + quotes + "</div>" +
      '<h2 class="section-title">Myths vs Facts</h2>' +
      '<div class="grid cols-2">' + myths + "</div>" +
      '<h2 class="section-title">Archives &amp; Museums</h2>' +
      '<p class="section-sub">Where to go deeper — primary sources, museums, and the full patent archive.</p>' +
      '<div class="grid cols-2">' + res + "</div>"
    );
  }

  /* ── Quiz ─────────────────────────────────────────────── */
  var quizScore = { answered: 0, correct: 0 };

  function renderQuiz() {
    quizScore = { answered: 0, correct: 0 };
    var qs = window.TESLA_QUIZ.map(function (q, qi) {
      return (
        '<div class="card quiz-q" data-q="' + qi + '"><h3>' + (qi + 1) + ". " + esc(q.q) + "</h3>" +
        '<div class="opts">' +
        q.opts.map(function (o, oi) {
          return '<button data-q="' + qi + '" data-o="' + oi + '">' + esc(o) + "</button>";
        }).join("") +
        "</div>" +
        '<div class="explain note blue">' + esc(q.explain) + "</div></div>"
      );
    }).join("");
    return (
      '<h2 class="section-title">The Tesla Quiz</h2>' +
      '<p class="section-sub">Twelve questions. Wrong answers reveal the explanation too — missing is learning.</p>' +
      '<p class="quiz-score" id="quiz-score">Score: 0 / 0</p>' +
      qs +
      '<button class="btn" id="quiz-reset">Reset quiz</button>'
    );
  }

  function handleQuizClick(btn) {
    var qi = +btn.dataset.q, oi = +btn.dataset.o;
    var qEl = app.querySelector('.quiz-q[data-q="' + qi + '"]');
    if (!qEl || qEl.classList.contains("answered")) return;
    qEl.classList.add("answered");
    var correct = window.TESLA_QUIZ[qi].a;
    qEl.querySelectorAll("button").forEach(function (b) {
      b.disabled = true;
      var o = +b.dataset.o;
      if (o === correct) b.classList.add("correct");
      else if (o === oi) b.classList.add("wrong");
    });
    quizScore.answered++;
    if (oi === correct) quizScore.correct++;
    var s = document.getElementById("quiz-score");
    if (s) {
      s.textContent = "Score: " + quizScore.correct + " / " + quizScore.answered;
      if (quizScore.answered === window.TESLA_QUIZ.length) {
        var pct = Math.round((100 * quizScore.correct) / quizScore.answered);
        s.textContent += pct === 100 ? "  — ⚡ Perfect! Tesla salutes you."
          : pct >= 75 ? "  — Excellent. Wardenclyffe would be proud."
          : pct >= 50 ? "  — Solid. Another pass through the hub and you'll have it."
          : "  — The future is yours to study. Try the Life & Inventions tabs!";
      }
    }
  }

  /* ── Router ───────────────────────────────────────────── */
  var RENDERERS = {
    home: renderHome, life: renderLife, inventions: renderInventions,
    patents: renderPatents, mind: renderMind, library: renderLibrary, quiz: renderQuiz
  };

  function currentSection() {
    var h = location.hash.replace("#", "");
    return RENDERERS[h] ? h : "home";
  }

  function render() {
    var sec = currentSection();
    nav.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.nav === sec);
    });
    app.innerHTML = RENDERERS[sec]();
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  function go(sec) {
    if (location.hash === "#" + sec) render();
    else location.hash = sec;
  }

  nav.innerHTML = SECTIONS.map(function (s) {
    return '<button data-nav="' + s.id + '">' + s.label + "</button>";
  }).join("");

  document.body.addEventListener("click", function (e) {
    var navBtn = e.target.closest("[data-nav]");
    if (navBtn) { go(navBtn.dataset.nav); return; }
    var quizBtn = e.target.closest(".quiz-q .opts button");
    if (quizBtn) { handleQuizClick(quizBtn); return; }
    if (e.target.id === "quiz-reset") { render(); return; }
  });

  document.body.addEventListener("input", function (e) {
    if (e.target.id !== "patent-search") return;
    var q = e.target.value.trim().toLowerCase();
    app.querySelectorAll("#patent-table tbody tr").forEach(function (tr) {
      tr.style.display = !q || tr.dataset.search.indexOf(q) !== -1 ? "" : "none";
    });
  });

  window.addEventListener("hashchange", render);
  render();
})();
