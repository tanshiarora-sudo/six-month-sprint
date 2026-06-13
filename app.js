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
  const JUN = "2026-06-30", JUL = "2026-07-31";
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
    "Profit, Loss and Discount", "Simple and Compound Interest", "Time and Work",
    "Time, Speed and Distance", "Applications of Time, Speed and Distance",
    "Number Systems", "Progressions and Series", "Geometry and Mensuration",
    "Coordinate Geometry", "Functions", "Inequalities", "Quadratic and Other Equations",
    "Logarithms", "Permutations and Combinations", "Probability", "Set Theory",
  ];

  // ---- Full study plan: all four subjects, everything by 31 Aug ----
  const AUG = "2026-08-31", VOCAB_END = "2026-08-03";
  const SUB_META = {
    qa:    { name: "QA",    color: "var(--indigo)", soft: "var(--indigo-soft)", unit: "Qs" },
    dilr:  { name: "DILR",  color: "var(--orange)", soft: "var(--orange-soft)", unit: "sets" },
    varc:  { name: "VARC",  color: "var(--pink)",   soft: "var(--pink-soft)",   unit: "ex" },
    vocab: { name: "Vocab", color: "var(--teal)",   soft: "var(--teal-soft)",   unit: "sessions" },
  };
  // DILR (Sharma LR + DI), tracked in practice sets · counts are estimates, editable.
  const DILR_ITEMS = [
    { name: "LR: Arrangements", total: 14 }, { name: "LR: Rankings", total: 8 },
    { name: "LR: Team Formations", total: 8 }, { name: "LR: Quantitative Reasoning", total: 8 },
    { name: "LR: Routes & Networks", total: 6 }, { name: "LR: Set Theory & Venn", total: 8 },
    { name: "LR: Cubes & Dice", total: 6 }, { name: "LR: Games & Tournaments", total: 8 },
    { name: "LR: Binary Logic", total: 6 }, { name: "LR: Syllogisms", total: 10 },
    { name: "LR: Logical Deduction", total: 8 }, { name: "DI: Traditional DI", total: 16 },
    { name: "DI: Logical DI", total: 14 }, { name: "DI: Twelve-Minute Tests", total: 12 },
  ];
  // VARC (RC book + Verbal Ability book), tracked in exercises/passages · estimates, editable.
  const VARC_ITEMS = [
    { name: "VA: Word Lists I/II/III", total: 30 }, { name: "VA: Roots, Prefixes & Suffixes", total: 20 },
    { name: "VA: Synonyms / Antonyms / Odd One", total: 24 }, { name: "VA: Analogies", total: 12 },
    { name: "VA: Fill in the Blanks", total: 15 }, { name: "VA: Sentence Completion", total: 15 },
    { name: "VA: Para Jumbles", total: 30 }, { name: "VA: Sentence Correction", total: 25 },
    { name: "VA: Para Completion / Last Sentence", total: 20 }, { name: "VA: Irrelevant Statement", total: 15 },
    { name: "VA: Summary Questions", total: 15 }, { name: "RC: Reading Skills modules", total: 8 },
    { name: "RC: Critical Reasoning", total: 20 }, { name: "RC: LOD Practice Passages", total: 40 },
  ];
  const VOCAB_ITEMS = [{ name: "Word Power Made Easy (sessions)", total: 50 }];
  const SUBJECTS = ["qa", "dilr", "varc", "vocab"];
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
    // add today's logs back so the target stays fixed for the day instead of shrinking as you log
    const dailyTarget = Math.max(1, Math.ceil((batchRemaining + doneToday) / daysLeft));
    return { subject, order, current, batch, batchRemaining, daysLeft, dailyTarget, doneToday };
  }
  const qaPlan = (dateKey) => planFor("qa", dateKey);
  const selDate = () => parseKey(UI.dateKey);
  const day = () => getDay(UI.dateKey, false);
  const patchDay = (p) => { setDay(UI.dateKey, p); render(); };
  const pill = (p) => `<span class="pill ${p >= 75 ? "good" : p >= 45 ? "mid" : "low"}">${Math.round(p)}%</span>`;
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
      <button class="navbtn" data-act="date:-1">‹</button>
      <span class="when">${fmtNice(d)}</span>
      <button class="navbtn" data-act="date:1">›</button>
      <input type="date" value="${UI.dateKey}" data-act="date:set">
      <span class="chip ${working ? "work" : "off"}">${working ? "Working day" : "Off day"}</span>
      ${isToday ? "" : `<span class="chip today-link" data-act="date:today">Jump to today</span>`}
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

    <div class="grid cols-3 mt16">
      <div class="card tint-teal">
        <h3><span class="dot" style="background:var(--teal)"></span> Wake Up</h3>
        <p class="sub">Goal: 7 successful days a week</p>
        <div class="seg">
          <button class="${r.wake === true ? "on yes" : ""}" data-act="wake:yes">Woke up ✓</button>
          <button class="${r.wake === false ? "on no" : ""}" data-act="wake:no">Missed</button>
        </div>
        <div class="row mt12"><span class="hint">This week</span><b>${ww.yes}/7 days · ${Math.round(ww.score)}%</b></div>
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
        <div class="row"><span class="hint">This week</span><b>${gw.classes}/4 classes${gw.stepDays ? ` +${gw.stepDays} step day${gw.stepDays > 1 ? "s" : ""}` : ""} · ${Math.round(gw.score)}%</b></div>
      </div>

      <div class="card tint-pink">
        <h3><span class="dot" style="background:var(--pink)"></span> Vitamins</h3>
        <p class="sub">Iron & B12 daily · Vitamin D weekly</p>
        <div class="row"><span class="lbl">Iron</span><button class="check ${r.iron ? "on" : ""}" data-act="vit:iron">✓</button></div>
        <div class="row"><span class="lbl">B12</span><button class="check ${r.b12 ? "on" : ""}" data-act="vit:b12">✓</button></div>
        <div class="row"><span class="lbl">Vitamin D <span class="hint">${vw.vitd ? "done this week" : "due this week"}</span></span><button class="check ${r.vitd ? "on" : ""}" data-act="vit:vitd">✓</button></div>
        <div class="row"><span class="hint">Week doses</span><b>${vw.done}/15 · ${Math.round(vw.score)}%</b></div>
      </div>

      <div class="card span-3 tint-green">
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
            ${recentChips()}` : `<div class="addfood-row"><button class="addfood" data-act="meal:add:${m.id}">+ Add Food</button></div>`}
          </div>`;
        }).join("")}
      </div>

      <div class="card tint-indigo span-2">
        <h3><span class="dot" style="background:var(--indigo)"></span> Today's Study Plan</h3>
        <p class="sub">One item per subject, in order. All books finish by 31 Aug (vocab ~3 Aug). Each target rebalances daily as you log.</p>
        ${(() => {
          if (!S.chapters.length) return `<div class="small muted">Build your plan in the Study tab (click "Load full study plan").</div>`;
          const rows = SUBJECTS.map((s) => ({ s, plan: planFor(s, UI.dateKey) })).filter((x) => x.plan);
          if (!rows.length) return `<div class="small muted">Build your plan in the Study tab (click "Load full study plan").</div>`;
          return `<div class="splan">${rows.map(({ s, plan }) => {
            const m = SUB_META[s];
            if (plan.done) return `<div class="splan-row done"><span class="sp-tag" style="background:${m.soft};color:${m.color}">${m.name}</span><span class="sp-item">all done ✓</span></div>`;
            const cur = plan.current, hit = plan.doneToday >= plan.dailyTarget, left = Math.max(0, plan.dailyTarget - plan.doneToday);
            return `<div class="splan-row ${hit ? "hit" : ""}">
              <span class="sp-tag" style="background:${m.soft};color:${m.color}">${m.name}</span>
              <span class="sp-item"><b>${esc(cur.ch.name)}</b><span class="sp-meta">${cur.st.done}/${cur.ch.total} ${m.unit} · ${cur.st.remaining} left · ${plan.daysLeft}d</span></span>
              <span class="sp-prog">${plan.doneToday}<span class="sp-slash">/${plan.dailyTarget}</span><span class="sp-sub"> today</span></span>
              <button class="sp-btn ${hit ? "hit" : ""}" data-act="qa:today:${s}" title="${hit ? "Target hit, log more" : "Log today's target"}">${hit ? "✓" : "+" + left}</button>
            </div>`;
          }).join("")}</div>
          <div class="field-row mt12">
            <span class="hint">Custom log:</span>
            <select class="input" id="qaChapter" style="flex:1">${SUBJECTS.map((s) => {
              const items = S.chapters.filter((c) => (c.subject || "qa") === s);
              return items.length ? `<optgroup label="${SUB_META[s].name}">${items.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</optgroup>` : "";
            }).join("")}</select>
            <input class="input sm" type="number" min="1" id="qaCount" placeholder="count">
            <button class="btn primary" data-act="qa:log">Log</button>
          </div>
          ${todaysQA.length ? `<div class="mt8 small muted">Logged today: ${todaysQA.map(([id, n]) => {
            const ch = S.chapters.find((c) => c.id === id);
            return `${ch ? esc(ch.name) : "Item"} +${n} <button class="iconbtn" data-act="qa:undo:${id}">undo</button>`;
          }).join(" · ")}</div>` : ""}`;
        })()}
      </div>

      <div class="card tint-purple">
        <h3><span class="dot" style="background:var(--purple)"></span> Study Log</h3>
        <p class="sub">DILR sets, RCs, Aeon essay or Norman Lewis vocab (same weightage)</p>
        <div class="row"><span class="lbl">DILR sets today</span>
          <span class="stepper"><button data-act="dilr:-1">−</button><span class="val">${r.dilr}</span><button data-act="dilr:1">+</button></span></div>
        <div class="row"><span class="lbl">RCs today</span>
          <span class="stepper"><button data-act="rc:-1">−</button><span class="val">${r.rc}</span><button data-act="rc:1">+</button></span></div>
        <div class="row"><span class="lbl">Aeon essay read</span><button class="check ${r.aeon ? "on" : ""}" data-act="aeon">✓</button></div>
        <div class="row"><span class="lbl">Norman Lewis pages</span><input class="input sm" type="number" min="0" value="${r.vocabPages || ""}" placeholder="pages" data-act="vocab:pages"></div>
        <div class="row"><span class="hint">Week: DILR ${dw.sets}/12 · RC ${rw.rcs}/10 · Aeon/Vocab ${aw.essays}/7${aw.pages ? ` · ${aw.pages} pages` : ""}</span></div>
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
      ${SUBJECTS.map((s) => { const m = SUB_META[s]; const p = subPct(s);
        return `<div class="card" style="background:linear-gradient(180deg,${m.soft},#fff 72%)"><div class="ringbox">${C.ring(p ?? 0, { size: 104, color: m.color, label: `${m.name} book`, sub: "complete" })}</div></div>`;
      }).join("")}
    </div>

    <div class="card mt16">
      <h3>Full Syllabus <span class="muted small">all books by 31 Aug · daily plan drives the Today tab</span></h3>
      <p class="sub">Per-item completion, remaining units and the pace to hit each deadline. Counts for DILR/VARC are estimates, edit any row.</p>
      <div class="field-row">
        <input class="input" id="chName" placeholder="Item name" style="flex:2">
        <select class="input sm" id="chSubject" style="width:90px">${SUBJECTS.map((s) => `<option value="${s}">${SUB_META[s].name}</option>`).join("")}</select>
        <input class="input sm" id="chTotal" type="number" min="1" placeholder="Total">
        <input class="input sm" id="chDone" type="number" min="0" placeholder="Done">
        <input class="input" id="chTarget" type="date" style="width:150px">
        <button class="btn primary" data-act="ch:add">+ Add</button>
      </div>
      <div class="mt8"><button class="btn primary" data-act="ch:seed">📚 Load full study plan</button>
        <span class="small muted">QA + DILR + VARC + Vocab with counts &amp; deadlines · keeps your progress · re-click to refresh</span></div>
      ${SUBJECTS.map((s) => {
        const items = S.chapters.filter((c) => (c.subject || "qa") === s).sort((a, b) => (a.ord ?? 99) - (b.ord ?? 99));
        if (!items.length) return "";
        const m = SUB_META[s];
        return `<div class="mt16"><h4 style="margin:0 0 4px;display:flex;align-items:center;gap:8px"><span class="dot" style="background:${m.color}"></span>${m.name} <span class="muted small">${items.length} items · ${subPct(s)}% done</span></h4>
        <table class="tbl"><thead><tr><th>Item</th><th>Progress</th><th>%</th><th>Left</th><th>Pace/day</th><th>Target</th><th></th></tr></thead><tbody>
          ${items.map((ch) => { const st = Score.chapterStats(ch);
            return `<tr>
              <td><b>${esc(ch.name)}</b></td>
              <td style="min-width:130px"><span class="num">${st.done}/${ch.total}</span>${C.bar(st.pct, m.color)}</td>
              <td>${pill(st.pct)}</td>
              <td class="num">${st.remaining}</td>
              <td class="num">${st.pace == null ? "–" : st.pace + " " + (ch.unit || "Qs")}</td>
              <td class="num">${ch.target ? fmtShort(parseKey(ch.target)) : "–"}</td>
              <td><button class="iconbtn" data-act="ch:edit:${ch.id}">Edit</button><button class="iconbtn" data-act="ch:del:${ch.id}">Delete</button></td>
            </tr>`;
          }).join("")}
        </tbody></table></div>`;
      }).join("") || `<div class="empty">No items yet. Click "Load full study plan" above.</div>`}
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
          <div class="statline"><span>Gym classes${w.gym.types.length ? ` (${w.gym.types.join(", ")})` : ""}</span><b>${w.gym.classes}/4${w.gym.stepDays ? ` (+${w.gym.stepDays} step days)` : ""} · ${Math.round(w.gym.score)}%</b></div>
          <div class="statline"><span>Diet (days logged: ${w.diet.days})</span><b>${w.diet.score == null ? "no logs" : w.diet.score + "%"}</b></div>
          <div class="statline"><span>Wake-ups</span><b>${w.wake.yes}/7 · ${Math.round(w.wake.score)}%</b></div>
          <div class="statline"><span>Office (full month)</span><b>${w.office.attended}/${w.office.expected} · ${w.office.score == null ? "–" : Math.round(w.office.score) + "%"}</b></div>
          <div class="statline"><span>Vitamins</span><b>${w.vit.done}/15 · ${Math.round(w.vit.score)}%</b></div>
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
      box.style.display = matches.length ? "block" : "none";
      box.innerHTML = matches.map((f, i) =>
        `<button data-food="${i}"><span>${FoodDB.emojiFor(f.n)} ${esc(f.n)}</span><span class="macro">${f.c} kcal · ${f.p}g / ${esc(f.u)}</span></button>`).join("");
      box.querySelectorAll("button").forEach((b, i) => b.onclick = () => addFood(matches[i]));
    };
    inp.addEventListener("input", update);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") commitFood(); });
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
        else if (arg !== "set") UI.dateKey = fmtKey(addDays(selDate(), Number(arg)));
        render(); break;
      case "wake": patchDay({ wake: arg === "yes" ? (r.wake === true ? null : true) : (r.wake === false ? null : false) }); break;
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
      case "rc": patchDay({ rc: Math.max(0, (r.rc || 0) + Number(arg)) }); break;
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
          // build the unified syllabus: subject, unit, order, target per item
          const plan = [];
          ARUN_QA.forEach((it, i) => { const o = QA_ORDER.indexOf(it.name); plan.push({ ...it, subject: "qa", unit: SUB_META.qa.unit, ord: o === -1 ? 100 + i : o, done: ARUN_DONE.includes(it.name) }); });
          DILR_ITEMS.forEach((it, i) => plan.push({ ...it, subject: "dilr", unit: SUB_META.dilr.unit, ord: i, target: AUG, done: false }));
          VARC_ITEMS.forEach((it, i) => plan.push({ ...it, subject: "varc", unit: SUB_META.varc.unit, ord: i, target: AUG, done: false }));
          VOCAB_ITEMS.forEach((it, i) => plan.push({ ...it, subject: "vocab", unit: SUB_META.vocab.unit, ord: i, target: VOCAB_END, done: false }));
          const byName = {};
          S.chapters.forEach((c) => { byName[c.name.toLowerCase()] = c; });
          let added = 0, updated = 0;
          for (const it of plan) {
            const ex = byName[it.name.toLowerCase()];
            if (ex) {
              ex.total = it.total; ex.target = it.target; ex.subject = it.subject; ex.unit = it.unit; ex.ord = it.ord;
              if (it.done) ex.startDone = it.total;
              else if (ex.startDone > it.total) ex.startDone = it.total;
              updated++;
            } else {
              S.chapters.push({ id: "ch" + Math.random().toString(36).slice(2, 8), name: it.name, total: it.total, startDone: it.done ? it.total : 0, target: it.target, subject: it.subject, unit: it.unit, ord: it.ord });
              added++;
            }
          }
          saveState(); render();
          toast(added ? `Added ${added} items${updated ? `, updated ${updated}` : ""} across 4 subjects` : `Refreshed ${updated} syllabus items`);
        } else if (arg === "del") {
          const ch = S.chapters.find((c) => c.id === arg2);
          if (ch && confirm(`Delete chapter "${ch.name}"? Its logged questions stay in daily history but stop counting.`)) {
            S.chapters = S.chapters.filter((c) => c.id !== arg2); saveState(); render();
          }
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
    if (el.matches('input[type=date][data-act="date:set"]') && el.value) { UI.dateKey = el.value; render(); }
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
    if (el.matches('[data-act="vocab:pages"]')) { setDay(UI.dateKey, { vocabPages: Math.max(0, parseInt(el.value, 10) || 0) }); render(); }
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

  render();
})();
