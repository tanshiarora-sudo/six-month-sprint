// State, persistence, date utilities and the full scoring engine.
(function () {
  const LS_KEY = "cat2026-tracker-v1";

  const DEFAULT_STATE = () => ({
    version: 1,
    settings: { calTarget: 1200, proteinTarget: 90 },
    chapters: [], // {id, name, total, startDone, target:"YYYY-MM-DD"}
    days: {}, // key -> day record
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
    qa: {},                // chapterId -> questions done that day
    dilr: 0, rc: 0, aeon: false,
    vocabPages: 0,         // Norman Lewis pages read today
  });

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return Object.assign(DEFAULT_STATE(), JSON.parse(raw));
    } catch (e) { console.warn("state load failed", e); }
    return DEFAULT_STATE();
  }
  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(S));
    if (window.Backup) { Backup.snapshot(); Backup.write(); }
  }

  window.S = load();
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

  function wakeWeek(d) {
    const keys = weekKeys(d);
    const yes = keys.filter((k) => S.days[k] && S.days[k].wake === true).length;
    return { yes, score: clamp((yes / 7) * 100) };
  }

  // Expected = ALL working days in the month (Mon-Fri + 2nd/4th/5th Sat), not just elapsed ones.
  function officeMonth(d) {
    const keys = monthKeys(d);
    let expected = 0, attended = 0, wfh = 0, absent = 0;
    for (const k of keys) {
      const day = parseKey(k);
      const rec = S.days[k];
      if (rec && rec.office === "wfh") wfh++;
      if (!isWorkingDay(day)) continue;
      expected++;
      if (rec && (rec.office === "office" || rec.office === "wfh")) attended++;
      if (rec && rec.office === "absent") absent++;
    }
    return { expected, attended, wfh, absent, score: expected ? clamp((attended / expected) * 100) : null };
  }

  function gymWeek(d) {
    const keys = weekKeys(d);
    let classes = 0, stepDays = 0, cal = 0; const types = [];
    for (const k of keys) {
      const r = S.days[k]; if (!r) continue;
      if (r.gymClass) { classes++; cal += r.gymCal || 0; if (r.gymType) types.push(r.gymType); }
      else if (r.steps10k) stepDays++;
    }
    return { classes, stepDays, cal, types, score: clamp(classes * 25 + stepDays * 25) };
  }

  function vitaminsWeek(d) {
    const keys = weekKeys(d);
    let iron = 0, b12 = 0, vitd = 0;
    for (const k of keys) {
      const r = S.days[k]; if (!r) continue;
      if (r.iron) iron++; if (r.b12) b12++; if (r.vitd) vitd++;
    }
    const done = iron + b12 + Math.min(1, vitd);
    return { iron, b12, vitd: Math.min(1, vitd), done, score: clamp((done / 15) * 100) };
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

  function qaScore() {
    if (!S.chapters.length) return null;
    const sum = S.chapters.reduce((a, ch) => a + chapterStats(ch).pct, 0);
    return rnd(sum / S.chapters.length);
  }

  function weekSum(d, field) {
    return weekKeys(d).reduce((a, k) => a + ((S.days[k] && S.days[k][field]) || 0), 0);
  }
  function weekAeon(d) { return weekKeys(d).filter((k) => S.days[k] && S.days[k].aeon).length; }

  function dilrWeek(d) { const sets = weekSum(d, "dilr"); return { sets, score: clamp((sets / 12) * 100) }; }
  function rcWeek(d) { const rcs = weekSum(d, "rc"); return { rcs, score: clamp((rcs / 10) * 100) }; }
  // Aeon essay OR Norman Lewis vocab pages both satisfy the daily reading habit (same weightage).
  function aeonWeek(d) {
    const keys = weekKeys(d);
    const essays = keys.filter((k) => S.days[k] && (S.days[k].aeon || (S.days[k].vocabPages || 0) > 0)).length;
    const pages = keys.reduce((a, k) => a + ((S.days[k] && S.days[k].vocabPages) || 0), 0);
    return { essays, pages, score: clamp((essays / 7) * 100) };
  }
  function varcWeek(d) { return rnd((rcWeek(d).score + aeonWeek(d).score) / 2); }

  function studyScore(d) {
    const qa = qaScore() ?? 0;
    return rnd(qa * 0.5 + dilrWeek(d).score * 0.3 + varcWeek(d) * 0.2);
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
    const wake = r.wake === true ? 100 : 0;
    const office = isWorkingDay(d) ? ((r.office === "office" || r.office === "wfh") ? 100 : 0) : null;
    const gym = r.gymClass ? 100 : r.steps10k ? 25 : 0;
    const vitDone = (r.iron ? 1 : 0) + (r.b12 ? 1 : 0) + (r.vitd ? 1 : 0);
    const vitamins = rnd((vitDone / (r.vitd ? 3 : 2)) * 100);
    const diet = dietDay(key).score ?? 0;
    // study: QA vs today's required pace, DILR vs ~2 sets/day, RC vs ~1.5/day, Aeon/vocab done
    const qaToday = Object.values(r.qa || {}).reduce((a, b) => a + b, 0);
    let paceTarget = 0;
    for (const ch of S.chapters) { const st = chapterStats(ch); if (st.pace && st.remaining > 0) paceTarget += st.pace; }
    let qaDaily = null;
    if (paceTarget > 0) qaDaily = clamp((qaToday / paceTarget) * 100);
    else if (S.chapters.length) qaDaily = qaToday > 0 ? 100 : 0;
    const dilrDaily = clamp(((r.dilr || 0) / 2) * 100);
    const rcDaily = clamp(((r.rc || 0) / 1.5) * 100);
    const readDaily = (r.aeon || (r.vocabPages || 0) > 0) ? 100 : 0;
    const varcDaily = rnd((rcDaily + readDaily) / 2);
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
    const anyStudy = (r.dilr || 0) > 0 || (r.rc || 0) > 0 || r.aeon || (r.vocabPages || 0) > 0 || Object.values(r.qa || {}).some((v) => v > 0);
    if (anyStudy) done++;
    return rnd((done / total) * 100);
  }

  window.Score = {
    WEIGHTS, clamp, rnd,
    wakeWeek, officeMonth, gymWeek, vitaminsWeek,
    proteinScore, calorieScore, dietDay, dietWeek,
    chapterDone, chapterStats, qaScore,
    dilrWeek, rcWeek, aeonWeek, varcWeek, studyScore,
    categoryScores, overallScore, readinessScore, dailyActivity,
    dailyScores, overallToday,
  };
})();
