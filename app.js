// UI rendering + events. Vanilla JS, no build step.
(function () {
  const { fmtKey, parseKey, addDays, monday, weekKeys, monthKeys, today, fmtNice, fmtShort, isWorkingDay } = D;
  const C = Charts;

  const UI = {
    tab: "today",
    dateKey: fmtKey(today()),
    foodQuery: "",
    addingMeal: null, // meal currently showing its Add Food input
    weekOffset: 0,   // reports: weeks back from current
    monthOffset: 0,  // reports + dashboard: months back
    reportMode: "weekly",
  };

  const GYM_CLASSES = ["Legs", "Arms and Chest", "Chest and Back", "Full Body", "Burn", "Yoga", "Dance Fitness"];

  // Arun Sharma QA for CAT (10th ed): question counts + plan target dates.
  // done = already finished · "2026-06-30" = June batch · "2026-07-31" = July batch
  const JUN = "2026-08-31", JUL = "2026-08-31"; // QA paced evenly to 31 Aug (no June/July crunch)
  const QA_AIM = 25, QA_CAP = 30; // QA daily target: aim 25/day, never demand more than 30 (backlog stretches the date)
  const ARUN_QA = [
    { name: "Number Systems", total: 135, target: JUL },
    { name: "Progressions and Series", total: 61, target: JUL },
    { name: "Averages", total: 56, target: null },
    { name: "Percentages", total: 72, target: null },
    { name: "Ratio, Proportion and Variation", total: 75, target: null },
    { name: "Alligations and Mixtures", total: 30, target: null },
    { name: "Profit, Loss and Discount", total: 85, target: JUN },
    { name: "Simple and Compound Interest", total: 45, target: JUN },
    { name: "Time and Work", total: 65, target: JUN },
    { name: "Time, Speed and Distance", total: 65, target: JUN },
    { name: "Applications of Time, Speed and Distance", total: 26, target: JUN },
    { name: "Geometry and Mensuration", total: 71, target: JUL },
    { name: "Coordinate Geometry", total: 100, target: JUL },
    { name: "Functions", total: 90, target: JUL },
    { name: "Inequalities", total: 109, target: JUL },
    { name: "Quadratic and Other Equations", total: 65, target: JUL },
    { name: "Logarithms", total: 34, target: JUL },
    { name: "Permutations and Combinations", total: 87, target: JUL },
    { name: "Probability", total: 50, target: JUL },
    { name: "Set Theory", total: 20, target: JUL },
  ];
  const ARUN_DONE = ["Averages", "Percentages", "Ratio, Proportion and Variation", "Alligations and Mixtures"];
  // The order chapters are tackled in: June batch (user's order) first, then July (book order).
  const QA_ORDER = [
    // June batch
    "Profit, Loss and Discount", "Simple and Compound Interest", "Time and Work",
    "Time, Speed and Distance", "Applications of Time, Speed and Distance",
    // July batch — exact order you gave (Number Systems & Progressions last)
    "Geometry and Mensuration", "Coordinate Geometry", "Functions", "Inequalities",
    "Quadratic and Other Equations", "Logarithms", "Permutations and Combinations",
    "Probability", "Set Theory", "Number Systems", "Progressions and Series",
  ];

  // ---- Full study plan: all four subjects, everything by 31 Aug ----
  const AUG = "2026-08-31", VOCAB_END = "2026-08-03";
  const SUB_META = {
    qa:    { name: "QA",    color: "var(--indigo)", soft: "var(--indigo-soft)", unit: "Qs" },
    dilr:  { name: "DILR",  color: "var(--orange)", soft: "var(--orange-soft)", unit: "Qs" },
    lr:    { name: "LR",    color: "var(--orange)", soft: "var(--orange-soft)", unit: "Qs" },
    di:    { name: "DI",    color: "#c98a2b",       soft: "#fbf0db",            unit: "Qs" },
    varc:  { name: "VARC",  color: "var(--pink)",   soft: "var(--pink-soft)",   unit: "exercise" },
    vocab: { name: "Vocab", color: "var(--teal)",   soft: "var(--teal-soft)",   unit: "session" },
  };
  // DILR — real LR question bank counts. DI topics added when counts are shared.
  const DILR_ITEMS = [
    { name: "LR: Arrangements", total: 63 },
    { name: "LR: Rankings", total: 39 },
    { name: "LR: Team Formations", total: 26 },
    { name: "LR: Quantitative Reasoning", total: 65 },
    { name: "LR: Generic Puzzles", total: 62 },
    { name: "LR: Routes & Network Diagrams", total: 43 },
    { name: "LR: Set Theory & Venn Diagrams", total: 54 },
    { name: "LR: Cubes & Dice", total: 29 },
    { name: "LR: Games & Tournaments", total: 33 },
    { name: "VR: Syllogisms", total: 100 },
    { name: "VR: Logical Deduction", total: 30 },
    { name: "VR: Binary Logic", total: 16 },
    { name: "DI: Tables", total: 22 },
    { name: "DI: Bar Graphs", total: 23 },
    { name: "DI: Line Graphs", total: 20 },
    { name: "DI: Pie Charts", total: 21 },
    { name: "DI: Data Caselets", total: 31 },
    { name: "DI: Misc Charts", total: 28 },
  ];
  // VARC topics from the books (Verbal Ability book + Reading Comprehension book), in study order.
  const VARC_ITEMS = [
    { name: "VA: Word List I (High Frequency)", total: 10 },
    { name: "VA: Word List II (Medium Frequency)", total: 10 },
    { name: "VA: Word List III (Low Frequency)", total: 10 },
    { name: "VA: Roots, Prefixes & Suffixes", total: 12 },
    { name: "VA: Words Often Confused", total: 8 },
    { name: "VA: Synonyms", total: 8 },
    { name: "VA: Antonyms", total: 8 },
    { name: "VA: Odd Man Out", total: 6 },
    { name: "VA: Analogies", total: 10 },
    { name: "VA: Sentence Completion / Fill in Blanks", total: 15 },
    { name: "VA: Paragraph Jumbles", total: 25 },
    { name: "VA: Sentence Correction", total: 20 },
    { name: "VA: Fact, Inference & Judgement", total: 12 },
    { name: "VA: Phrasal Verbs", total: 8 },
    { name: "VA: Paragraph Completion / Last Sentence", total: 18 },
    { name: "VA: Irrelevant Statement", total: 12 },
    { name: "VA: Summary of the Passage", total: 12 },
    { name: "RC: Reading Skills (7 Dimensions)", total: 7 },
    { name: "RC: Critical Reasoning", total: 15 },
    { name: "RC: Practice Passages", total: 40 },
  ];
  const VOCAB_ITEMS = [{ name: "Word Power Made Easy", total: 47 }];
  const SUBJECTS = ["qa", "dilr", "varc", "vocab"];
  const PLAN_SUBJECTS = ["qa", "dilr", "varc", "vocab"]; // all sequential, item-based topic plans
  const PLAN_START = window.PLAN_START || "2026-06-15"; // calendar starts here; no future logging
  if (UI.dateKey < PLAN_START) UI.dateKey = PLAN_START; // never open on a pre-start date
  // CAT mock cadence by month
  const MOCK_PLAN = "Jul: 1 / 2 weeks · Aug: 1 / week · Sep: 2 / week · Oct-Nov: 2-3 / week";
  const MEALS = [
    { id: "breakfast", name: "Breakfast" },
    { id: "lunch", name: "Lunch" },
    { id: "snacks", name: "Evening Snacks" },
    { id: "dinner", name: "Dinner" },
  ];
  const defaultMeal = () => { const h = new Date().getHours(); return h < 11 ? "breakfast" : h < 16 ? "lunch" : h < 19 ? "snacks" : "dinner"; };

  const CATS = [
    { id: "study", name: "Study", color: "var(--indigo)", soft: "var(--indigo-soft)" },
    { id: "diet", name: "Diet", color: "var(--green)", soft: "var(--green-soft)" },
    { id: "gym", name: "Gym", color: "var(--orange)", soft: "var(--orange-soft)" },
    { id: "wake", name: "Wake Up", color: "var(--teal)", soft: "var(--teal-soft)" },
    { id: "office", name: "Office", color: "var(--purple)", soft: "var(--purple-soft)" },
    { id: "vitamins", name: "Vitamins", color: "var(--pink)", soft: "var(--pink-soft)" },
  ];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function downloadExport() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `six-month-sprint-${fmtKey(today())}.json`;
    a.click();
    if (window.Backup) Backup.write(true);
  }
  // top 6 most-logged foods across all days, for one-tap re-adding
  function recentChips() {
    const freq = {};
    for (const k in S.days) for (const f of (S.days[k].foods || [])) {
      (freq[f.name] = freq[f.name] || { n: 0, f }).n++;
    }
    const top = Object.values(freq).sort((a, b) => b.n - a.n).slice(0, 6);
    UI._recent = top.map((t) => t.f);
    if (!top.length) return "";
    return `<div class="recent-chips">${top.map((t, j) =>
      `<button class="chip-add" data-act="food:recent:${j}">${FoodDB.emojiFor(t.f.name)} ${esc(t.f.name)}</button>`).join("")}</div>`;
  }
  // Canonical full plan (all four subjects, in order) built from the book lists.
  function buildPlan() {
    const plan = [];
    ARUN_QA.forEach((it, i) => { const o = QA_ORDER.indexOf(it.name); plan.push({ ...it, subject: "qa", unit: SUB_META.qa.unit, ord: o === -1 ? 100 + i : o, done: ARUN_DONE.includes(it.name) }); });
    DILR_ITEMS.forEach((it, i) => plan.push({ ...it, subject: "dilr", unit: SUB_META.dilr.unit, ord: i, target: AUG, done: false }));
    VARC_ITEMS.forEach((it, i) => plan.push({ ...it, subject: "varc", unit: SUB_META.varc.unit, ord: i, target: AUG, done: false }));
    VOCAB_ITEMS.forEach((it, i) => plan.push({ ...it, subject: "vocab", unit: SUB_META.vocab.unit, ord: i, target: VOCAB_END, done: false }));
    return plan;
  }
  // Merge the canonical plan into S.chapters. replace=true rebuilds DILR/VARC (for renames); progress preserved.
  function applyPlan(replace) {
    const plan = buildPlan();
    if (replace) S.chapters = S.chapters.filter((c) => ["qa", "vocab"].includes(c.subject || "qa"));
    const byName = {}; S.chapters.forEach((c) => { byName[c.name.toLowerCase()] = c; });
    let added = 0, updated = 0;
    for (const it of plan) {
      const ex = byName[it.name.toLowerCase()];
      if (ex) {
        ex.total = it.total; ex.target = it.target; ex.subject = it.subject; ex.unit = it.unit; ex.ord = it.ord;
        if (it.done) ex.startDone = it.total; else if (ex.startDone > it.total) ex.startDone = it.total;
        updated++;
      } else {
        S.chapters.push({ id: "ch" + Math.random().toString(36).slice(2, 8), name: it.name, total: it.total, startDone: it.done ? it.total : 0, target: it.target, subject: it.subject, unit: it.unit, ord: it.ord });
        added++;
      }
    }
    return { added, updated };
  }
  // On load: if any plan item is missing (old data, never seeded), fill it in non-destructively.
  function ensurePlan() {
    const have = new Set(S.chapters.map((c) => c.name.toLowerCase()));
    if (buildPlan().some((it) => !have.has(it.name.toLowerCase()))) { applyPlan(false); saveState(); }
  }

  // Sequential plan for one subject on a given day: active item + today's target.
  function planFor(subject, dateKey) {
    const order = S.chapters
      .filter((c) => (c.subject || "qa") === subject)
      .map((ch) => ({ ch, st: Score.chapterStats(ch) }))
      .sort((a, b) => (a.ch.ord ?? 99) - (b.ch.ord ?? 99));
    if (!order.length) return null;
    const incomplete = order.filter((x) => x.st.remaining > 0);
    if (!incomplete.length) return { subject, order, done: true };
    const current = incomplete[0];
    const fallback = subject === "vocab" ? VOCAB_END : AUG;
    const batch = current.ch.target || fallback;
    const batchAll = incomplete.filter((x) => (x.ch.target || fallback) === batch);
    const rec = S.days[dateKey] || {};
    const doneToday = batchAll.reduce((a, x) => a + ((rec.qa || {})[x.ch.id] || 0), 0);
    const batchRemaining = batchAll.reduce((a, x) => a + x.st.remaining, 0);
    const day0 = parseKey(dateKey), deadline = parseKey(batch);
    const daysLeft = Math.max(1, Math.round((deadline - day0) / 86400000) + 1);
    // QA: aim QA_AIM/day, but never demand more than QA_CAP — backlog just stretches the timeline
    // (the finish date floats instead of the daily load spiking). VARC/Vocab stay light (1/day).
    let dailyTarget = 1;
    if (subject === "qa") {
      const paced = Math.ceil((batchRemaining + doneToday) / daysLeft);
      dailyTarget = Math.min(QA_CAP, Math.max(QA_AIM, paced));      // 25 aim, 30 hard cap
      dailyTarget = Math.max(1, Math.min(dailyTarget, batchRemaining + doneToday)); // never more than what's left
    }
    return { subject, order, current, batch, batchRemaining, daysLeft, dailyTarget, doneToday };
  }

  // Weighted daily topic picker: each day picks ONE topic, weighted so topics with MORE questions
  // remaining come up MORE often. Deterministic per day (stable for tap/undo). Amount paced to 31 Aug.
  const SET_Q = 4; // 1 set = 4 questions
  function rotatePlan(pool, dateKey, minChunk) {
    const items = pool.map((ch) => ({ ch, st: Score.chapterStats(ch) }));
    const todayLog = (x) => (S.days[dateKey]?.qa || {})[x.ch.id] || 0;
    const active = items.filter((x) => x.st.remaining > 0 || todayLog(x) > 0);
    if (!active.length) return null;
    const remStart = (x) => x.st.remaining + todayLog(x); // start-of-day remaining = stable weight & pick
    const totalW = active.reduce((a, x) => a + remStart(x), 0);
    const dayIdx = Math.max(0, Math.round((parseKey(dateKey) - parseKey(PLAN_START)) / 86400000));
    const seed = ((dayIdx * 9301 + 49297) % 233280) / 233280; // deterministic per-day 0..1
    let r = seed * totalW, current = active[0];
    for (const x of active) { r -= remStart(x); if (r < 0) { current = x; break; } }
    const daysLeft = Math.max(1, Math.round((parseKey(AUG) - parseKey(dateKey)) / 86400000) + 1);
    const rem = active.reduce((a, x) => a + x.st.remaining, 0);
    const chunk = Math.max(minChunk, Math.ceil(rem / daysLeft));
    const doneToday = todayLog(current);
    return { current, target: Math.min(chunk, doneToday + current.st.remaining), doneToday };
  }
  function dilrPlan(dateKey) {
    const all = S.chapters.filter((c) => c.subject === "dilr");
    if (!all.length) return null;
    const lr = rotatePlan(all.filter((c) => !/^DI:/.test(c.name)), dateKey, 2 * SET_Q); // ~2 sets
    const di = rotatePlan(all.filter((c) => /^DI:/.test(c.name)), dateKey, SET_Q);       // ~1 set
    if (!lr && !di) return { done: true };
    return { lr, di };
  }
  function varcPlan(dateKey) {
    const all = S.chapters.filter((c) => c.subject === "varc");
    if (!all.length) return null;
    const v = rotatePlan(all, dateKey, 2);
    return v ? v : { done: true };
  }
  const qaPlan = (dateKey) => planFor("qa", dateKey);
  // QA's daily target can span several chapters (a topic may have fewer left than the day's goal).
  // Split it into per-topic counts, stable for the day, capped at what's actually left so it's completable.
  function qaBreakdown(dateKey) {
    const plan = planFor("qa", dateKey);
    if (!plan || plan.done) return null;
    const rec = S.days[dateKey] || {};
    const logged = (ch) => (rec.qa || {})[ch.id] || 0;
    let need = plan.dailyTarget;
    const parts = [];
    for (const x of plan.order) {
      if (need <= 0) break;
      const cap = x.st.remaining + logged(x.ch);   // capacity today if it had started at 0
      if (cap <= 0) continue;
      const target = Math.min(need, cap);
      parts.push({ ch: x.ch, target, done: Math.min(logged(x.ch), target) });
      need -= target;
    }
    const goal = parts.reduce((a, p) => a + p.target, 0);
    const done = parts.reduce((a, p) => a + p.done, 0);
    return { parts, goal, done };
  }
  const selDate = () => parseKey(UI.dateKey);
  const day = () => getDay(UI.dateKey, false);
  const patchDay = (p) => { setDay(UI.dateKey, p); render(); };
  const pill = (p) => `<span class="pill ${p >= 75 ? "good" : p >= 45 ? "mid" : "low"}">${Math.round(p)}%</span>`;

  // Log an EXACT amount for a target's current item(s) today. Returns whether the target is now complete.
  const STUDY_TGT = new Set(["qa", "lr", "di", "varc", "vocab", "read"]);
  function manualLog(sub, n) {
    n = Math.max(0, parseInt(n, 10) || 0);
    const r = day();
    if (sub === "read") { setDay(UI.dateKey, { readMin: n }); render(); return n >= 20; }
    const qa = { ...(r.qa || {}) };
    let goal = 1, doneNow = 0;
    if (sub === "qa" || sub === "vocab") {
      const chs = S.chapters.filter((c) => (c.subject || "qa") === sub);
      const order = chs
        .map((ch) => ({ ch, room: Score.chapterStats(ch).remaining + ((r.qa || {})[ch.id] || 0) }))
        .sort((a, b) => (a.ch.ord ?? 99) - (b.ch.ord ?? 99));
      chs.forEach((c) => { delete qa[c.id]; });
      let need = n;
      for (const x of order) { if (need <= 0) break; const add = Math.min(need, x.room); if (add > 0) { qa[x.ch.id] = add; need -= add; } }
      doneNow = n - need;
      goal = sub === "qa" ? (qaBreakdown(UI.dateKey)?.goal || 1) : 1;
    } else if (sub === "lr" || sub === "di" || sub === "varc") {
      const p = sub === "varc" ? varcPlan(UI.dateKey) : dilrPlan(UI.dateKey);
      const part = sub === "varc" ? p : (p && p[sub]);
      if (!part || !part.current) { toast(sub.toUpperCase() + " all done 🎉"); return false; }
      const id = part.current.ch.id;
      const room = part.current.st.remaining + ((r.qa || {})[id] || 0);
      doneNow = Math.min(n, room);
      if (doneNow > 0) qa[id] = doneNow; else delete qa[id];
      goal = part.target;
    }
    setDay(UI.dateKey, { qa });
    render();
    return doneNow >= goal;
  }

  // Lightweight, dependency-free confetti burst — a little reward for study wins.
  function celebrate() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["var(--indigo)", "var(--pink)", "var(--teal)", "var(--green)", "var(--orange)", "#c98a2b"];
    const wrap = document.createElement("div");
    wrap.className = "confetti";
    for (let i = 0; i < 42; i++) {
      const p = document.createElement("i");
      p.style.left = (8 + Math.random() * 84).toFixed(1) + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.18).toFixed(2) + "s";
      p.style.setProperty("--dx", (Math.random() * 2 - 1).toFixed(2));
      p.style.setProperty("--r", Math.floor(Math.random() * 540) + "deg");
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 1500);
  }
  const toast = (msg) => {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
  };
  // let the backup module trigger an export and surface messages
  window.exportBackup = downloadExport;
  window.toast = toast;

  // ---------------------------------------------------------------- TODAY ---
  function renderToday() {
    const d = selDate(), r = day();
    const isToday = UI.dateKey === fmtKey(today());
    const working = isWorkingDay(d);
    const daily = Score.dailyScores(UI.dateKey);
    const diet = Score.dietDay(UI.dateKey);
    const om = Score.officeMonth(d), gw = Score.gymWeek(d), vw = Score.vitaminsWeek(d), ww = Score.wakeWeek(d);
    const dw = Score.dilrWeek(d), rw = Score.rcWeek(d), aw = Score.aeonWeek(d);
    const calT = S.settings.calTarget, proT = S.settings.proteinTarget;
    const todaysQA = Object.entries(r.qa || {}).filter(([, n]) => n > 0);
    const bun = Mascot.assess(UI.dateKey);

    return `
    <div class="card mascot-card">
      <div class="mascot">${Mascot.svg(bun.mood)}</div>
      <div class="bubble">
        <div class="bubble-head">${bun.head}</div>
        <div class="small muted">${bun.sub}</div>
      </div>
    </div>

    <div class="datenav">
      <button class="navbtn" data-act="date:-1" ${UI.dateKey <= PLAN_START ? "disabled" : ""}>‹</button>
      <span class="when">${fmtNice(d)}</span>
      <button class="navbtn" data-act="date:1">›</button>
      <input type="date" value="${UI.dateKey}" min="${PLAN_START}" data-act="date:set">
      <span class="chip ${working ? "work" : "off"}">${working ? "Working day" : "Off day"}</span>
      ${isToday ? "" : `<span class="chip today-link" data-act="date:today">Back to today</span>`}
    </div>

    <div class="card scorestrip">
      <div class="ringbox">${C.ring(Score.overallToday(UI.dateKey), { size: 132, color: "var(--indigo)", label: "Overall Today", sub: isToday ? "today" : "this day" })}
        <div class="ring-label muted">Week avg: ${Score.overallScore(d)}%</div></div>
      <div class="ringbox">${C.ring(Score.readinessScore(d), { size: 132, color: "var(--teal)", label: "CAT Readiness", sub: "weighted" })}</div>
      <div class="catbars">
        ${CATS.map((c) => `<div class="catbar">
          <span class="nm"><span class="dot" style="background:${c.color}"></span> ${c.name} <span class="wt">${Score.WEIGHTS[c.id]}%</span></span>
          ${daily[c.id] == null ? `<div class="hbar"></div>` : C.bar(daily[c.id], c.color)}
          <span class="pc">${daily[c.id] == null ? `<span class="muted small">off day</span>` : Math.round(daily[c.id]) + "%"}</span></div>`).join("")}
      </div>
    </div>

    ${(() => {
      // each subject's tile shows a rotating topic to do today; reading is a simple 20-min tile
      const setLabel = (q) => { const n = Math.max(1, Math.round(q / 4)); return `${n} set${n > 1 ? "s" : ""} (${q} Qs)`; };
      const dp = dilrPlan(UI.dateKey), vp = varcPlan(UI.dateKey); // LR, DI, VARC are weighted rotations
      const tgts = ["qa", "lr", "di", "varc", "vocab"].map((sub) => {
        if (sub === "lr" || sub === "di") {
          if (!dp) return { sub, missing: true, goal: 0, done: 0, label: "load plan in Study tab", note: "" };
          const part = dp[sub];
          if (dp.done || !part) return { sub, goal: 0, done: 0, label: "all done 🎉", note: "" };
          return { sub, goal: part.target, done: part.doneToday, label: setLabel(part.target), note: part.current.ch.name };
        }
        if (sub === "varc") {
          if (!vp) return { sub, missing: true, goal: 0, done: 0, label: "load plan in Study tab", note: "" };
          if (vp.done || !vp.current) return { sub, goal: 0, done: 0, label: "all done 🎉", note: "" };
          return { sub, goal: vp.target, done: vp.doneToday, label: `${vp.target} exercise${vp.target > 1 ? "s" : ""}`, note: vp.current.ch.name };
        }
        const p = planFor(sub, UI.dateKey);
        if (!p) return { sub, missing: true, goal: 0, done: 0, label: "load plan in Study tab", note: "" };
        if (p.done) return { sub, goal: 0, done: 0, label: "all done 🎉", note: "" };
        if (sub === "qa") {
          const bd = qaBreakdown(UI.dateKey);
          return { sub, goal: bd.goal, done: bd.done, label: `${bd.goal} questions today`, breakdown: bd.parts };
        }
        return { sub, goal: 1, done: p.doneToday, label: "1 session", note: p.current.ch.name };
      });
      tgts.push({ sub: "read", goal: 20, done: r.readMin || 0, label: "20 minutes", note: "daily reading", color: "var(--green)", soft: "var(--green-soft)" });
      const hitN = tgts.filter((t) => t.goal > 0 && t.done >= t.goal).length;
      const liveN = tgts.filter((t) => t.goal > 0).length;
      return `<div class="card span-3 targets-card">
        <h3>Today's Targets <span class="muted small">${hitN}/${liveN} done · tap a card to log</span></h3>
        <p class="sub">The priority. One task per subject, tap to mark done, tap again to undo.</p>
        <div class="tgt-grid">
          ${tgts.map((t) => {
            const m = t.sub === "read" ? { name: "Reading", color: t.color, soft: t.soft } : SUB_META[t.sub];
            const na = t.goal === 0;
            const done = !na && t.done >= t.goal;
            const munit = t.sub === "read" ? "min" : t.sub === "varc" ? "exercises" : t.sub === "vocab" ? "sessions" : "Qs";
            return `<div class="tgt ${done ? "hit" : na ? "na" : ""}" ${na ? "" : `data-act="tgt:${t.sub}" role="button" tabindex="0" title="${done ? "tap to undo" : "tap to mark done"}"`} style="--c:${m.color};--s:${m.soft}">
              <div class="tgt-head"><span class="tgt-name"><span class="dot" style="background:${m.color}"></span> ${m.name}</span>${na ? `<span class="yn done">${t.missing ? "—" : "✓"}</span>` : done ? `<span class="yn yes">✓</span>` : `<span class="yn no">log</span>`}</div>
              <div class="tgt-goal">${t.label}</div>
              ${t.breakdown ? `<div class="tgt-list">${t.breakdown.map((b) => `<div class="tgt-li ${b.done >= b.target ? "ok" : ""}"><span>${esc(b.ch.name)}</span><b>${b.done}/${b.target}</b></div>`).join("")}</div>` : t.note ? `<div class="tgt-note">${esc(t.note)}</div>` : ""}
              ${na || t.sub === "read" ? (na ? "" : `<div class="tgt-foot"><span class="tgt-prog">${t.done}/${t.goal}</span><span class="tgt-edit" data-act="mlog:edit"><input type="number" min="0" inputmode="numeric" class="tgt-num" value="${t.done}" data-act="mlog:${t.sub}" aria-label="${m.name} done today"> ${munit}</span></div>`) : `<div class="tgt-foot"><span class="tgt-prog">${t.done}/${t.goal}</span><span class="tgt-edit" data-act="mlog:edit"><button class="step" data-act="mstep:${t.sub}:down" aria-label="remove one">−</button><input type="number" min="0" inputmode="numeric" class="tgt-num" value="${t.done}" data-act="mlog:${t.sub}" aria-label="${m.name} done today"><button class="step" data-act="mstep:${t.sub}:up" aria-label="add one">+</button> ${munit}</span></div>`}
            </div>`;
          }).join("")}
        </div>
      </div>`;
    })()}

    <div class="grid cols-3 mt16">
      <div class="card tint-teal">
        <h3><span class="dot" style="background:var(--teal)"></span> Wake Up</h3>
        <p class="sub">Goal: 7 successful days a week</p>
        <div class="seg">
          <button class="${r.wake === true ? "on yes" : ""}" data-act="wake:yes">Woke up ✓</button>
          <button class="${r.wake === false ? "on no" : ""}" data-act="wake:no">Missed</button>
        </div>
        <div class="row mt12"><span class="lbl">Woke up at ${r.wakeTime ? `<span class="hint">${Math.round(Score.wakeDayScore(r) / 10)}/10 pts</span>` : `<span class="hint">earlier = more pts</span>`}</span><input class="input sm" type="time" value="${r.wakeTime || ""}" data-act="wake:time"></div>
        <details class="wake-tiers"><summary>How points work</summary>
          <div class="tier-grid">${[["before 5:30", 10], ["5:30–6", 9], ["6–6:30", 8], ["6:30–7", 7], ["7–8", 5], ["8–9", 2], ["after 9", 0]].map(([t, p]) => `<span>${t}</span><b>${p}</b>`).join("")}</div></details>
        <div class="row mt12"><span class="hint">This week</span><b>${ww.yes}/${ww.target} days · ${Math.round(ww.score)}%</b></div>
      </div>

      <div class="card tint-purple">
        <h3><span class="dot" style="background:var(--purple)"></span> Office</h3>
        <p class="sub">${working ? "Working day. Log your status." : "Off day (Sun / 1st & 3rd Sat). Nothing expected."}</p>
        <div class="seg">
          ${["office", "wfh", "absent"].map((o) => `<button class="${r.office === o ? "on" : ""}" data-act="office:${o}">${o === "wfh" ? "WFH" : o[0].toUpperCase() + o.slice(1)}</button>`).join("")}
        </div>
        <div class="row mt12"><span class="hint">Month attendance</span><b>${om.attended}/${om.expected} · ${om.score == null ? "–" : Math.round(om.score) + "%"}</b></div>
        <div class="row"><span class="hint">WFH used</span><b style="${om.wfh > 2 ? "color:var(--red)" : ""}">${om.wfh}/2</b></div>
      </div>

      <div class="card tint-orange">
        <h3><span class="dot" style="background:var(--orange)"></span> Gym</h3>
        <p class="sub">Goal: 4 classes a week · 10k steps = 25% credit</p>
        <div class="row"><span class="lbl">Gym class attended</span><button class="check ${r.gymClass ? "on" : ""}" data-act="gym:class">✓</button></div>
        ${r.gymClass ? `<div class="row"><span class="lbl">Which class?</span>
          <select class="input" style="width:160px;padding:6px 9px" data-act="gym:type">
            <option value="" ${!r.gymType ? "selected" : ""} disabled>Pick a class…</option>
            ${GYM_CLASSES.map((g) => `<option value="${g}" ${r.gymType === g ? "selected" : ""}>${g}</option>`).join("")}
          </select></div>
        <div class="row"><span class="lbl">Calories burned</span><input class="input sm" type="number" value="${r.gymCal ?? ""}" placeholder="kcal" data-act="gym:cal"></div>` : ""}
        <div class="row"><span class="lbl">10,000+ steps</span><button class="check ${r.steps10k ? "on" : ""}" data-act="gym:steps">✓</button></div>
        <div class="row"><span class="hint">This week</span><b>${gw.classes}/${gw.target} classes${gw.stepDays ? ` +${gw.stepDays} step day${gw.stepDays > 1 ? "s" : ""}` : ""} · ${Math.round(gw.score)}%</b></div>
      </div>

      <div class="card tint-pink">
        <h3><span class="dot" style="background:var(--pink)"></span> Vitamins</h3>
        <p class="sub">Iron & B12 daily · Vitamin D weekly</p>
        <div class="row"><span class="lbl">Iron</span><button class="check ${r.iron ? "on" : ""}" data-act="vit:iron">✓</button></div>
        <div class="row"><span class="lbl">B12</span><button class="check ${r.b12 ? "on" : ""}" data-act="vit:b12">✓</button></div>
        <div class="row"><span class="lbl">Amla shot</span><button class="check ${r.amla ? "on" : ""}" data-act="vit:amla">✓</button></div>
        ${(!vw.vitd || r.vitd) ? `<div class="row"><span class="lbl">Vitamin D <span class="hint">${r.vitd ? "done today" : "due this week"}</span></span><button class="check ${r.vitd ? "on" : ""}" data-act="vit:vitd">✓</button></div>` : `<div class="row"><span class="lbl muted">Vitamin D <span class="hint">✓ done this week</span></span></div>`}
        <div class="row"><span class="hint">Week doses</span><b>${vw.done}/${vw.required} · ${Math.round(vw.score)}%</b></div>
      </div>

      <div class="card span-2 tint-green">
        <h3><span class="dot" style="background:var(--green)"></span> Diet Log</h3>
        <p class="sub">Targets: ${calT} kcal · ${proT}g protein <button class="iconbtn" data-act="diet:targets">edit</button> · Diet score today: <b>${diet.score == null ? "–" : diet.score + "%"}</b></p>
        <div class="macro-bars">
          <div class="mb">
            <div class="mb-head"><span>Calories · ${diet.cal} / ${calT}</span>
              <b class="${diet.cal > calT ? "over" : ""}">${diet.cal > calT ? `${diet.cal - calT} Over` : `${calT - diet.cal} left`}</b></div>
            <div class="dualbar">
              <div class="seg-g" style="width:${diet.cal > calT ? (calT / diet.cal) * 100 : Math.min(100, (diet.cal / calT) * 100)}%"></div>
              ${diet.cal > calT ? `<div class="seg-r" style="width:${((diet.cal - calT) / diet.cal) * 100}%"></div>` : ""}
            </div>
          </div>
          <div class="mb">
            <div class="mb-head"><span>Protein · ${diet.protein}g / ${proT}g</span>
              <b style="${diet.protein >= proT ? "color:#2f9e62" : ""}">${diet.protein >= proT ? "target hit 💪" : `${Math.round((proT - diet.protein) * 10) / 10}g to go`}</b></div>
            <div class="dualbar"><div class="seg-i" style="width:${Math.min(100, (diet.protein / proT) * 100)}%"></div></div>
          </div>
        </div>
        ${MEALS.concat(r.foods.some((f) => (f.meal || "other") === "other") ? [{ id: "other", name: "Other" }] : []).map((m) => {
          const items = r.foods.map((f, i) => ({ f, i })).filter(({ f }) => (f.meal || "other") === m.id);
          const mc = Math.round(items.reduce((a, { f }) => a + f.cal, 0));
          const mp = Math.round(items.reduce((a, { f }) => a + f.p, 0) * 10) / 10;
          return `<div class="meal-block">
            <div class="meal-head"><span class="meal-title">${m.name}${items.length ? `: ${mc} kcal` : ""}</span>${items.length ? `<span class="mc">${mp}g protein</span>` : ""}</div>
            ${items.map(({ f, i }) => `<div class="food-row2">
              <span class="f-emoji">${FoodDB.emojiFor(f.name)}</span>
              <div><div class="nm">${esc(f.name)}</div>
                <div class="f-sub"><input class="input qty" type="number" min="0.25" step="0.25" value="${f.qty}" data-act="food:qty:${i}"> ${esc(f.unit)}</div></div>
              <div class="f-right"><div class="f-cal">${Math.round(f.cal)}</div><div class="f-pro">${Math.round(f.p * 10) / 10}g protein</div></div>
              <button class="del" data-act="food:del:${i}" title="remove">✕</button>
            </div>`).join("")}
            ${UI.addingMeal === m.id ? `
            <div class="food-box field-row mt8">
              <input class="input" style="flex:1" id="foodInput" placeholder="Type food… (2 eggs, rice and rajma)" value="${esc(UI.foodQuery)}" autocomplete="off">
              <button class="btn primary" data-act="food:add">Add</button>
              <button class="btn ghost" data-act="meal:closeadd">✕</button>
              <div class="suggest" id="foodSuggest" style="display:none"></div>
            </div>
            <div class="custom-row mt8">
              <span class="custom-lbl">or enter your own</span>
              <input class="input" style="flex:1;min-width:90px" id="customName" placeholder="Item name (optional)" autocomplete="off">
              <input class="input sm" type="number" min="0" inputmode="numeric" id="customCal" placeholder="kcal">
              <input class="input sm" type="number" min="0" step="0.1" inputmode="decimal" id="customPro" placeholder="protein g">
              <button class="btn primary" data-act="food:custom">Add</button>
            </div>
            ${recentChips()}` : `<div class="addfood-row"><button class="addfood" data-act="meal:add:${m.id}">+ Add Food</button></div>`}
          </div>`;
        }).join("")}
      </div>

      <div class="card span-3">
        <h3><span class="dot" style="background:var(--indigo)"></span> Journal <span class="muted small">optional · not scored</span></h3>
        <p class="sub">A line on how today went — wins, mood, what to fix tomorrow.</p>
        <textarea class="input journal" rows="3" placeholder="Write anything here…" data-act="journal">${esc(r.journal || "")}</textarea>
      </div>

    </div>`;
  }

  // ---------------------------------------------------------------- STUDY ---
  function renderStudy() {
    const d = selDate();
    const dw = Score.dilrWeek(d), rw = Score.rcWeek(d), aw = Score.aeonWeek(d);
    const qa = Score.qaScore();
    const weeksBack = Array.from({ length: 6 }, (_, i) => addDays(monday(today()), -7 * (5 - i)));
    const subPct = (s) => {
      const items = S.chapters.filter((c) => (c.subject || "qa") === s);
      if (!items.length) return null;
      const done = items.reduce((a, c) => a + Score.chapterDone(c), 0);
      const tot = items.reduce((a, c) => a + c.total, 0);
      return tot ? Math.round((done / tot) * 100) : 0;
    };
    return `
    <div class="card mt8 roadmap-card">
      <h3>CAT 2026 Roadmap</h3>
      <p class="sub">Exam: <b>Sun 29 Nov 2026</b> · Registration ~1 Aug–20 Sep · Notification ~26 Jul</p>
      <div class="roadmap">
        <div class="rm now"><b>Now → 31 Aug</b><span>Finish all books: QA, DILR, VARC, Vocab</span></div>
        <div class="rm"><b>September</b><span>Sectionals + first full mocks</span></div>
        <div class="rm"><b>Oct → Nov</b><span>Full mocks, analysis & revision</span></div>
        <div class="rm exam"><b>29 Nov</b><span>CAT 2026 🎯</span></div>
      </div>
    </div>

    <div class="grid cols-4 mt16">
      ${["qa", "dilr", "varc", "vocab"].map((s) => `<div class="card" style="background:linear-gradient(180deg,${SUB_META[s].soft},#fff 72%)"><div class="ringbox">${C.ring(subPct(s) ?? 0, { size: 104, color: SUB_META[s].color, label: SUB_META[s].name + (s === "vocab" ? " (WPME)" : " book"), sub: "complete" })}</div></div>`).join("")}
    </div>
    <div class="grid cols-2 mt16">
      <div class="card">
        <h3>DILR & VARC topics done</h3><p class="sub">Sets / exercises logged so far · 1/day minimum</p>
        <div class="row"><span class="lbl"><span class="dot" style="background:var(--orange)"></span> DILR sets</span><b>${Score.subjectTotalDone("dilr")} · this week ${Score.dilrWeek(d).sets}</b></div>
        <div class="row"><span class="lbl"><span class="dot" style="background:var(--pink)"></span> VARC exercises</span><b>${Score.subjectTotalDone("varc")} · this week ${Score.rcWeek(d).rcs}</b></div>
      </div>
      <div class="card"><h3>Reading</h3><p class="sub">20 min/day habit</p>
        <div class="ringbox" style="text-align:center"><div style="font-size:38px;font-weight:800;letter-spacing:-.02em">🔥 ${Score.readingStreak()}</div><div class="ring-label">day streak (20+ min)</div></div>
        <div class="row mt8"><span class="hint">Days hit this week</span><b>${Score.readingWeek(d).days}/7</b></div></div>
    </div>

    <div class="card mt16">
      <div class="row" style="border:none;padding:0;align-items:flex-start">
        <div><h3 style="margin:0">Full Syllabus</h3><p class="sub" style="margin:2px 0 0">All books by 31 Aug. Tap a subject to see its topics.</p></div>
        <div class="field-row" style="flex:0 0 auto">
          <button class="btn primary" data-act="ch:seed">📚 Load plan</button>
          <button class="btn danger" data-act="ch:fresh">🔄 Start fresh</button>
        </div>
      </div>
      ${PLAN_SUBJECTS.map((s) => {
        const items = S.chapters.filter((c) => (c.subject || "qa") === s).sort((a, b) => (a.ord ?? 99) - (b.ch?.ord ?? b.ord ?? 99));
        if (!items.length) return "";
        const m = SUB_META[s];
        const pct = subPct(s);
        return `<details class="subj mt12">
          <summary><span class="subj-name"><span class="dot" style="background:${m.color}"></span> ${m.name}</span>
            <span class="subj-prog"><span class="subj-bar">${C.bar(pct ?? 0, m.color)}</span><b>${pct}%</b><span class="muted small">${items.length} topics</span><span class="chev">▾</span></span></summary>
          <table class="tbl mt8"><thead><tr><th>Item</th><th>Progress</th><th>%</th><th>Left</th><th>Pace/day</th><th>Target</th><th></th></tr></thead><tbody>
          ${items.map((ch) => { const st = Score.chapterStats(ch);
            return `<tr>
              <td><b>${esc(ch.name)}</b></td>
              <td style="min-width:130px"><span class="num">${st.done}/${ch.total}</span>${C.bar(st.pct, m.color)}</td>
              <td>${pill(st.pct)}</td>
              <td class="num">${st.remaining}${st.skip ? `<div class="muted small">${st.skip} deferred</div>` : ""}</td>
              <td class="num">${st.pace == null ? "–" : st.pace + " " + (ch.unit || "Qs")}</td>
              <td class="num">${ch.target ? fmtShort(parseKey(ch.target)) : "–"}</td>
              <td><button class="iconbtn" data-act="ch:defer:${ch.id}">${ch.skip ? "Restore" : "Skip"}</button><button class="iconbtn" data-act="ch:edit:${ch.id}">Edit</button><button class="iconbtn" data-act="ch:del:${ch.id}">Delete</button></td>
            </tr>`;
          }).join("")}
        </tbody></table></details>`;
      }).join("") || `<div class="empty">No items yet. Click "Load plan" above.</div>`}
      <details class="subj mt12">
        <summary><span class="subj-name">＋ Add a custom item</span><span class="chev">▾</span></summary>
        <div class="field-row mt8">
          <input class="input" id="chName" placeholder="Item name" style="flex:2">
          <select class="input sm" id="chSubject" style="width:90px">${PLAN_SUBJECTS.map((s) => `<option value="${s}">${SUB_META[s].name}</option>`).join("")}</select>
          <input class="input sm" id="chTotal" type="number" min="1" placeholder="Total">
          <input class="input sm" id="chDone" type="number" min="0" placeholder="Done">
          <input class="input" id="chTarget" type="date" style="width:150px">
          <button class="btn primary" data-act="ch:add">+ Add</button>
        </div>
        <div class="small muted mt8">Start fresh wipes all logs &amp; progress, keeping only Averages, Percentages, RPV and Alligations done (a backup downloads first).</div>
      </details>
    </div>

    <div class="grid cols-2 mt16">
      <div class="card">
        <h3>DILR · last 6 weeks</h3>
        <p class="sub">Goal: 12 sets per week</p>
        ${C.barChart(weeksBack.map((m) => ({ x: fmtShort(m), y: Score.dilrWeek(m).sets })), { color: "var(--orange)", max: 14 })}
      </div>
      <div class="card">
        <h3>VARC · last 6 weeks</h3>
        <p class="sub">RCs (goal 10) and Aeon/vocab days (goal 7) per week</p>
        ${C.barChart(weeksBack.flatMap((m) => ([
          { x: "RC " + fmtShort(m), y: Score.rcWeek(m).rcs, color: "var(--pink)" },
          { x: "Ae", y: Score.aeonWeek(m).essays, color: "var(--purple)" },
        ])), { max: 12 })}
      </div>
    </div>`;
  }

  // ------------------------------------------------------------ DASHBOARD ---
  function renderDashboard() {
    const base = new Date(today().getFullYear(), today().getMonth() - UI.monthOffset, 1);
    const keys = monthKeys(base);
    const monthName = base.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const todayKey = fmtKey(today());
    const flow = keys.map((k) => ({ x: String(Number(k.slice(8, 10))), y: k <= todayKey ? Score.dailyActivity(k) : 0 }));

    // weekly averages within month
    const weeksM = [...new Set(keys.map((k) => fmtKey(monday(parseKey(k)))))];
    const weekly = weeksM.map((wk, i) => {
      const days = weekKeys(parseKey(wk)).filter((k) => keys.includes(k) && k <= todayKey);
      const avg = days.length ? days.reduce((a, k) => a + Score.dailyActivity(k), 0) / days.length : 0;
      return { x: "Week " + (i + 1), y: Math.round(avg) };
    });

    // weekday rhythm
    const dows = [[], [], [], [], [], [], []];
    keys.filter((k) => k <= todayKey).forEach((k) => dows[(parseKey(k).getDay() + 6) % 7].push(Score.dailyActivity(k)));
    const rhythm = dows.map((a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0));

    const refDate = UI.monthOffset === 0 ? today() : new Date(base.getFullYear(), base.getMonth() + 1, 0);
    const cats = Score.categoryScores(refDate);
    const ranked = CATS.map((c) => ({ ...c, score: Math.round(cats[c.id]) })).sort((a, b) => b.score - a.score);

    // week-on-week category trends (from plan start, up to last 8 weeks)
    const tMondays = [];
    { let mw = monday(today()); while (fmtKey(mw) >= PLAN_START && tMondays.length < 8) { tMondays.unshift(new Date(mw)); mw = addDays(mw, -7); } }
    const tWeeks = tMondays.map((mw) => { const end = addDays(mw, 6); return { mw, ref: end > today() ? today() : end }; });
    const catTrends = CATS.map((c) => {
      const series = tWeeks.map((w) => ({ x: fmtShort(w.mw), y: Math.round(Score.categoryScores(w.ref)[c.id] || 0) }));
      const last = series.length ? series[series.length - 1].y : 0;
      const delta = series.length > 1 ? last - series[series.length - 2].y : null;
      return { c, series, last, delta };
    });

    // heatmap
    const firstDow = (parseKey(keys[0]).getDay() + 6) % 7;
    const hmCells = [...Array(firstDow).fill(null), ...keys];

    return `
    <div class="datenav">
      <button class="navbtn" data-act="month:-1">‹</button><span class="when">${monthName}</span>
      <button class="navbtn" data-act="month:1" ${UI.monthOffset === 0 ? "disabled" : ""}>›</button>
    </div>
    <div class="grid cols-3">
      <div class="card span-2">
        <h3>Daily Activity Flow</h3><p class="sub">Share of daily checklist completed, day by day</p>
        ${C.areaChart(flow, { color: "var(--indigo)", id: "flow" })}
      </div>
      <div class="card"><h3>Overall Progress</h3><p class="sub">Composite weighted score</p>
        <div class="ringbox">${C.ring(Score.overallScore(refDate), { size: 150, color: "var(--indigo)", sub: "completion rate" })}</div>
        <div class="ringbox mt8">${C.ring(Score.readinessScore(refDate), { size: 96, color: "var(--teal)", label: "CAT Readiness" })}</div>
      </div>
      <div class="card span-2">
        <h3>Weekly Totals</h3><p class="sub">Average daily completion per week</p>
        ${C.barChart(weekly, { color: "var(--teal)", max: 100 })}
      </div>
      <div class="card"><h3>Weekly Rhythm</h3><p class="sub">Average completion by weekday</p>
        ${C.radar(rhythm, ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], { color: "var(--teal)" })}
      </div>
      <div class="card span-2">
        <h3>Best Performing Areas</h3><p class="sub">Current week scores, ranked</p>
        <div class="grid cols-2">${ranked.map((c) => `<div class="row" style="border:none;background:${c.soft};border-radius:12px;padding:9px 14px">
          <span class="lbl"><span class="dot" style="background:${c.color}"></span> ${c.name}</span><b style="color:${c.color}">${c.score}%</b></div>`).join("")}</div>
      </div>
      <div class="card"><h3>Month Heatmap</h3><p class="sub">Daily completion intensity</p>
        <div class="heatmap">
          ${["M", "T", "W", "T", "F", "S", "S"].map((h) => `<div class="hm-head">${h}</div>`).join("")}
          ${hmCells.map((k) => {
            if (!k) return `<div></div>`;
            const v = k <= todayKey ? Score.dailyActivity(k) : null;
            const lvl = v == null ? "future" : v >= 80 ? "l4" : v >= 55 ? "l3" : v >= 30 ? "l2" : v > 0 ? "l1" : "";
            return `<div class="hm-cell ${lvl} ${k === todayKey ? "is-today" : ""}" title="${k}${v != null ? " · " + v + "%" : ""}">${Number(k.slice(8, 10))}</div>`;
          }).join("")}
        </div>
      </div>
      <div class="card span-3">
        <h3>Category Trends</h3><p class="sub">Week-on-week score for each area, since the plan started</p>
        <div class="trend-grid">
          ${catTrends.map((t) => `<div class="trend-cell">
            <div class="trend-head">
              <span class="lbl"><span class="dot" style="background:${t.c.color}"></span> ${t.c.name}</span>
              <span class="trend-now">${t.last}%${t.delta == null ? "" : ` <span class="delta ${t.delta >= 0 ? "up" : "down"}">${t.delta >= 0 ? "▲" : "▼"} ${Math.abs(t.delta)}</span>`}</span>
            </div>
            ${C.areaChart(t.series, { color: t.c.color, id: "tr_" + t.c.id, w: 320, h: 130 })}
          </div>`).join("")}
        </div>
      </div>
    </div>`;
  }

  // -------------------------------------------------------------- REPORTS ---
  const ADVICE = {
    study: "Block your highest-energy hours for QA LOD 2 sets; even 2 focused chapters/week moves the readiness needle fastest.",
    diet: "Front-load protein: eggs or whey before noon makes 90g much easier to reach by dinner.",
    gym: "Lock 4 class slots in your calendar now; a 10k-step walk still banks 25% credit on rest days.",
    wake: "Anchor the wake-up to a fixed sleep time; consistency feeds every other score.",
    office: "Plan WFH days at the start of the month so the 2-day cap never surprises you.",
    vitamins: "Keep Iron and B12 next to your toothbrush; pick a fixed Vitamin D day like Sunday.",
  };
  const FOCUS = {
    study: "Hit the daily QA pace shown in the Study tab and close 12 DILR sets",
    diet: "Average 90g protein while staying near 1200 kcal",
    gym: "Attend all 4 gym classes (use 10k-step days as backup)",
    wake: "String 7/7 successful wake-ups",
    office: "Full attendance on every expected working day",
    vitamins: "All 15 doses: Iron ×7, B12 ×7, Vitamin D ×1",
  };

  function weekReport(refMon) {
    const d = addDays(refMon, 6) > today() ? today() : addDays(refMon, 6);
    const cats = Score.categoryScores(d);
    return {
      d, cats,
      overall: Score.overallScore(d), readiness: Score.readinessScore(d),
      qa: Score.qaScore(), dilr: Score.dilrWeek(d), rc: Score.rcWeek(d), aeon: Score.aeonWeek(d),
      varc: Score.varcWeek(d), study: Score.studyScore(d),
      gym: Score.gymWeek(d), diet: Score.dietWeek(d), wake: Score.wakeWeek(d),
      office: Score.officeMonth(d), vit: Score.vitaminsWeek(d),
    };
  }

  function renderReports() {
    const refMon = addDays(monday(today()), -7 * UI.weekOffset);
    const w = weekReport(refMon);
    const prev = weekReport(addDays(refMon, -7));
    const range = `${fmtShort(refMon)} – ${fmtShort(addDays(refMon, 6))}`;

    const entries = CATS.map((c) => ({ ...c, score: Math.round(w.cats[c.id]), weight: Score.WEIGHTS[c.id] }));
    const wins = entries.filter((e) => e.score >= 70).sort((a, b) => b.score - a.score);
    const winLines = wins.length
      ? wins.map((e) => `<li><b>${e.name} at ${e.score}%</b>: keep this rhythm going.</li>`)
      : [`<li>Logging itself is the win this week; data in is momentum out. Best area: <b>${entries.slice().sort((a, b) => b.score - a.score)[0].name}</b>.</li>`];
    if (w.aeon.essays >= 5) winLines.push(`<li><b>${w.aeon.essays} Aeon/vocab days</b> this week, VARC compounding nicely.</li>`);
    if (w.gym.classes >= 3) winLines.push(`<li><b>${w.gym.classes} gym classes</b> attended.</li>`);
    if (w.wake.yes >= 6) winLines.push(`<li><b>${w.wake.yes}/7 wake-ups</b>, elite consistency.</li>`);

    const weak = entries.filter((e) => e.score < 60).sort((a, b) => a.score - b.score).slice(0, 3);
    const improveLines = weak.length
      ? weak.map((e) => `<li><b>${e.name} (${e.score}%):</b> ${ADVICE[e.id]}</li>`)
      : [`<li>No weak areas this week. Consider nudging targets up slightly.</li>`];

    const focus = entries.slice().sort((a, b) => (100 - b.score) * b.weight - (100 - a.score) * a.weight).slice(0, 3);

    // ---- monthly ----
    const mBase = new Date(today().getFullYear(), today().getMonth() - UI.monthOffset, 1);
    const mName = mBase.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const mKeys = monthKeys(mBase);
    const mMondays = [...new Set(mKeys.map((k) => fmtKey(monday(parseKey(k)))))]
      .filter((mk) => parseKey(mk) <= today()); // exclude weeks that haven't started yet
    const weekRows = mMondays.map((mk, i) => ({ label: "W" + (i + 1) + " · " + fmtShort(parseKey(mk)), r: weekReport(parseKey(mk)) }));
    const avg = (f) => Math.round(weekRows.reduce((a, x) => a + f(x.r), 0) / (weekRows.length || 1));
    const prevBase = new Date(mBase.getFullYear(), mBase.getMonth() - 1, 1);
    const pMondays = [...new Set(monthKeys(prevBase).map((k) => fmtKey(monday(parseKey(k)))))];
    const pRows = pMondays.map((mk) => weekReport(parseKey(mk)));
    const pAvg = (f) => Math.round(pRows.reduce((a, x) => a + f(x), 0) / (pRows.length || 1));
    const delta = (cur, prv) => {
      const df = cur - prv;
      if (Math.abs(df) < 2) return `<span class="delta-flat">→ steady</span>`;
      return df > 0 ? `<span class="delta-up">▲ +${df}</span>` : `<span class="delta-down">▼ ${df}</span>`;
    };
    const momentum = weekRows.length >= 2
      ? weekRows[weekRows.length - 1].r.overall - weekRows[0].r.overall : 0;

    const trendDefs = [
      ["Overall", (r) => r.overall], ["CAT Readiness", (r) => r.readiness],
      ["Study", (r) => r.cats.study], ["QA", (r) => r.qa ?? 0], ["Diet", (r) => r.cats.diet],
      ["Gym", (r) => r.cats.gym], ["Wake Up", (r) => r.cats.wake],
      ["Office", (r) => r.cats.office], ["Vitamins", (r) => r.cats.vitamins],
    ];

    const weeklyCard = `
      <div class="card">
        <div class="datenav" style="margin-bottom:8px">
          <button class="navbtn" data-act="week:-1">‹</button>
          <span class="when">Weekly Report · ${range}</span>
          <button class="navbtn" data-act="week:1" ${UI.weekOffset === 0 ? "disabled" : ""}>›</button>
        </div>
        <div class="grid cols-2">
          <div class="ringbox">${C.ring(w.overall, { size: 110, color: "var(--indigo)", label: "Overall Weekly Score" })}</div>
          <div class="ringbox">${C.ring(w.readiness, { size: 110, color: "var(--teal)", label: "CAT Readiness" })}</div>
        </div>
        <div class="report-section">
          <h4>Category breakdown</h4>
          ${entries.map((e) => `<div class="statline"><span><span class="dot" style="background:${e.color}"></span> ${e.name}</span><b>${e.score}% ${delta(e.score, Math.round(prev.cats[e.id]))}</b></div>`).join("")}
          <h4>Study breakdown</h4>
          <div class="statline"><span>QA (avg chapter completion)</span><b>${w.qa == null ? "no chapters" : w.qa + "%"}</b></div>
          <div class="statline"><span>DILR sets</span><b>${w.dilr.sets}/12 · ${Math.round(w.dilr.score)}%</b></div>
          <div class="statline"><span>RCs</span><b>${w.rc.rcs}/10 · ${Math.round(w.rc.score)}%</b></div>
          <div class="statline"><span>Aeon / Vocab days${w.aeon.pages ? ` (${w.aeon.pages} Norman Lewis pages)` : ""}</span><b>${w.aeon.essays}/7 · ${Math.round(w.aeon.score)}%</b></div>
          <h4>Health & routine</h4>
          <div class="statline"><span>Gym classes${w.gym.types.length ? ` (${w.gym.types.join(", ")})` : ""}</span><b>${w.gym.classes}/${w.gym.target}${w.gym.stepDays ? ` (+${w.gym.stepDays} step days)` : ""} · ${Math.round(w.gym.score)}%</b></div>
          <div class="statline"><span>Diet (days logged: ${w.diet.days})</span><b>${w.diet.score == null ? "no logs" : w.diet.score + "%"}</b></div>
          <div class="statline"><span>Wake-ups</span><b>${w.wake.yes}/${w.wake.target} · ${Math.round(w.wake.score)}%</b></div>
          <div class="statline"><span>Office (from 15 Jun)</span><b>${w.office.attended}/${w.office.expected} · ${w.office.score == null ? "–" : Math.round(w.office.score) + "%"}</b></div>
          <div class="statline"><span>Vitamins</span><b>${w.vit.done}/${w.vit.required} · ${Math.round(w.vit.score)}%</b></div>
          <h4>🏆 Weekly Wins</h4><ul class="cleanlist wins">${winLines.join("")}</ul>
          <h4>🔧 Areas to Improve</h4><ul class="cleanlist improve">${improveLines.join("")}</ul>
          <h4>🎯 Next Week Focus</h4><ul class="cleanlist focus">${focus.map((e, i) => `<li><b>${i + 1}. ${e.name}:</b> ${FOCUS[e.id]}</li>`).join("")}</ul>
        </div>
      </div>`;

    const monthlyCard = `
      <div class="card">
        <div class="datenav" style="margin-bottom:8px">
          <button class="navbtn" data-act="month:-1">‹</button>
          <span class="when">Monthly Report · ${mName}</span>
          <button class="navbtn" data-act="month:1" ${UI.monthOffset === 0 ? "disabled" : ""}>›</button>
        </div>
        <div class="grid cols-2">
          <div class="ringbox">${C.ring(avg((r) => r.overall), { size: 110, color: "var(--indigo)", label: "Overall Monthly Score" })}</div>
          <div class="ringbox">${C.ring(avg((r) => r.readiness), { size: 110, color: "var(--teal)", label: "Readiness (month avg)" })}</div>
        </div>
        <div class="report-section">
          <h4>Trends vs previous month</h4>
          ${trendDefs.map(([nm, f]) => `<div class="statline"><span>${nm}</span><b>${avg(f)}% ${delta(avg(f), pAvg(f))}</b></div>`).join("")}
          <h4>Week-by-week (overall)</h4>
          ${C.barChart(weekRows.map((x) => ({ x: x.label.split(" · ")[0], y: x.r.overall })), { color: "var(--purple)", max: 100, h: 150 })}
          <h4>Momentum</h4>
          <p class="small" style="margin:4px 0">
            ${momentum > 4 ? `📈 Strong upward momentum: overall improved <b>+${momentum} pts</b> from the first to the most recent week of the month. Keep stacking.`
              : momentum < -4 ? `📉 Overall dipped <b>${momentum} pts</b> across the month. One steady week resets the trend, focus on the 3 actions in the weekly plan.`
              : `➡️ Holding steady across the month. Consistency is the base; now pick one category to push 10 points higher.`}
          </p>
        </div>
      </div>`;

    return `
    <div class="seg" style="margin-bottom:14px">
      <button class="${UI.reportMode === "weekly" ? "on" : ""}" data-act="rmode:weekly">Weekly Report</button>
      <button class="${UI.reportMode === "monthly" ? "on" : ""}" data-act="rmode:monthly">Monthly Report</button>
    </div>
    ${UI.reportMode === "monthly" ? monthlyCard : weeklyCard}`;
  }

  // --------------------------------------------------------------- RENDER ---
  function render() {
    const y = window.scrollY; // re-rendering must never move the page
    const view = document.getElementById("view");
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === UI.tab));
    view.innerHTML = UI.tab === "today" ? renderToday()
      : UI.tab === "study" ? renderStudy()
      : UI.tab === "dashboard" ? renderDashboard()
      : renderReports();
    if (UI.tab === "today") wireFoodInput();
    window.scrollTo(0, y);
  }

  // ------------------------------------------------------------ FOOD INPUT --
  function wireFoodInput() {
    const inp = document.getElementById("foodInput");
    const box = document.getElementById("foodSuggest");
    if (!inp) return;
    const update = () => {
      UI.foodQuery = inp.value;
      const q = inp.value.replace(/^[\d.]+\s*/, "").replace(/^(half|quarter|one|two|three|four|five)\s+/i, "");
      const matches = q.length >= 2 ? FoodDB.searchFoods(q) : [];
      if (matches.length) {
        box.style.display = "block";
        box.innerHTML = matches.map((f, i) =>
          `<button data-food="${i}"><span>${FoodDB.emojiFor(f.n)} ${esc(f.n)}</span><span class="macro">${f.c} kcal · ${f.p}g / ${esc(f.u)}</span></button>`).join("");
        box.querySelectorAll("button").forEach((b, i) => b.onclick = () => addFood(matches[i]));
      } else if (q.length >= 2) {
        // Not in the DB? Offer to add it on the spot with custom macros (then it's saved for next time).
        box.style.display = "block";
        box.innerHTML = `<button class="add-custom"><span>➕ Add “${esc(inp.value.trim())}” yourself</span><span class="macro">enter calories & protein below</span></button>`;
        box.querySelector("button").onclick = () => {
          const cn = document.getElementById("customName");
          if (cn) cn.value = inp.value.trim();
          box.style.display = "none";
          const cc = document.getElementById("customCal"); if (cc) cc.focus({ preventScroll: true });
        };
      } else {
        box.style.display = "none";
      }
    };
    inp.addEventListener("input", update);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") commitFood(); });
    ["customName", "customCal", "customPro"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("keydown", (e) => { if (e.key === "Enter") addCustomFood(); });
    });
    // input only exists while a meal's Add Food is open; focus without scrolling the page
    inp.focus({ preventScroll: true });
    if (UI.foodQuery) {
      inp.setSelectionRange(inp.value.length, inp.value.length);
      update();
    }
  }

  function qtyFromInput() {
    const m = (UI.foodQuery || "").match(/^(\d+(?:\.\d+)?)/);
    if (m) return parseFloat(m[1]);
    const w = { half: 0.5, quarter: 0.25, one: 1, two: 2, three: 3, four: 4, five: 5 }[(UI.foodQuery || "").trim().split(" ")[0].toLowerCase()];
    return w ?? 1;
  }

  function addFood(food, qty) {
    qty = qty ?? qtyFromInput();
    const r = getDay(UI.dateKey, true);
    r.foods = r.foods || [];
    r.foods.push({ name: food.n, qty, unit: food.u, cal: food.c * qty, p: food.p * qty, unitCal: food.c, unitP: food.p, meal: UI.addingMeal || defaultMeal() });
    setDay(UI.dateKey, { foods: r.foods });
    UI.foodQuery = "";
    render();
    toast(`Added ${qty} × ${food.n} · ${Math.round(food.c * qty)} kcal, ${Math.round(food.p * qty * 10) / 10}g protein`);
  }

  // Log an item with calories/protein typed by hand (no database lookup).
  function addCustomFood() {
    const calEl = document.getElementById("customCal");
    const proEl = document.getElementById("customPro");
    const nmEl = document.getElementById("customName");
    if (!calEl) return;
    const cal = parseFloat(calEl.value);
    const pro = parseFloat(proEl.value) || 0;
    const nm = (nmEl.value || "").trim();
    if (isNaN(cal) && !pro) { toast("Enter calories or protein"); return; }
    const c = isNaN(cal) ? 0 : cal;
    const r = getDay(UI.dateKey, true);
    r.foods = r.foods || [];
    r.foods.push({ name: nm || "Custom item", qty: 1, unit: "serving", cal: c, p: pro, unitCal: c, unitP: pro, meal: UI.addingMeal || defaultMeal() });
    setDay(UI.dateKey, { foods: r.foods });
    if (nm) FoodDB.saveCustomFood({ name: nm, cal: c, p: pro, unit: "serving" }); // remember for next time
    render();
    toast(`Added ${nm || "custom item"}`);
  }

  function commitFood() {
    const text = (UI.foodQuery || "").trim();
    if (!text) return;
    // support comma / "and" separated multi-entry
    const parts = text.split(/,|\band\b|\+/i).map((s) => s.trim()).filter(Boolean);
    let added = 0, failed = [];
    for (const p of parts) {
      const hit = FoodDB.parseFoodEntry(p);
      if (hit) {
        const r = getDay(UI.dateKey, true);
        r.foods = r.foods || [];
        r.foods.push({ name: hit.food.n, qty: hit.qty, unit: hit.food.u, cal: hit.food.c * hit.qty, p: hit.food.p * hit.qty, unitCal: hit.food.c, unitP: hit.food.p, meal: UI.addingMeal || defaultMeal() });
        setDay(UI.dateKey, { foods: r.foods });
        added++;
      } else failed.push(p);
    }
    if (failed.length) {
      for (const p of failed) {
        const cal = parseFloat(prompt(`"${p}" isn't in the food database.\nEnter estimated calories:`) || "");
        if (isNaN(cal)) continue;
        const pro = parseFloat(prompt(`Protein (g) for "${p}":`) || "0") || 0;
        const r = getDay(UI.dateKey, true);
        r.foods = r.foods || [];
        r.foods.push({ name: p, qty: 1, unit: "serving", cal, p: pro, unitCal: cal, unitP: pro, meal: UI.addingMeal || defaultMeal() });
        setDay(UI.dateKey, { foods: r.foods });
        FoodDB.saveCustomFood({ name: p, cal, p: pro, unit: "serving" }); // remember for next time
        added++;
      }
    }
    UI.foodQuery = "";
    render();
    if (added) toast(`Logged ${added} item${added > 1 ? "s" : ""}`);
  }

  // --------------------------------------------------------------- EVENTS ---
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act],[data-tab]");
    if (!el) {
      const sb = document.getElementById("foodSuggest");
      if (sb && !e.target.closest(".food-box")) sb.style.display = "none";
      return;
    }
    if (el.dataset.tab) { UI.tab = el.dataset.tab; render(); return; }
    const [act, arg, arg2] = el.dataset.act.split(":");
    const r = day();

    switch (act) {
      case "date":
        if (arg === "today") UI.dateKey = fmtKey(today());
        else if (arg !== "set") {
          const nd = fmtKey(addDays(selDate(), Number(arg)));
          if (nd >= PLAN_START) UI.dateKey = nd; // floored at 14 Jun; free to move forward
        }
        render(); break;
      case "wake": if (arg === "yes" || arg === "no") patchDay({ wake: arg === "yes" ? (r.wake === true ? null : true) : (r.wake === false ? null : false) }); break;
      case "office": patchDay({ office: r.office === arg ? null : arg }); break;
      case "gym":
        if (arg === "class") patchDay({ gymClass: !r.gymClass, gymType: r.gymClass ? null : r.gymType });
        else if (arg === "steps") patchDay({ steps10k: !r.steps10k });
        break;
      case "meal":
        if (arg === "add") { UI.addingMeal = arg2; UI.foodQuery = ""; render(); }
        else if (arg === "closeadd") { UI.addingMeal = null; UI.foodQuery = ""; render(); }
        break;
      case "vit": patchDay({ [arg]: !r[arg] }); break;
      case "aeon": patchDay({ aeon: !r.aeon }); break;
      case "dilr": patchDay({ dilr: Math.max(0, (r.dilr || 0) + Number(arg)) }); break;
      case "dilrAtt": patchDay({ dilrAtt: Math.max(0, (r.dilrAtt || 0) + Number(arg)) }); break;
      case "dilrSol": patchDay({ dilrSol: Math.max(0, (r.dilrSol || 0) + Number(arg)) }); break;
      case "rc": patchDay({ rc: Math.max(0, (r.rc || 0) + Number(arg)) }); break;
      case "va": patchDay({ va: Math.max(0, (r.va || 0) + Number(arg)) }); break;
      case "tgt": {
        // each tile is a yes/no toggle for TODAY only — tap to mark done, tap again to undo. never overshoots.
        if (arg === "lr" || arg === "di" || arg === "varc") {
          const p = arg === "varc" ? varcPlan(UI.dateKey) : dilrPlan(UI.dateKey);
          const part = arg === "varc" ? p : (p && p[arg]);
          const nm = arg.toUpperCase();
          if (!part || !part.current) { toast(nm + " all done 🎉"); break; }
          const id = part.current.ch.id;
          const qa = { ...(r.qa || {}) };
          if ((qa[id] || 0) >= part.target) { delete qa[id]; patchDay({ qa }); toast(nm + " un-ticked for today"); }
          else { qa[id] = part.target; patchDay({ qa }); toast(`${nm} done ✓ — ${part.current.ch.name}`); celebrate(); }
        } else if (PLAN_SUBJECTS.includes(arg)) {
          const p = planFor(arg, UI.dateKey);
          if (!p) { toast("Load the plan in the Study tab first"); break; }
          if (p.done) { toast(SUB_META[arg].name + " all done 🎉"); break; }
          const chs = S.chapters.filter((c) => (c.subject || "qa") === arg);
          const qa = { ...(r.qa || {}) };
          const doneToday = chs.reduce((a, c) => a + (qa[c.id] || 0), 0);
          const target = arg === "qa" ? (qaBreakdown(UI.dateKey)?.goal || p.dailyTarget) : 1;
          if (doneToday >= target) {
            chs.forEach((c) => { delete qa[c.id]; });            // untick: clear today's logs for this subject
            patchDay({ qa }); toast(SUB_META[arg].name + " un-ticked for today");
          } else {
            let need = target - doneToday;                        // tick: log up to target, flowing across topics
            for (const x of p.order) { if (need <= 0) break; const add = Math.min(need, x.st.remaining); if (add > 0) { qa[x.ch.id] = (qa[x.ch.id] || 0) + add; need -= add; } }
            patchDay({ qa }); toast(`${SUB_META[arg].name} done for today ✓`); celebrate();
          }
        } else if (arg === "read") { const on = (r.readMin || 0) >= 20; patchDay({ readMin: on ? 0 : 20 }); if (!on) celebrate(); }
        break;
      }
      case "mstep": {
        // +/- quantity stepper on a study tile: log multiple sets/sessions quickly.
        const sub = arg, dir = arg2;
        const step = (sub === "lr" || sub === "di") ? SET_Q : 1;   // LR/DI step by a full set (4 Qs), others by 1
        const inp = document.querySelector(`[data-act="mlog:${sub}"]`);
        const cur = inp ? (parseInt(inp.value, 10) || 0) : 0;
        const next = Math.max(0, cur + (dir === "up" ? step : -step));
        const completed = manualLog(sub, next);
        if (dir === "up" && completed && STUDY_TGT.has(sub)) celebrate();
        break;
      }
      case "mock":
        if (arg === "add") {
          const name = (document.getElementById("mkName").value || "").trim();
          const score = parseFloat(document.getElementById("mkScore").value);
          const pct = parseFloat(document.getElementById("mkPct").value);
          const note = (document.getElementById("mkNote").value || "").trim();
          if (!name && isNaN(score)) { toast("Add a mock name or score"); break; }
          S.mocks = S.mocks || [];
          S.mocks.push({ id: "mk" + Math.random().toString(36).slice(2, 8), date: fmtKey(today()), name: name || "Mock", score: isNaN(score) ? null : score, percentile: isNaN(pct) ? null : pct, note });
          saveState(); render(); toast("Mock logged");
        } else if (arg === "del") {
          S.mocks = (S.mocks || []).filter((m) => m.id !== arg2); saveState(); render();
        }
        break;
      case "qa":
        if (arg === "log") {
          const sel = document.getElementById("qaChapter"), cnt = document.getElementById("qaCount");
          const n = parseInt(cnt.value, 10);
          if (!sel.value || !n || n < 1) { toast("Pick a chapter and enter a question count"); break; }
          const qa = { ...(r.qa || {}) }; qa[sel.value] = (qa[sel.value] || 0) + n;
          patchDay({ qa });
          toast(`Logged ${n} questions`);
        } else if (arg === "undo") {
          const qa = { ...(r.qa || {}) }; delete qa[arg2]; patchDay({ qa });
        } else if (arg === "today") {
          const plan = planFor(arg2 || "qa", UI.dateKey);
          if (!plan || plan.done) { toast("That subject is all done 🎉"); break; }
          const left = Math.max(0, plan.dailyTarget - plan.doneToday);
          const add = Math.min(left > 0 ? left : plan.dailyTarget, plan.current.st.remaining);
          if (add <= 0) { toast("Nothing left on the current item"); break; }
          const id = plan.current.ch.id;
          const qa = { ...(r.qa || {}) }; qa[id] = (qa[id] || 0) + add;
          patchDay({ qa });
          toast(`+${add} ${SUB_META[arg2 || "qa"].unit} on ${plan.current.ch.name}`);
        }
        break;
      case "food":
        if (arg === "add") commitFood();
        else if (arg === "custom") addCustomFood();
        else if (arg === "del") { const foods = r.foods.slice(); foods.splice(Number(arg2), 1); patchDay({ foods }); }
        else if (arg === "recent") {
          const t = (UI._recent || [])[Number(arg2)];
          if (t) {
            const uc = t.unitCal ?? t.cal / t.qty, up = t.unitP ?? t.p / t.qty;
            const foods = (r.foods || []).slice();
            foods.push({ name: t.name, qty: 1, unit: t.unit, cal: uc, p: up, unitCal: uc, unitP: up, meal: UI.addingMeal || defaultMeal() });
            patchDay({ foods });
            toast(`Added ${t.name}`);
          }
        }
        break;
      case "diet":
        if (arg === "targets") {
          const c = parseInt(prompt("Daily calorie target:", S.settings.calTarget) || "", 10);
          const p = parseInt(prompt("Daily protein target (g):", S.settings.proteinTarget) || "", 10);
          if (c) S.settings.calTarget = c;
          if (p) S.settings.proteinTarget = p;
          saveState(); render();
        }
        break;
      case "ch":
        if (arg === "add") {
          const name = document.getElementById("chName").value.trim();
          const total = parseInt(document.getElementById("chTotal").value, 10);
          const done = parseInt(document.getElementById("chDone").value, 10) || 0;
          const target = document.getElementById("chTarget").value || null;
          const subEl = document.getElementById("chSubject");
          const subject = subEl ? subEl.value : "qa";
          if (!name || !total) { toast("Item needs a name and total"); break; }
          const ord = S.chapters.filter((c) => (c.subject || "qa") === subject).length;
          S.chapters.push({ id: "ch" + Math.random().toString(36).slice(2, 8), name, total, startDone: done, target, subject, unit: SUB_META[subject].unit, ord });
          saveState(); render(); toast(`Added ${name}`);
        } else if (arg === "seed") {
          const { added, updated } = applyPlan(true);
          saveState(); render();
          toast(added ? `Added ${added} items${updated ? `, updated ${updated}` : ""} across 4 subjects` : `Refreshed ${updated} syllabus items`);
        } else if (arg === "fresh") {
          if (!confirm("Start fresh?\n\nThis clears ALL daily logs, mocks, and chapter progress, keeping only the 4 completed QA chapters (Averages, Percentages, RPV, Alligations) marked done.\n\nA backup downloads first. Continue?")) break;
          downloadExport();
          S.days = {}; S.mocks = []; S.chapters = [];
          const mk = (name, total, startDone, target, subject, ord) => S.chapters.push({ id: "ch" + Math.random().toString(36).slice(2, 8), name, total, startDone, target, subject, unit: SUB_META[subject].unit, ord });
          ARUN_QA.forEach((it, i) => { const o = QA_ORDER.indexOf(it.name); mk(it.name, it.total, ARUN_DONE.includes(it.name) ? it.total : 0, it.target, "qa", o === -1 ? 100 + i : o); });
          DILR_ITEMS.forEach((it, i) => mk(it.name, it.total, 0, AUG, "dilr", i));
          VARC_ITEMS.forEach((it, i) => mk(it.name, it.total, 0, AUG, "varc", i));
          VOCAB_ITEMS.forEach((it, i) => mk(it.name, it.total, 0, VOCAB_END, "vocab", i));
          saveState(); render(); toast("Fresh start: 4 chapters done, everything else cleared");
        } else if (arg === "del") {
          const ch = S.chapters.find((c) => c.id === arg2);
          if (ch && confirm(`Delete chapter "${ch.name}"? Its logged questions stay in daily history but stop counting.`)) {
            S.chapters = S.chapters.filter((c) => c.id !== arg2); saveState(); render();
          }
        } else if (arg === "defer") {
          const ch = S.chapters.find((c) => c.id === arg2); if (!ch) break;
          if (ch.skip) { ch.skip = 0; saveState(); render(); toast(`${ch.name}: deferred questions restored`); break; }
          const rem = Score.chapterStats(ch).remaining;
          const n = parseInt(prompt(`Skip how many questions of "${ch.name}" for now? You can restore them anytime.`, String(Math.min(15, rem))) || "", 10);
          if (!n || n < 1) break;
          ch.skip = Math.min(n, rem); saveState(); render(); toast(`${ch.name}: ${ch.skip} skipped for later`);
        } else if (arg === "edit") {
          const ch = S.chapters.find((c) => c.id === arg2); if (!ch) break;
          const name = prompt("Chapter name:", ch.name); if (name === null) break;
          const total = parseInt(prompt("Total questions:", ch.total) || "", 10);
          const startDone = parseInt(prompt("Questions already done before tracking:", ch.startDone || 0) || "", 10);
          const target = prompt("Target date (YYYY-MM-DD, blank for none):", ch.target || "");
          if (name.trim()) ch.name = name.trim();
          if (total) ch.total = total;
          if (!isNaN(startDone)) ch.startDone = startDone;
          ch.target = (target || "").match(/^\d{4}-\d{2}-\d{2}$/) ? target : null;
          saveState(); render();
        }
        break;
      case "rmode": UI.reportMode = arg; render(); break;
      case "week": UI.weekOffset = Math.max(0, UI.weekOffset - Number(arg)); render(); break;
      case "month": UI.monthOffset = Math.max(0, UI.monthOffset - Number(arg)); render(); break;
      case "export": downloadExport(); toast("Exported backup JSON"); break;
      case "import": document.getElementById("importFile").click(); break;
      case "backup":
        if (!Backup.supported) { toast("Live file backup needs Chrome or Edge. Export still works."); break; }
        if (Backup.state() === "off") Backup.link().then(() => toast("Backup file linked. Every change now writes to it.")).catch(() => {});
        else if (Backup.state() === "locked") Backup.unlock().then(() => toast(Backup.state() === "on" ? "Backup unlocked" : "Permission not granted"));
        else { Backup.write(true); toast("Backup written to your file"); }
        break;
      case "reset": {
        const phrase = prompt("This wipes the tracker data in THIS browser.\nA JSON export will download first, and your linked backup file and snapshots are NOT touched.\n\nType DELETE to confirm:");
        if (phrase !== "DELETE") { toast("Reset cancelled"); break; }
        downloadExport();
        resetState(); render(); toast("Tracker reset. Export downloaded as a safety copy.");
        break;
      }
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.matches('input[type=date][data-act="date:set"]') && el.value) {
      let v = el.value;
      if (v < PLAN_START) v = PLAN_START; // floor at 14 Jun; forward open
      UI.dateKey = v; render();
    }
    if (el.matches('[data-act="wake:time"]')) { setDay(UI.dateKey, { wakeTime: el.value || null }); }
    if (el.matches('[data-act="journal"]')) { setDay(UI.dateKey, { journal: el.value }); }
    if (el.matches('[data-act="gym:cal"]')) setDay(UI.dateKey, { gymCal: parseInt(el.value, 10) || null });
    if (el.matches('[data-act="gym:type"]')) { setDay(UI.dateKey, { gymType: el.value || null }); render(); }
    if (el.matches('[data-act^="food:qty:"]')) {
      const i = Number(el.dataset.act.split(":")[2]);
      const foods = (day().foods || []).slice();
      const f = foods[i];
      if (f) {
        const q = Math.max(0.1, parseFloat(el.value) || f.qty);
        const uc = f.unitCal ?? f.cal / f.qty, up = f.unitP ?? f.p / f.qty;
        foods[i] = { ...f, qty: q, cal: uc * q, p: up * q, unitCal: uc, unitP: up };
        setDay(UI.dateKey, { foods });
        render();
      }
    }
    if (el.matches('[data-act^="mlog:"]')) {
      // Manual exact-count log for any target tile (QA, LR, DI, VARC, Vocab, Reading).
      const sub = el.dataset.act.split(":")[1];
      if (sub === "edit") return;
      const completed = manualLog(sub, el.value);
      if (completed && STUDY_TGT.has(sub)) celebrate();
    }
    if (el.matches('[data-act="vocab:pages"]')) { setDay(UI.dateKey, { vocabPages: Math.max(0, parseInt(el.value, 10) || 0) }); render(); }
    if (el.matches('[data-act="read:min"]')) { setDay(UI.dateKey, { readMin: Math.max(0, parseInt(el.value, 10) || 0) }); render(); }
    if (el.matches('[data-act="study:hours"]')) { setDay(UI.dateKey, { hours: Math.max(0, parseFloat(el.value) || 0) }); render(); }
    if (el.id === "importFile" && el.files[0]) {
      const fr = new FileReader();
      fr.onload = () => {
        try {
          const data = JSON.parse(fr.result);
          if (!data.days || !data.settings) throw new Error("not a tracker backup");
          window.S = data; saveState(); render(); toast("Backup imported");
        } catch (err) { toast("Import failed: " + err.message); }
      };
      fr.readAsText(el.files[0]); el.value = "";
    }
  });

  // If the main store is empty but a rolling snapshot survives (e.g. after an
  // accidental Reset or cleared site data), offer to bring it back once.
  (function offerRestore() {
    if (Object.keys(S.days).length || S.chapters.length) return;
    if (!window.Backup) return;
    const snap = Backup.latestSnapshot();
    if (!snap || sessionStorage.getItem("t6-restore-declined")) return;
    if (confirm(`Found a saved snapshot from ${snap.date}. Restore it?`)) {
      window.S = Object.assign({}, S, snap.data);
      saveState();
      toast("Snapshot restored");
    } else sessionStorage.setItem("t6-restore-declined", "1");
  })();

  // One-time ease: collapse the old June/July QA crunch into a single even 31-Aug pace.
  (function easeQADeadlines() {
    let changed = false;
    for (const c of S.chapters) {
      if ((c.subject || "qa") === "qa" && (c.target === "2026-06-30" || c.target === "2026-07-31")) { c.target = "2026-08-31"; changed = true; }
    }
    if (changed) saveState();
  })();
  ensurePlan(); // auto-fill any missing DILR/VARC/Vocab/QA plan items so tiles always have tasks
  render();
})();
