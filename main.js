/* ============================================================
   MindScape — main.js
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Year ---------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Navbar ---------------- */
  const navbar = $("#navbar");
  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");

  const onScrollNav = () => {
    if (window.scrollY > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  const closeMenu = () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  };
  hamburger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
  });
  $$(".nav-links a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------------- Scroll progress ---------------- */
  const progress = $("#scrollProgress");
  const onScrollProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScrollProgress, { passive: true });
  onScrollProgress();

  /* ---------------- Active nav link (scroll spy) ---------------- */
  const sections = $$("main section[id]");
  const linkMap = {};
  $$(".nav-links a").forEach((a) => (linkMap[a.getAttribute("href").slice(1)] = a));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          $$(".nav-links a").forEach((a) => a.classList.remove("active"));
          const link = linkMap[e.target.id];
          if (link) link.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------------- Cursor glow ---------------- */
  const glow = $("#cursorGlow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy;
    window.addEventListener("mousemove", (e) => { gx = e.clientX; gy = e.clientY; });
    const loop = () => {
      cx += (gx - cx) * 0.15; cy += (gy - cy) * 0.15;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
  } else if (glow) { glow.style.display = "none"; }

  /* ---------------- Ripple buttons ---------------- */
  $$("[data-ripple]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const r = document.createElement("span");
      r.className = "ripple";
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size + "px";
      r.style.left = e.clientX - rect.left - size / 2 + "px";
      r.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  });

  /* ---------------- Magnetic buttons ---------------- */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ============================================================
     RENDER: Topics
     ============================================================ */
  const topicGrid = $("#topicGrid");
  TOPICS.forEach((t) => {
    const card = document.createElement("article");
    card.className = "topic-card reveal";
    card.innerHTML = `
      <div class="topic-icon">${t.icon}</div>
      <h3>${t.name}</h3>
      <p>${t.desc}</p>
      <span class="topic-link">Explore <span>&rarr;</span></span>`;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
    card.addEventListener("click", () => openTopicModal(t));
    topicGrid.appendChild(card);
  });

  function openTopicModal(t) {
    openModal(`
      <span class="modal-emoji">${t.icon}</span>
      <span class="modal-tag">Field of Psychology</span>
      <h3>${t.name}</h3>
      <div class="modal-section"><h4>Overview</h4><p>${t.desc}</p></div>
      <div class="modal-section"><h4>What you'll explore</h4>
        <div class="modal-chips">
          <span class="modal-chip">Key theories</span>
          <span class="modal-chip">Landmark studies</span>
          <span class="modal-chip">Real-world applications</span>
          <span class="modal-chip">Leading researchers</span>
        </div>
      </div>
      <div class="modal-example">This field connects directly to the concepts and pioneers featured across MindScape — explore the concept cards below to go deeper.</div>
    `);
  }

  /* ============================================================
     RENDER: Concepts + Modal
     ============================================================ */
  const conceptGrid = $("#conceptGrid");
  CONCEPTS.forEach((c) => {
    const card = document.createElement("button");
    card.className = "concept-card reveal";
    card.type = "button";
    card.innerHTML = `<span class="concept-emoji">${c.emoji}</span><h4>${c.name}</h4><small>${c.tag}</small>`;
    card.addEventListener("click", () => openConceptModal(c));
    conceptGrid.appendChild(card);
  });

  function openConceptModal(c) {
    openModal(`
      <span class="modal-emoji">${c.emoji}</span>
      <span class="modal-tag">${c.tag}</span>
      <h3>${c.name}</h3>
      <div class="modal-section"><h4>Definition</h4><p>${c.def}</p></div>
      <div class="modal-section"><h4>Key theories</h4>
        <div class="modal-chips">${c.theories.map((t) => `<span class="modal-chip">${t}</span>`).join("")}</div>
      </div>
      <div class="modal-section"><h4>Real-world example</h4>
        <div class="modal-example">${c.example}</div>
      </div>
      <div class="modal-section"><h4>Related psychologists</h4>
        <div class="modal-chips">${c.people.map((p) => `<span class="modal-chip">${p}</span>`).join("")}</div>
      </div>
      <div class="modal-section"><h4>Related topics</h4>
        <div class="modal-chips">${c.related.map((r) => `<span class="modal-chip">${r}</span>`).join("")}</div>
      </div>
    `);
  }

  /* ---------------- Modal core ---------------- */
  const overlay = $("#modalOverlay");
  const modalBody = $("#modalBody");
  const modalClose = $("#modalClose");
  let lastFocus = null;

  function openModal(html) {
    lastFocus = document.activeElement;
    modalBody.innerHTML = html;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }
  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay.classList.contains("open")) closeModal(); });

  const contactLink = $("#contactLink");
  if (contactLink) contactLink.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(`
      <span class="modal-emoji">✉️</span>
      <span class="modal-tag">Get in touch</span>
      <h3>Contact MindScape</h3>
      <div class="modal-section"><p>Have a question about psychology, a resource suggestion, or feedback on the platform? We'd love to hear from you.</p></div>
      <div class="modal-section"><h4>Reach us</h4>
        <div class="modal-chips">
          <span class="modal-chip">hello@mindscape.study</span>
          <span class="modal-chip">@mindscape</span>
        </div>
      </div>
      <div class="modal-example">The mind is where everything begins — thanks for exploring it with us.</div>
    `);
  });

  /* ============================================================
     RENDER: Psychologists
     ============================================================ */
  const psScroller = $("#psScroller");
  PSYCHOLOGISTS.forEach((p) => {
    const card = document.createElement("article");
    card.className = "ps-card";
    card.innerHTML = `
      <div class="ps-portrait" style="background:${p.grad}">${p.initials}</div>
      <span class="ps-years">${p.years}</span>
      <h3>${p.name}</h3>
      <span class="ps-field">${p.field}</span>
      <p>${p.contribution}</p>`;
    psScroller.appendChild(card);
  });
  const scrollBy = () => Math.min(psScroller.clientWidth * 0.8, 640);
  $("#psPrev").addEventListener("click", () => psScroller.scrollBy({ left: -scrollBy(), behavior: "smooth" }));
  $("#psNext").addEventListener("click", () => psScroller.scrollBy({ left: scrollBy(), behavior: "smooth" }));

  /* ============================================================
     RENDER: Timeline
     ============================================================ */
  const timelineEl = $("#timelineList");
  TIMELINE.forEach((t) => {
    const item = document.createElement("div");
    item.className = "tl-item reveal";
    item.innerHTML = `
      <span class="tl-dot"></span>
      <div class="tl-box">
        <span class="tl-year">${t.year}</span>
        <h3>${t.title}</h3>
        <p>${t.text}</p>
      </div>`;
    timelineEl.appendChild(item);
  });

  /* ============================================================
     RENDER: Stats
     ============================================================ */
  const statsGrid = $("#statsGrid");
  STATS.forEach((s) => {
    const card = document.createElement("div");
    card.className = "stat-card reveal";
    const numHtml = s.value === null
      ? `<div class="stat-num">${s.symbol}</div>`
      : `<div class="stat-num" data-count="${s.value}" data-suffix="${s.suffix || ""}">0</div>`;
    card.innerHTML = `${numHtml}<div class="stat-label">${s.label}</div>`;
    statsGrid.appendChild(card);
  });

  /* ---------------- Count-up ---------------- */
  function countUp(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const dur = 1600; const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => countObs.observe(el));

  /* ============================================================
     RENDER: Research
     ============================================================ */
  const researchGrid = $("#researchGrid");
  const diagrams = {
    flask: `<svg viewBox="0 0 80 60" width="80" height="60"><path d="M32 6h16v14l14 26a6 6 0 0 1-5 9H23a6 6 0 0 1-5-9l14-26z" fill="none" stroke="#38bdf8" stroke-width="2"/><circle cx="34" cy="42" r="3" fill="#818cf8"/><circle cx="46" cy="48" r="3" fill="#22d3ee"/></svg>`,
    person: `<svg viewBox="0 0 80 60" width="80" height="60"><circle cx="40" cy="20" r="10" fill="none" stroke="#38bdf8" stroke-width="2"/><path d="M22 52c0-11 8-18 18-18s18 7 18 18" fill="none" stroke="#818cf8" stroke-width="2"/></svg>`,
    chart: `<svg viewBox="0 0 80 60" width="80" height="60"><rect x="14" y="30" width="10" height="22" fill="#38bdf8"/><rect x="30" y="18" width="10" height="34" fill="#4f9dff"/><rect x="46" y="24" width="10" height="28" fill="#6366f1"/><rect x="62" y="12" width="8" height="40" fill="#22d3ee"/></svg>`,
    eye: `<svg viewBox="0 0 80 60" width="80" height="60"><path d="M10 30c10-14 50-14 60 0-10 14-50 14-60 0z" fill="none" stroke="#38bdf8" stroke-width="2"/><circle cx="40" cy="30" r="8" fill="#818cf8"/></svg>`,
    scatter: `<svg viewBox="0 0 80 60" width="80" height="60"><line x1="14" y1="50" x2="70" y2="50" stroke="#334" stroke-width="1"/><line x1="14" y1="10" x2="14" y2="50" stroke="#334" stroke-width="1"/>${[[22,44],[30,38],[36,40],[44,28],[52,26],[60,18],[66,20]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#22d3ee"/>`).join("")}</svg>`,
    loop: `<svg viewBox="0 0 80 60" width="80" height="60"><circle cx="40" cy="30" r="18" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 5"/><path d="M40 12l6 6-6 6" fill="none" stroke="#818cf8" stroke-width="2"/></svg>`,
  };
  RESEARCH.forEach((r) => {
    const card = document.createElement("article");
    card.className = "research-card reveal";
    card.innerHTML = `
      <div class="research-diagram">${diagrams[r.diagram] || ""}</div>
      <h3>${r.name}</h3>
      <p>${r.desc}</p>`;
    researchGrid.appendChild(card);
  });

  /* ============================================================
     RENDER: Resources + filter/search
     ============================================================ */
  const filterPills = $("#filterPills");
  const resourceGrid = $("#resourceGrid");
  const searchInput = $("#resourceSearch");
  const emptyMsg = $("#resourceEmpty");
  let activeFilter = "All";

  RESOURCE_FILTERS.forEach((f, i) => {
    const b = document.createElement("button");
    b.className = "pill" + (i === 0 ? " active" : "");
    b.textContent = f;
    b.addEventListener("click", () => {
      activeFilter = f;
      $$(".pill", filterPills).forEach((p) => p.classList.remove("active"));
      b.classList.add("active");
      renderResources();
    });
    filterPills.appendChild(b);
  });

  function renderResources() {
    const q = (searchInput.value || "").trim().toLowerCase();
    const list = RESOURCES.filter((r) => {
      const matchCat = activeFilter === "All" || r.cat === activeFilter;
      const matchQ = !q || (r.title + r.desc + r.cat).toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    resourceGrid.innerHTML = "";
    emptyMsg.hidden = list.length !== 0;
    list.forEach((r) => {
      const card = document.createElement("article");
      card.className = "resource-card";
      card.innerHTML = `
        <span class="resource-cat">${r.cat}</span>
        <h3>${r.title}</h3>
        <p>${r.desc}</p>
        <span class="topic-link">Read <span>&rarr;</span></span>`;
      card.querySelector(".topic-link").addEventListener("click", () => openResourceModal(r));
      resourceGrid.appendChild(card);
    });
  }
  function openResourceModal(r) {
    openModal(`
      <span class="modal-tag">${r.cat}</span>
      <h3>${r.title}</h3>
      <div class="modal-section"><p>${r.desc}</p></div>
      <div class="modal-example">This is sample library content curated for MindScape. In a full build, this would open the complete ${r.cat.toLowerCase()} resource.</div>
    `);
  }
  searchInput.addEventListener("input", renderResources);
  renderResources();

  /* ============================================================
     INTERACTIVE BRAIN (SVG)
     ============================================================ */
  const brainSvg = $("#brainSvg");
  const brainExplorer = $(".brain-explorer");
  const panelInner = $("#brainPanelInner");
  // Region shapes roughly arranged as a side-profile brain
  const shapes = {
    frontal: "M60,150 Q55,90 120,70 Q160,60 190,80 L175,150 Q120,140 60,150 Z",
    parietal: "M190,80 Q250,70 290,95 L270,150 Q220,140 175,150 L190,80 Z",
    temporal: "M60,150 Q120,140 175,150 Q170,200 130,215 Q85,215 65,185 Z",
    occipital: "M270,150 Q320,140 340,175 Q330,215 285,215 Q245,205 240,170 Z",
    limbic: "M175,150 Q220,140 240,170 Q225,200 195,205 Q160,200 130,215 Q170,180 175,150 Z",
    cerebellum: "M285,215 Q330,215 345,250 Q330,285 290,285 Q255,275 255,240 Q265,220 285,215 Z",
    brainstem: "M235,240 Q255,240 255,275 Q250,315 235,330 Q220,315 220,275 Q222,248 235,240 Z",
  };
  BRAIN_REGIONS.forEach((r) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", shapes[r.id]);
    path.setAttribute("fill", r.color);
    path.setAttribute("fill-opacity", "0.55");
    path.setAttribute("class", "brain-region");
    path.dataset.id = r.id;
    const activate = () => {
      brainExplorer.classList.add("dim");
      $$(".brain-region", brainSvg).forEach((p) => p.classList.remove("active"));
      path.classList.add("active");
      panelInner.style.opacity = "0";
      setTimeout(() => {
        panelInner.innerHTML = `
          <span class="brain-panel-kicker">Region</span>
          <h3>${r.name}</h3>
          <p>${r.fn}</p>`;
        panelInner.style.opacity = "1";
      }, 150);
    };
    path.addEventListener("mouseenter", activate);
    path.addEventListener("click", activate);
    path.addEventListener("focus", activate);
    path.setAttribute("tabindex", "0");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = r.name;
    path.appendChild(title);
    brainSvg.appendChild(path);
  });
  brainSvg.addEventListener("mouseleave", () => {
    brainExplorer.classList.remove("dim");
    $$(".brain-region", brainSvg).forEach((p) => p.classList.remove("active"));
  });

  /* ============================================================
     QUIZ
     ============================================================ */
  const quizCard = $("#quizCard");
  let qIndex = 0, score = 0, answered = false;

  function renderQuestion() {
    answered = false;
    const item = QUIZ[qIndex];
    const pct = (qIndex / QUIZ.length) * 100;
    quizCard.innerHTML = `
      <div class="quiz-progress-wrap">
        <div class="quiz-bar"><span style="width:${pct}%"></span></div>
        <span class="quiz-count">Q ${qIndex + 1} / ${QUIZ.length}</span>
      </div>
      <div class="quiz-q">${item.q}</div>
      <div class="quiz-options">
        ${item.options.map((o, i) => `<button class="quiz-opt" data-i="${i}">${o}</button>`).join("")}
      </div>
      <div class="quiz-feedback" id="quizFeedback"></div>`;
    animateIn(quizCard.querySelector(".quiz-q"), quizCard.querySelectorAll(".quiz-opt"));
    $$(".quiz-opt", quizCard).forEach((btn) =>
      btn.addEventListener("click", () => selectAnswer(+btn.dataset.i))
    );
  }

  function selectAnswer(i) {
    if (answered) return;
    answered = true;
    const item = QUIZ[qIndex];
    const opts = $$(".quiz-opt", quizCard);
    opts.forEach((b) => (b.disabled = true));
    const fb = $("#quizFeedback");
    if (i === item.answer) {
      score++;
      opts[i].classList.add("correct");
      fb.textContent = "Correct! " + item.fact;
      fb.className = "quiz-feedback ok";
    } else {
      opts[i].classList.add("wrong");
      opts[item.answer].classList.add("correct");
      fb.textContent = "Not quite. " + item.fact;
      fb.className = "quiz-feedback no";
    }
    const next = document.createElement("button");
    next.className = "btn btn-primary quiz-next magnetic";
    next.textContent = qIndex < QUIZ.length - 1 ? "Next question →" : "See my result →";
    next.addEventListener("click", () => {
      qIndex++;
      if (qIndex < QUIZ.length) renderQuestion();
      else renderResult();
    });
    quizCard.appendChild(next);
  }

  function renderResult() {
    const pct = Math.round((score / QUIZ.length) * 100);
    let verdict = "Keep exploring the mind!";
    if (pct === 100) verdict = "Flawless — a true student of the mind!";
    else if (pct >= 70) verdict = "Impressive grasp of psychology!";
    else if (pct >= 40) verdict = "A solid foundation to build on.";
    quizCard.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-score">${score}/${QUIZ.length}</div>
        <h3>${verdict}</h3>
        <p>You scored ${pct}%. ${score === QUIZ.length ? "Every answer correct." : "Review the concepts and try again to improve."}</p>
        <button class="btn btn-ghost magnetic" id="quizRestart" data-ripple>Restart quiz</button>
      </div>`;
    animateIn(quizCard.querySelector(".quiz-score"), quizCard.querySelectorAll("h3,p,#quizRestart"));
    $("#quizRestart").addEventListener("click", () => {
      qIndex = 0; score = 0; renderQuestion();
    });
  }

  function animateIn(main, items) {
    if (!hasGSAP || reduceMotion) return;
    gsap.fromTo(main, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    gsap.fromTo(items, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, delay: 0.1, ease: "power2.out" });
  }
  renderQuestion();

  /* ============================================================
     SCROLL REVEAL (Intersection Observer fallback + GSAP)
     ============================================================ */
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------------- GSAP scroll enhancements ---------------- */
  if (hasGSAP && window.ScrollTrigger && !reduceMotion) {
    // Staggered card entrances
    [".topic-grid", ".concept-grid", ".research-grid", ".stats-grid"].forEach((sel) => {
      const grid = $(sel);
      if (!grid) return;
      gsap.from(grid.children, {
        scrollTrigger: { trigger: grid, start: "top 82%" },
        y: 50, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out",
        clearProps: "all",
      });
    });
    // Parallax on hero visual
    const hv = $(".hero-visual");
    if (hv) gsap.to(hv, { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    // Timeline line grow feel via dots
    gsap.utils.toArray(".tl-item").forEach((item) => {
      gsap.from(item.querySelector(".tl-dot"), {
        scrollTrigger: { trigger: item, start: "top 85%" },
        scale: 0, duration: 0.5, ease: "back.out(2)",
      });
    });
  }

  /* ============================================================
     NEURAL PARTICLE CANVAS (background + footer)
     ============================================================ */
  function neuralField(canvas, opts) {
    const ctx = canvas.getContext("2d");
    let w, h, nodes = [], raf;
    const count = opts.count;
    const linkDist = opts.linkDist;
    const speed = opts.speed;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = rect.width * devicePixelRatio;
      h = canvas.height = rect.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      w = rect.width; h = rect.height;
    }
    function init() {
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed,
          r: Math.random() * 1.8 + 0.6,
        });
      }
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const a = (1 - d / linkDist) * opts.lineAlpha;
            ctx.strokeStyle = `rgba(${opts.rgb}, ${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${opts.rgb}, ${opts.dotAlpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    resize(); init(); frame();
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { cancelAnimationFrame(raf); resize(); init(); frame(); }, 200);
    });
  }

  if (!reduceMotion) {
    const bg = $("#neuralCanvas");
    if (bg) {
      const isSmall = window.innerWidth < 700;
      neuralField(bg, { count: isSmall ? 34 : 70, linkDist: 140, speed: 0.35, rgb: "90,160,255", lineAlpha: 0.35, dotAlpha: 0.7 });
    }
    const fc = $("#footerCanvas");
    if (fc) neuralField(fc, { count: 40, linkDist: 120, speed: 0.3, rgb: "120,190,255", lineAlpha: 0.4, dotAlpha: 0.7 });
  }

  /* ============================================================
     HERO BRAIN — animated neural sphere
     ============================================================ */
  const heroCanvas = $("#heroBrain");
  if (heroCanvas && !reduceMotion) {
    const ctx = heroCanvas.getContext("2d");
    const S = 520;
    heroCanvas.width = S * devicePixelRatio;
    heroCanvas.height = S * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const cx = S / 2, cy = S / 2, R = 170;
    const pts = [];
    const N = 130;
    for (let i = 0; i < N; i++) {
      // fibonacci sphere
      const phi = Math.acos(1 - 2 * (i + 0.5) / N);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      pts.push({
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.cos(phi),
        z: Math.sin(theta) * Math.sin(phi),
      });
    }
    let angle = 0;
    function draw() {
      ctx.clearRect(0, 0, S, S);
      angle += 0.0035;
      const cosA = Math.cos(angle), sinA = Math.sin(angle);
      const proj = pts.map((p) => {
        const x = p.x * cosA - p.z * sinA;
        const z = p.x * sinA + p.z * cosA;
        const scale = 0.75 + (z + 1) * 0.28;
        return { sx: cx + x * R * scale * 0.9, sy: cy + p.y * R * scale * 0.9, z, scale };
      });
      // connections
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          const dx = proj[i].sx - proj[j].sx, dy = proj[i].sy - proj[j].sy;
          const d = Math.hypot(dx, dy);
          if (d < 62) {
            const a = (1 - d / 62) * 0.35 * ((proj[i].z + 1) / 2);
            ctx.strokeStyle = `rgba(90,180,255,${a})`;
            ctx.beginPath();
            ctx.moveTo(proj[i].sx, proj[i].sy);
            ctx.lineTo(proj[j].sx, proj[j].sy);
            ctx.stroke();
          }
        }
      }
      // nodes
      proj.forEach((p) => {
        const alpha = 0.4 + ((p.z + 1) / 2) * 0.6;
        const rad = 1.4 * p.scale;
        const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, rad * 3);
        g.addColorStop(0, `rgba(150,210,255,${alpha})`);
        g.addColorStop(1, "rgba(80,140,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, rad * 3, 0, Math.PI * 2);
        ctx.fill();
      });
      // core glow
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      core.addColorStop(0, "rgba(80,160,255,0.18)");
      core.addColorStop(1, "rgba(80,160,255,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      requestAnimationFrame(draw);
    }
    draw();
  }
})();
