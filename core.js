// State, persistence, date utilities and the full scoring engine.
(function () {
  const LS_KEY = "cat2026-tracker-v1";

  const DEFAULT_STATE = () => ({
    version: 1,
    settings: { calTarget: 1200, proteinTarget: 90 },
    chapters: [], // {id, name, total, startDone, target:"YYYY-MM-DD"}
    days: {}, // key -> day record
    mocks: [], // {id, date, name, score, percentile, note}
  });

  const DEFAULT_DAY = () => ({
    wake: null,            // true | false | null
    office: null,          // "office" | "wfh" | "absent" | null
    gymClass: false,
    gymType: null,         // which class: legs, arms-chest, ...
    gymCal: null,
    steps10k: false,
    iron: false, b12: false, vitd: false,
    foods: [],             // {name, qty, unit, cal, p, meal}
    qa: {},                // chapterId -> questions/sessions done that day (QA + Vocab items)
    dilrAtt: 0, dilrSol: 0, // DILR sets attempted / solved
    rc: 0, va: 0,          // RCs completed / Verbal Ability exercises
    readMin: 0,            // reading minutes (goal 20)
    hours: 0,              // study hours logged
    dilr: 0, aeon: false, vocabPages: 0, // legacy fields kept for back-compat
  });

  const PLAN_START = "2026-06-15"; // the tracker begins here; earlier day-logs are dropped
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const st = Object.assign(DEFAULT_STATE(), JSON.parse(raw));
        let purged = false;
        // calendar starts 15 Jun; drop anything logged before it
        for (const k of Object.keys(st.days)) { if (k < PLAN_START) { delete st.days[k]; purged = true; } }
        st._purged = purged;
        return st;
      }
    } catch (e) { console.warn("state load failed", e); }
    return DEFAULT_STATE();
  }
  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(S));
    if (window.Backup) { Backup.snapshot(); Backup.write(); }
  }

  window.S = load();
  window.PLAN_START = PLAN_START;
  if (S._purged) { delete S._purged; save(); } // persist the calendar-start cleanup once
  window.saveState = save;
  window.resetState = () => { window.S = DEFAULT_STATE(); save(); };
  window.getDay = (key, create) => {
    if (!S.days[key] && create) S.days[key] = DEFAULT_DAY();
    return S.days[key] ? Object.assign(DEFAULT_DAY(), S.days[key]) : DEFAULT_DAY();
  };
  window.setDay = (key, patch) => {
    S.days[key] = Object.assign(getDay(key, false), S.days[key] || {}, patch);
    save();
  };

  // ---- dates ---------------------------------------------------------------
  const pad = (n) => String(n).padStart(2, "0");
  const fmtKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const monday = (d) => addDays(d, -((d.getDay() + 6) % 7));
  const weekKeys = (d) => { const m = monday(d); return Array.from({ length: 7 }, (_, i) => fmtKey(addDays(m, i))); };
  const monthKeys = (d) => {
    const out = []; const y = d.getFullYear(), m = d.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 1; i <= days; i++) out.push(fmtKey(new Date(y, m, i)));
    return out;
  };
  const today = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
  const fmtNice = (d) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const fmtShort = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  // Office calendar: Sun off; 1st & 3rd Saturdays off; 2nd/4th/5th Saturdays working.
  function isWorkingDay(d) {
    const dow = d.getDay();
    if (dow === 0) return false;
    if (dow === 6) { const ord = Math.ceil(d.getDate() / 7); return ord === 2 || ord === 4 || ord === 5; }
    return true;
  }

  window.D = { pad, fmtKey, parseKey, addDays, monday, weekKeys, monthKeys, today, fmtNice, fmtShort, isWorkingDay };

  // ---- scoring -------------------------------------------------------------
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const rnd = (v) => Math.round(v);

  // Days of a week that belong to the plan (on/after the start). Full weeks = 7; a week that
  // straddles the start date counts only its in-plan days, so targets aren't unfairly inflated.
  function weekAvail(d) {
    return weekKeys(d).filter((k) => k >= PLAN_START).length;
  }

  // Wake score by the time you got up (out of 100 → the 10% category): earlier = more.
  // before 5:30 →100 · 5:30-6 →90 · 6-6:30 →80 · 6:30-7 →70 · 7-8 →50 · 8-9 →20 · 9+ →0
  function wakeTierScore(t) {
    if (!t) return 0;
    const [h, m] = String(t).split(":").map(Number);
    if (isNaN(h)) return 0;
    const mins = h * 60 + (m || 0);
    if (mins < 330) return 100;
    if (mins < 360) return 90;
    if (mins < 390) return 80;
    if (mins < 420) return 70;
    if (mins < 480) return 50;
    if (mins < 540) return 20;
    return 0;
  }
  // A day's wake score: missed → 0; time logged → tier; woke up without a time → full credit.
  function wakeDayScore(r) {
    if (!r || r.wake === false) return 0;
    if (r.wakeTime) return wakeTierScore(r.wakeTime);
    return r.wake === true ? 100 : 0;
  }
  function wakeWeek(d) {
    const keys = weekKeys(d).filter((k) => k >= PLAN_START);
    const target = Math.max(1, keys.length);
    const yes = keys.filter((k) => { const r = S.days[k]; return r && (r.wake === true || (r.wakeTime && r.wake !== false)); }).length;
    const sum = keys.reduce((a, k) => a + wakeDayScore(S.days[k]), 0);
    return { yes, target, score: clamp(sum / target) };
  }

  // Expected = working days in the month from the plan start onward (don't count days before tracking began).
  function officeMonth(d) {
    let expected = 0, attended = 0, wfh = 0, absent = 0;
    for (const k of monthKeys(d)) {
      if (k < PLAN_START) continue;
      const rec = S.days[k];
      if (rec && rec.office === "wfh") wfh++;
      if (!isWorkingDay(parseKey(k))) continue;
      expected++;
      if (rec && (rec.office === "office" || rec.office === "wfh")) attended++;
      if (rec && rec.office === "absent") absent++;
    }
    return { expected, attended, wfh, absent, score: expected ? clamp((attended / expected) * 100) : null };
  }

  function gymWeek(d) {
    let classes = 0, stepDays = 0, cal = 0; const types = [];
    for (const k of weekKeys(d)) {
      const r = S.days[k]; if (!r) continue;
      if (r.gymClass) { classes++; cal += r.gymCal || 0; if (r.gymType) types.push(r.gymType); }
      else if (r.steps10k) stepDays++;
    }
    const target = Math.max(1, Math.round((4 * weekAvail(d)) / 7)); // 4/week, prorated to days available
    return { classes, stepDays, cal, types, target, score: clamp(((classes + stepDays) / target) * 100) };
  }

  function vitaminsWeek(d) {
    let iron = 0, b12 = 0, vitd = 0;
    for (const k of weekKeys(d)) {
      const r = S.days[k]; if (!r) continue;
      if (r.iron) iron++; if (r.b12) b12++; if (r.vitd) vitd++;
    }
    const avail = weekAvail(d);
    const done = iron + b12 + Math.min(1, vitd);
    const required = avail * 2 + (avail > 0 ? 1 : 0); // Iron + B12 each available day, + 1 Vitamin D/week
    return { iron, b12, vitd: Math.min(1, vitd), done, required, score: required ? clamp((done / required) * 100) : 0 };
  }

  function proteinScore(g) { return g >= 90 ? 100 : g >= 80 ? 90 : g >= 70 ? 75 : g >= 60 ? 50 : 25; }
  function calorieScore(c) { return c <= 1300 ? 100 : c <= 1400 ? 90 : c <= 1500 ? 75 : c <= 1700 ? 50 : 25; }

  function dietDay(key) {
    const r = S.days[key];
    if (!r || !r.foods || !r.foods.length) return { cal: 0, protein: 0, score: null };
    let cal = 0, protein = 0;
    for (const f of r.foods) { cal += f.cal; protein += f.p; }
    return { cal: rnd(cal), protein: Math.round(protein * 10) / 10, score: rnd((proteinScore(protein) + calorieScore(cal)) / 2) };
  }

  function dietWeek(d) {
    const keys = weekKeys(d);
    const scores = keys.map(dietDay).filter((x) => x.score != null);
    if (!scores.length) return { days: 0, score: null };
    return { days: scores.length, score: rnd(scores.reduce((a, x) => a + x.score, 0) / scores.length) };
  }

  // ---- study ---------------------------------------------------------------
  function chapterDone(ch) {
    let done = ch.startDone || 0;
    for (const k in S.days) { const q = S.days[k].qa; if (q && q[ch.id]) done += q[ch.id]; }
    return Math.min(done, ch.total);
  }

  function chapterStats(ch) {
    const done = chapterDone(ch);
    const pct = ch.total ? clamp((done / ch.total) * 100) : 0;
    const remaining = Math.max(0, ch.total - done);
    let pace = null, daysLeft = null;
    if (ch.target) {
      daysLeft = Math.max(0, Math.round((parseKey(ch.target) - today()) / 86400000));
      pace = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : (remaining > 0 ? remaining : 0);
    }
    // expected completion from last-14-day pace
    let recent = 0;
    for (let i = 0; i < 14; i++) {
      const k = fmtKey(addDays(today(), -i));
      const r = S.days[k]; if (r && r.qa && r.qa[ch.id]) recent += r.qa[ch.id];
    }
    const avg = recent / 14;
    const expected = remaining === 0 ? "Done" : avg > 0 ? fmtShort(addDays(today(), Math.ceil(remaining / avg))) : null;
    return { done, pct, remaining, pace, daysLeft, expected };
  }

  // Only QA-subject chapters count toward the QA study score.
  function qaChapters() { return S.chapters.filter((c) => (c.subject || "qa") === "qa"); }
  function qaScore() {
    const qc = qaChapters();
    if (!qc.length) return null;
    const sum = qc.reduce((a, ch) => a + chapterStats(ch).pct, 0);
    return rnd(sum / qc.length);
  }

  function weekSum(d, field) {
    return weekKeys(d).reduce((a, k) => a + ((S.days[k] && S.days[k][field]) || 0), 0);
  }
  // DILR & VARC are topic plans now: units done = sum of per-item logs (day.qa[itemId]) for that subject.
  function daySubjectSum(key, subject) {
    const r = S.days[key]; if (!r || !r.qa) return 0;
    let s = 0; for (const c of S.chapters) if ((c.subject || "qa") === subject) s += r.qa[c.id] || 0;
    return s;
  }
  function weekSubjectSum(d, subject) { return weekKeys(d).reduce((a, k) => a + daySubjectSum(k, subject), 0); }
  function subjectTotalDone(subject) {
    let s = 0; for (const k in S.days) s += daySubjectSum(k, subject); return s;
  }
  // ~1 a day = 7/week target (light foundation habit).
  function dilrWeek(d) { const sets = weekSubjectSum(d, "dilr"); return { att: sets, sets, score: clamp((sets / 7) * 100) }; }
  function rcWeek(d) { const rcs = weekSubjectSum(d, "varc"); return { rcs, score: clamp((rcs / 7) * 100) }; }
  function vaWeek(d) { const ex = weekSubjectSum(d, "varc"); return { ex, score: clamp((ex / 7) * 100) }; }
  function aeonWeek(d) { // reports compatibility: VARC activity days this week
    const days = weekKeys(d).filter((k) => daySubjectSum(k, "varc") > 0).length;
    return { essays: days, pages: 0, score: clamp((days / 7) * 100) };
  }
  function varcWeek(d) { return rcWeek(d).score; }
  function vocabWeek(d) { const s = weekSubjectSum(d, "vocab"); return { sessions: s, score: clamp((s / 7) * 100) }; }
  // The 20% "VARC" study slice = VARC exercises + Vocab sessions + Reading, averaged, so vocab & reading count.
  function varcBlockWeek(d) { return rnd((vaWeek(d).score + vocabWeek(d).score + readingWeek(d).score) / 3); }

  // Reading: minutes/day (goal 20) and current consecutive-day streak.
  function readingWeek(d) {
    const keys = weekKeys(d);
    const mins = keys.reduce((a, k) => a + ((S.days[k] && S.days[k].readMin) || 0), 0);
    const days = keys.filter((k) => S.days[k] && (S.days[k].readMin || 0) >= 20).length;
    return { mins, days, score: clamp((days / 7) * 100) };
  }
  function readingStreak() {
    let streak = 0;
    for (let i = 0; i < 400; i++) {
      const k = fmtKey(addDays(today(), -i));
      const r = S.days[k];
      if (r && (r.readMin || 0) >= 20) streak++;
      else if (i === 0) continue; // today not yet logged doesn't break the streak
      else break;
    }
    return streak;
  }

  function studyScore(d) {
    const qa = qaScore() ?? 0;
    return rnd(qa * 0.5 + dilrWeek(d).score * 0.3 + varcBlockWeek(d) * 0.2);
  }

  // ---- composite scores ----------------------------------------------------
  const WEIGHTS = { study: 40, diet: 20, gym: 20, wake: 10, office: 5, vitamins: 5 };

  function categoryScores(d) {
    return {
      study: studyScore(d),
      diet: dietWeek(d).score ?? 0,
      gym: gymWeek(d).score,
      wake: wakeWeek(d).score,
      office: officeMonth(d).score ?? 0,
      vitamins: vitaminsWeek(d).score,
    };
  }

  function overallScore(d) {
    const c = categoryScores(d);
    let s = 0; for (const k in WEIGHTS) s += (c[k] * WEIGHTS[k]) / 100;
    return rnd(s);
  }

  function readinessScore(d) {
    const qa = qaScore() ?? 0;
    return rnd(qa * 0.4 + dilrWeek(d).score * 0.25 + rcWeek(d).score * 0.15 + aeonWeek(d).score * 0.10 + wakeWeek(d).score * 0.10);
  }

  // Per-day category scores for the Today tab ("how did TODAY go").
  // Office is excluded (null) on off days and the weights renormalize.
  function dailyScores(key) {
    const r = S.days[key] || DEFAULT_DAY();
    const d = parseKey(key);
    const wake = wakeDayScore(r);
    const office = isWorkingDay(d) ? ((r.office === "office" || r.office === "wfh") ? 100 : 0) : null;
    const gym = r.gymClass ? 100 : r.steps10k ? 25 : 0;
    const vitDone = (r.iron ? 1 : 0) + (r.b12 ? 1 : 0) + (r.vitd ? 1 : 0);
    const vitamins = rnd((vitDone / (r.vitd ? 3 : 2)) * 100);
    const diet = dietDay(key).score ?? 0;
    // study: QA vs today's required pace, DILR vs ~2 sets/day, RC vs ~1.5/day, Aeon/vocab done
    const qc = qaChapters();
    const qaToday = qc.reduce((a, ch) => a + ((r.qa || {})[ch.id] || 0), 0);
    let paceTarget = 0;
    for (const ch of qc) { const st = chapterStats(ch); if (st.pace && st.remaining > 0) paceTarget += st.pace; }
    let qaDaily = null;
    if (paceTarget > 0) qaDaily = clamp((qaToday / paceTarget) * 100);
    else if (qc.length) qaDaily = qaToday > 0 ? 100 : 0;
    const dilrDaily = clamp(daySubjectSum(key, "dilr") * 100);  // any DILR logged today
    // VARC slice = VARC exercise + Vocab session + Reading 20 min, each yes/no, averaged
    const varcD = daySubjectSum(key, "varc") > 0 ? 100 : 0;
    const vocabD = daySubjectSum(key, "vocab") > 0 ? 100 : 0;
    const readD = (r.readMin || 0) >= 20 ? 100 : 0;
    const varcDaily = (varcD + vocabD + readD) / 3;
    const study = qaDaily == null
      ? rnd(dilrDaily * 0.6 + varcDaily * 0.4)
      : rnd(qaDaily * 0.5 + dilrDaily * 0.3 + varcDaily * 0.2);
    return { study, diet, gym, wake, office, vitamins };
  }

  function overallToday(key) {
    const c = dailyScores(key);
    let sum = 0, wsum = 0;
    for (const k in WEIGHTS) {
      if (c[k] == null) continue;
      sum += c[k] * WEIGHTS[k]; wsum += WEIGHTS[k];
    }
    return wsum ? rnd(sum / wsum) : 0;
  }

  // Daily activity % for charts/heatmap: share of applicable checklist items done.
  function dailyActivity(key) {
    const r = S.days[key];
    if (!r) return 0;
    const d = parseKey(key);
    let total = 0, done = 0;
    total++; if (r.wake === true) done++;
    if (isWorkingDay(d)) { total++; if (r.office === "office" || r.office === "wfh") done++; }
    total++; if (r.gymClass || r.steps10k) done++;
    total += 2; if (r.iron) done++; if (r.b12) done++;
    total++; if (r.foods && r.foods.length) done++;
    total++;
    const anyStudy = (r.dilrSol || r.dilr || 0) > 0 || (r.dilrAtt || 0) > 0 || (r.rc || 0) > 0 || (r.va || 0) > 0 || (r.readMin || 0) > 0 || Object.values(r.qa || {}).some((v) => v > 0);
    if (anyStudy) done++;
    return rnd((done / total) * 100);
  }

  window.Score = {
    WEIGHTS, clamp, rnd,
    wakeWeek, wakeTierScore, wakeDayScore, officeMonth, gymWeek, vitaminsWeek,
    proteinScore, calorieScore, dietDay, dietWeek,
    chapterDone, chapterStats, qaScore, qaChapters,
    dilrWeek, rcWeek, vaWeek, aeonWeek, varcWeek, vocabWeek, varcBlockWeek, studyScore, readingWeek, readingStreak,
    daySubjectSum, weekSubjectSum, subjectTotalDone,
    categoryScores, overallScore, readinessScore, dailyActivity,
    dailyScores, overallToday,
  };
})();
