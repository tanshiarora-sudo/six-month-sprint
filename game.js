// Game Mode — a play layer on top of the existing scores. Pure functions read window.S / window.Score.
// Wallet is a symbolic balance (points): earned deterministically from history, spent via claims.
(function () {
  const { fmtKey, parseKey, addDays, today, weekKeys, monday, monthKeys } = window.D;

  // --- tunables (start easy; the "beat yesterday" bar self-hardens as your baseline rises) ---
  const EARN = {
    daily: 100,          // match or beat yesterday
    bonus80: 50,         // 80%+ day
    chest: 200,          // 100% day (mystery chest)
    combo: 25,           // each combo
    streak: { 3: 150, 5: 200, 10: 500, 20: 1000 },
    weekly: { diet: 200, study: 300, gym: 250, wake: 150 },
    month: 1000,         // bonus for a good month (on top of the Night Out)
    penalty2bad: 100,    // two bad days in a row
  };
  const MONTH_FRAC = 0.7;  // a "good month" = at least 70% of the month's tracked days are wins
  const BAD = 40;        // below this % = a "bad day"
  const MIN_PCT = 50;    // floor: a day must reach 50% to bank ANY reward
  // Free perks — permission to indulge, unlocked simply by clearing today's quest (no money).
  const PERKS = [
    { id: "coffee", name: "Coffee outside", emoji: "☕" },
    { id: "treat", name: "Sweet treat", emoji: "🍰" },
    { id: "momos", name: "Momos / a craving", emoji: "🥟" },
    { id: "sleepin", name: "Sleep in extra", emoji: "😴" },
  ];
  // Money rewards — spend your banked balance. Ranked: Spa highest → Shopping → Restaurant.
  // Entry (Restaurant) kept reachable so a small balance is never stuck in a dead zone.
  const REWARDS = [
    { id: "spa", name: "Spa / mani-pedi / blowout", emoji: "💆", cost: 1800 },
    { id: "shopping", name: "Shopping", emoji: "🛍️", cost: 900 },
    { id: "restaurant", name: "Restaurant meal", emoji: "🍽️", cost: 400 },
  ];
  const WEEKLY_TARGETS = { diet: 5, study: 6, gym: 4, wake: 6 };

  const PLAN_START = window.PLAN_START || "2026-06-15";
  const S = () => window.S;
  const Score = () => window.Score;

  const hasData = (k) => Score().dailyActivity(k) > 0;
  const prevKey = (k) => fmtKey(addDays(parseKey(k), -1));

  // Today's score with a compensated skip removed (its weight re-balances, like office on off-days).
  function questScore(key) {
    const c = Score().dailyScores(key);
    const W = Score().WEIGHTS;
    const sk = skipState(key);
    const drop = sk.cat && sk.met ? sk.cat : null;
    let sum = 0, wsum = 0;
    for (const k in W) { if (c[k] == null || k === drop) continue; sum += c[k] * W[k]; wsum += W[k]; }
    return wsum ? Math.round(sum / wsum) : 0;
  }

  // Daily quest: match OR beat yesterday — AND clear the 50% floor (no reward below that).
  function goodDay(key) {
    if (!hasData(key)) return false;
    const t = questScore(key), y = questScore(prevKey(key));
    return t >= MIN_PCT && t >= y;
  }
  // Did you at least beat yesterday, even if below the 50% reward floor?
  function beatYesterday(key) {
    if (!hasData(key)) return false;
    const t = questScore(key), y = questScore(prevKey(key));
    return t > 0 && t >= y;
  }

  function streakEndingAt(key) {
    let n = 0, k = key;
    while (hasData(k) && goodDay(k)) { n++; k = prevKey(k); if (k < PLAN_START) break; }
    return n;
  }
  function currentStreak() {
    // streak ending at the most recent logged day (today if logged, else yesterday)
    let k = fmtKey(today());
    if (!hasData(k)) k = prevKey(k);
    return streakEndingAt(k);
  }

  // ---- combos (auto-detected from a day) ----
  function combosFor(key) {
    const r = S().days[key] || {};
    const ds = Score().dailyScores(key);
    const gymWin = !!(r.gymClass || r.steps10k);
    const dietWin = (Score().dietDay(key).score || 0) >= 80;
    const studyWin = (ds.study || 0) > 0;
    const readWin = (r.readMin || 0) >= 20;
    const wakeWin = r.wake === true || !!r.wakeTime;
    const out = [];
    if (gymWin && dietWin) out.push({ name: "Fitness Combo", emoji: "🏋️" });
    if (studyWin && readWin) out.push({ name: "Scholar Combo", emoji: "📚" });
    if (wakeWin && gymWin) out.push({ name: "Morning Warrior", emoji: "🌅" });
    return out;
  }

  // ---- no-zero-days backup ladder (guidance: easiest still-available win per category) ----
  const LADDERS = {
    Study: ["QA questions", "1 DILR set", "20 min reading", "1 vocab session"],
    Gym: ["Gym class", "10k steps", "30 min walk", "15 min stretch"],
    Diet: ["Hit calories", "Hit 90g protein", "Log a balanced meal", "Water + fruit"],
  };

  // ---- strategic skip ----
  const SKIP_RULES = {
    gym: { label: "Skip Gym", needs: "Diet 90+ · OR +20 QA · OR 2 DILR sets" },
    diet: { label: "Skip Diet", needs: "Gym class · OR 10k steps" },
    study: { label: "Skip Study", needs: "Gym done AND Diet 90+" },
  };
  function skipState(key) {
    const r = S().days[key] || {};
    const cat = r.skipCat || null;
    if (!cat) return { cat: null, met: false };
    const ds = Score().dailyScores(key);
    const diet = Score().dietDay(key).score || 0;
    const qaToday = qaQuestionsToday(key);
    const dilrSets = Math.floor((daySub(key, "dilr")) / 4);
    let met = false;
    if (cat === "gym") met = diet >= 90 || qaToday >= 20 || dilrSets >= 2;
    else if (cat === "diet") met = !!(r.gymClass || r.steps10k);
    else if (cat === "study") met = (!!(r.gymClass || r.steps10k)) && diet >= 90;
    return { cat, met, needs: SKIP_RULES[cat] ? SKIP_RULES[cat].needs : "" };
  }
  function qaQuestionsToday(key) {
    const r = S().days[key] || {}; const qa = r.qa || {};
    return S().chapters.filter((c) => (c.subject || "qa") === "qa").reduce((a, c) => a + (qa[c.id] || 0), 0);
  }
  function daySub(key, subject) {
    const r = S().days[key] || {}; const qa = r.qa || {};
    return S().chapters.filter((c) => (c.subject || "qa") === subject).reduce((a, c) => a + (qa[c.id] || 0), 0);
  }

  // ---- weekly targets ----
  function weeklyProgress(d) {
    const keys = weekKeys(d).filter((k) => k >= PLAN_START && k <= fmtKey(today()));
    let diet = 0, study = 0, gym = 0, wake = 0;
    for (const k of keys) {
      const r = S().days[k]; if (!r) continue;
      if ((Score().dietDay(k).score || 0) >= 80) diet++;
      if ((Score().dailyScores(k).study || 0) > 0) study++;
      if (r.gymClass) gym++;
      if (r.wake === true || r.wakeTime) wake++;
    }
    return {
      diet: { have: diet, need: WEEKLY_TARGETS.diet, reward: EARN.weekly.diet, label: "Sweet treat" },
      study: { have: study, need: WEEKLY_TARGETS.study, reward: EARN.weekly.study, label: "Shopping ₹300" },
      gym: { have: gym, need: WEEKLY_TARGETS.gym, reward: EARN.weekly.gym, label: "Favourite meal" },
      wake: { have: wake, need: WEEKLY_TARGETS.wake, reward: EARN.weekly.wake, label: "Sleep in" },
    };
  }

  // ---- monthly milestone: a good month earns a Night Out 🍻 ----
  function monthGood(d) {
    const keys = monthKeys(d).filter((k) => k >= PLAN_START && k <= fmtKey(today()));
    const have = keys.filter((k) => goodDay(k)).length;
    const need = Math.max(1, Math.round(keys.length * MONTH_FRAC));
    return { have, need, avail: keys.length, earned: have >= need };
  }
  function claimedThisMonth(id) {
    const ym = fmtKey(today()).slice(0, 7);
    return (((S().game && S().game.claims) || []).some((c) => c.id === id && (c.date || "").slice(0, 7) === ym));
  }
  function canNightOut() { return monthGood(today()).earned && !claimedThisMonth("nightout"); }

  // ---- earnings (deterministic from history) ----
  function allDayKeys() {
    const out = []; let k = PLAN_START; const end = fmtKey(today());
    let guard = 0;
    while (k <= end && guard++ < 800) { out.push(k); k = fmtKey(addDays(parseKey(k), 1)); }
    return out;
  }
  // Itemised "where the balance came from", computed deterministically from history.
  function earnBreakdown() {
    const b = { daily: 0, dailyDays: 0, bonus: 0, chest: 0, combo: 0, comboCount: 0, streak: 0, weekly: 0, monthly: 0, penalty: 0 };
    for (const k of allDayKeys()) {
      const sc = questScore(k);
      if (hasData(k) && sc >= MIN_PCT) {            // 50% floor — only quality days bank rewards
        if (goodDay(k)) { b.daily += EARN.daily; b.dailyDays++; }
        if (sc >= 80) b.bonus += EARN.bonus80;
        if (sc >= 100) b.chest += EARN.chest;
        const cc = combosFor(k).length; b.combo += cc * EARN.combo; b.comboCount += cc;
        const st = streakEndingAt(k);
        if (EARN.streak[st]) b.streak += EARN.streak[st];
      }
    }
    // good-month bonus (per calendar month that hit the milestone)
    const months = [...new Set(allDayKeys().map((k) => k.slice(0, 7)))];
    for (const ym of months) if (monthGood(parseKey(ym + "-01")).earned) b.monthly += EARN.month;
    // Only the CURRENT slump drains the wallet — past gaps you recovered from don't keep biting.
    b.penalty = currentDrain();
    const weeks = [...new Set(allDayKeys().map((k) => fmtKey(monday(parseKey(k)))))];
    for (const wk of weeks) {
      const wp = weeklyProgress(parseKey(wk));
      for (const key in wp) if (wp[key].have >= wp[key].need) b.weekly += wp[key].reward;
    }
    b.total = b.daily + b.bonus + b.chest + b.combo + b.streak + b.weekly + b.monthly - b.penalty;
    return b;
  }
  function earnedTotal() { return earnBreakdown().total; }

  // Dated, itemised statement of every reward earned (and penalties), newest first.
  function earnLog() {
    const ev = [];
    for (const k of allDayKeys()) {
      const sc = questScore(k);
      if (hasData(k) && sc >= MIN_PCT) {
        if (goodDay(k)) ev.push({ date: k, icon: "🎯", label: `Beat/matched yesterday — ${sc}%`, amt: EARN.daily });
        if (sc >= 100) ev.push({ date: k, icon: "🎁", label: "Perfect 100% day", amt: EARN.chest });
        else if (sc >= 80) ev.push({ date: k, icon: "🌟", label: `Strong day — ${sc}%`, amt: EARN.bonus80 });
        for (const c of combosFor(k)) ev.push({ date: k, icon: c.emoji, label: `${c.name}`, amt: EARN.combo });
        const st = streakEndingAt(k); if (EARN.streak[st]) ev.push({ date: k, icon: "🔥", label: `${st}-day win streak!`, amt: EARN.streak[st] });
      }
    }
    const WLAB = { diet: "Diet target", study: "Study target", gym: "Gym classes", wake: "Wake-ups" };
    const weeks = [...new Set(allDayKeys().map((k) => fmtKey(monday(parseKey(k)))))];
    for (const wk of weeks) { const wp = weeklyProgress(parseKey(wk)); for (const key in wp) if (wp[key].have >= wp[key].need) ev.push({ date: wk, week: true, icon: "🗓️", label: `Weekly ${WLAB[key]} (${wp[key].have}/${wp[key].need})`, amt: wp[key].reward }); }
    const months = [...new Set(allDayKeys().map((k) => k.slice(0, 7)))];
    for (const ym of months) { const mg = monthGood(parseKey(ym + "-01")); if (mg.earned) ev.push({ date: ym + "-01", month: true, icon: "🍻", label: `Good month — Night Out (${mg.have}/${mg.need} wins)`, amt: EARN.month }); }
    const drain = currentDrain(); if (drain > 0) ev.push({ date: fmtKey(today()), icon: "😬", label: "Slump penalty — recover to restore", amt: -drain });
    ev.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return ev;
  }
  function spentTotal() { return ((S().game && S().game.claims) || []).reduce((a, c) => a + (c.cost || 0), 0); }
  function balance() { return Math.max(0, earnedTotal() - spentTotal()); }

  // ---- daily reward + punishment flags ----
  function dailyReward(key) {
    const sc = questScore(key);
    if (!hasData(key)) return null;
    if (sc >= 100) return { emoji: "🎁", text: "Mystery Chest — free treats + bonus ₹!" };
    if (sc >= 80) return { emoji: "🌟", text: "80%+ day — free treats unlocked" };
    if (goodDay(key)) return { emoji: "🎟️", text: "today's free treats are unlocked!" };
    return null;
  }
  function badRun(key) { // consecutive default days (empty OR <40%) ending at key
    let n = 0, k = key;
    while (k >= PLAN_START && questScore(k) < BAD) { n++; k = prevKey(k); }
    return n;
  }
  // Wallet drain from the ACTIVE slump only (default run ending yesterday). A 50%+ today clears it.
  function currentDrain() {
    const tk = fmtKey(today()), yk = prevKey(tk);
    if (hasData(tk) && questScore(tk) >= MIN_PCT) return 0;   // recovered today → no drain
    const run = badRun(yk);
    return run >= 2 ? 50 * (run * (run + 1) / 2 - 1) : 0;
  }
  function punishment() {
    const tk = fmtKey(today());
    const yk = prevKey(tk);
    const out = { coffeeLocked: false, recovery: false, redeemLocked: false, lostWallet: 0, note: "" };
    if (hasData(yk) && questScore(yk) < BAD) { out.coffeeLocked = true; out.note = "Yesterday dipped below 40% — no coffee claim today."; }
    const run = badRun(yk);   // completed days only; today is still in progress
    const todayOk = hasData(tk) && questScore(tk) >= MIN_PCT;   // a 50%+ today thaws the freeze
    out.lostWallet = currentDrain();
    if (run >= 3 && !todayOk) { out.recovery = true; out.redeemLocked = true; out.note = `${run} low days in a row — redemptions are FROZEN and the wallet is down −₹${out.lostWallet}. Log a 50%+ day to thaw and restore it.`; }
    else if (run >= 3 && todayOk) { out.note = `Back on track — you cleared 50% today, redemptions thawed and balance restored.`; }
    return out;
  }
  function coffeeLocked() { return punishment().coffeeLocked; }
  function redeemLocked() { return punishment().redeemLocked; }

  function canClaim(item) {                            // money rewards
    if (redeemLocked()) return false;                  // default too long → offers frozen
    return balance() >= item.cost;
  }
  function claimedToday(id) {
    const tk = fmtKey(today());
    return (((S().game && S().game.claims) || []).some((c) => c.date === tk && c.id === id));
  }
  // Free perks: unlocked when today's quest is cleared (50%+ and >= yesterday), once each per day.
  function canPerk(perk) {
    if (!goodDay(fmtKey(today()))) return false;
    if (claimedToday(perk.id)) return false;
    if (perk.id === "coffee" && coffeeLocked()) return false;
    return true;
  }

  // small fun level from lifetime earnings
  function level() { const e = earnedTotal(); return Math.max(1, Math.floor(e / 1000) + 1); }

  window.Game = {
    EARN, REWARDS, PERKS, BAD, MIN_PCT, WEEKLY_TARGETS, LADDERS, SKIP_RULES,
    questScore, goodDay, beatYesterday, currentStreak, streakEndingAt, combosFor,
    skipState, weeklyProgress, monthGood, canNightOut, claimedThisMonth, earnedTotal, earnLog, spentTotal, balance,
    dailyReward, punishment, coffeeLocked, redeemLocked, canClaim, canPerk, claimedToday, level, qaQuestionsToday, earnBreakdown,
  };
})();
