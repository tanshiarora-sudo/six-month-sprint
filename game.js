// Game Mode — play layer over the real scores. ONE credit currency + Identity XP.
(function () {
  const { fmtKey, parseKey, addDays, today, weekKeys, monday, monthKeys } = window.D;

  const EARN = {
    mom: { 20: 200, 10: 100, 5: 50, small: 25, held: 25 },
    bonus80: 50, chest: 200, combo: 25,
    streak: { 3: 150, 5: 200, 10: 500, 20: 1000 },
    weekly: { diet: 200, study: 300, gym: 250, wake: 150 },
  };
  const BAD = 40, FLOOR = 30, RECOVERY_BAR = 40;
  const WEEKLY_TARGETS = { diet: 5, study: 6, gym: 4, wake: 6 };
  const REWARDS = [
    { id: "coffee", name: "Coffee", emoji: "☕", cost: 100 },
    { id: "treat", name: "Sweet Treat", emoji: "🍰", cost: 150 },
    { id: "momos", name: "Momos", emoji: "🥟", cost: 250 },
    { id: "meal", name: "Meal", emoji: "🍔", cost: 500 },
  ];
  const SPEND_CATS = [
    { id: "shopping", emoji: "🛍️", name: "Shopping" }, { id: "salon", emoji: "💇", name: "Salon" },
    { id: "trip", emoji: "✈️", name: "Trip" }, { id: "other", emoji: "✨", name: "Other" },
  ];
  const LADDERS = {
    Study: ["QA questions", "1 DILR set", "20 min reading", "1 vocab session"],
    Gym: ["Gym class", "10k steps", "30 min walk", "15 min stretch"],
    Diet: ["Hit calories", "Hit 90g protein", "Log a balanced meal", "Water + fruit"],
  };
  const SKIP_RULES = {
    gym: { label: "Skip Gym", needs: "Diet 90+ · OR +20 QA · OR 2 DILR sets" },
    diet: { label: "Skip Diet", needs: "Gym class · OR 10k steps" },
    study: { label: "Skip Study", needs: "Gym done AND Diet 90+" },
  };
  // Daily Buff — deterministic per date; game-layer only (no core-score changes).
  const BUFFS = [
    { id: "coffee_half", emoji: "☕", label: "Coffee costs half today" },
    { id: "read_pays", emoji: "📚", label: "Reading pays +₹100 today" },
    { id: "combo_double", emoji: "⚡", label: "Combos pay double today" },
    { id: "win_bonus", emoji: "🎯", label: "+₹50 bonus if you win today" },
  ];
  const MONTH_TIERS = [
    { id: "diamond", emoji: "💎", name: "Diamond", frac: 0.95, bonus: 2000 },
    { id: "gold", emoji: "🥇", name: "Gold", frac: 0.80, bonus: 1200 },
    { id: "silver", emoji: "🥈", name: "Silver", frac: 0.65, bonus: 600 },
    { id: "bronze", emoji: "🥉", name: "Bronze", frac: 0.50, bonus: 300 },
  ];
  const COSMETICS = [
    { lvl: 5, emoji: "💍", name: "Gold Ring" }, { lvl: 10, emoji: "🐰", name: "New Bunny" },
    { lvl: 15, emoji: "🎉", name: "Confetti+" }, { lvl: 25, emoji: "👑", name: "Crown" },
  ];

  const PLAN_START = window.PLAN_START || "2026-06-15";
  const S = () => window.S, Score = () => window.Score;
  const hasData = (k) => Score().dailyActivity(k) > 0;
  const prevKey = (k) => fmtKey(addDays(parseKey(k), -1));

  function questScore(key) {
    const c = Score().dailyScores(key), W = Score().WEIGHTS, sk = skipState(key);
    const drop = sk.cat && sk.met ? sk.cat : null;
    let sum = 0, wsum = 0;
    for (const k in W) { if (c[k] == null || k === drop) continue; sum += c[k] * W[k]; wsum += W[k]; }
    return wsum ? Math.round(sum / wsum) : 0;
  }

  function badRun(key) { let n = 0, k = key; while (k >= PLAN_START && questScore(k) < BAD) { n++; k = prevKey(k); } return n; }
  // Recovery Day: returning from a 3+ day slump → gentler bar (just reach 40%), no freeze/penalty.
  function recoveryActive(key) { return badRun(prevKey(key)) >= 3; }

  function goodDay(key) {
    if (!hasData(key)) return false;
    const t = questScore(key);
    if (recoveryActive(key)) return t >= RECOVERY_BAR;
    if (t < FLOOR) return false;
    return (t - questScore(prevKey(key))) >= 5 || t >= 50;
  }
  function streakEndingAt(key) { let n = 0, k = key; while (k >= PLAN_START && goodDay(k)) { n++; k = prevKey(k); } return n; }
  function currentStreak() { let k = fmtKey(today()); if (!hasData(k)) k = prevKey(k); return streakEndingAt(k); }

  // ---- combos ----
  function combosFor(key) {
    const r = S().days[key] || {}, ds = Score().dailyScores(key);
    const gymWin = !!(r.gymClass || r.steps10k);
    const dietS = Score().dietDay(key).score || 0, dietWin = dietS >= 80;
    const studyWin = (ds.study || 0) > 0;
    const readWin = (r.readMin || 0) >= 20;
    const wakeWin = r.wake === true || !!r.wakeTime;
    const qa = qaQuestionsToday(key) > 0, dilr = daySub(key, "dilr") > 0;
    const dd = Score().dietDay(key);
    const protWin = (dd.protein || 0) >= 80, calWin = dd.score != null && (dd.cal || 0) > 0;
    const out = [];
    if (gymWin && dietWin) out.push({ name: "Fitness Combo", emoji: "🏋️" });
    if (studyWin && readWin) out.push({ name: "Scholar Combo", emoji: "📚" });
    if (wakeWin && gymWin) out.push({ name: "Morning Warrior", emoji: "🌅" });
    if (qa && dilr && readWin) out.push({ name: "Brain Day", emoji: "🧠" });
    if (calWin && protWin) out.push({ name: "Clean Day", emoji: "🥗" });
    if (wakeWin && studyWin) out.push({ name: "Productivity", emoji: "⚡" });
    return out;
  }

  // ---- strategic skip ----
  function skipState(key) {
    const r = S().days[key] || {}, cat = r.skipCat || null;
    if (!cat) return { cat: null, met: false };
    const diet = Score().dietDay(key).score || 0, qaToday = qaQuestionsToday(key), dilrSets = Math.floor(daySub(key, "dilr") / 4);
    let met = false;
    if (cat === "gym") met = diet >= 90 || qaToday >= 20 || dilrSets >= 2;
    else if (cat === "diet") met = !!(r.gymClass || r.steps10k);
    else if (cat === "study") met = !!(r.gymClass || r.steps10k) && diet >= 90;
    return { cat, met, needs: SKIP_RULES[cat] ? SKIP_RULES[cat].needs : "" };
  }
  // Smart skip: which category is safest to skip today, given what's already strong.
  function recommendSkip(key) {
    const r = S().days[key] || {}, c = Score().dailyScores(key), diet = Score().dietDay(key).score || 0;
    const gymDone = !!(r.gymClass || r.steps10k);
    if (diet >= 90 && !gymDone) return { cat: "gym", reason: `Diet's already ${diet}% — skip Gym, finish Study instead.` };
    if (gymDone && diet < 60 && (c.study || 0) > 40) return { cat: "diet", reason: "Gym & study are in — a lighter diet day is fine." };
    if (gymDone && diet >= 90 && (c.study || 0) === 0) return { cat: "study", reason: "Gym + diet are strong — rest study if you must." };
    return null;
  }
  function qaQuestionsToday(key) { const r = S().days[key] || {}, qa = r.qa || {}; return S().chapters.filter((c) => (c.subject || "qa") === "qa").reduce((a, c) => a + (qa[c.id] || 0), 0); }
  function daySub(key, subject) { const r = S().days[key] || {}, qa = r.qa || {}; return S().chapters.filter((c) => (c.subject || "qa") === subject).reduce((a, c) => a + (qa[c.id] || 0), 0); }

  // ---- weekly ----
  function weeklyProgress(d) {
    const keys = weekKeys(d).filter((k) => k >= PLAN_START && k <= fmtKey(today()));
    let diet = 0, study = 0, gym = 0, wake = 0;
    for (const k of keys) { const r = S().days[k]; if (!r) continue;
      if ((Score().dietDay(k).score || 0) >= 80) diet++;
      if ((Score().dailyScores(k).study || 0) > 0) study++;
      if (r.gymClass) gym++;
      if (r.wake === true || r.wakeTime) wake++; }
    return {
      diet: { have: diet, need: WEEKLY_TARGETS.diet, reward: EARN.weekly.diet, label: "Sweet treat" },
      study: { have: study, need: WEEKLY_TARGETS.study, reward: EARN.weekly.study, label: "Shopping" },
      gym: { have: gym, need: WEEKLY_TARGETS.gym, reward: EARN.weekly.gym, label: "Favourite meal" },
      wake: { have: wake, need: WEEKLY_TARGETS.wake, reward: EARN.weekly.wake, label: "Sleep in" },
    };
  }

  // ---- monthly tiers ----
  function monthTier(d) {
    const keys = monthKeys(d).filter((k) => k >= PLAN_START && k <= fmtKey(today()));
    const wins = keys.filter(goodDay).length, avail = Math.max(1, keys.length), frac = wins / avail;
    let tier = null; for (const t of MONTH_TIERS) if (frac >= t.frac) { tier = t; break; }
    const next = [...MONTH_TIERS].reverse().find((t) => frac < t.frac) || null;
    const needNext = next ? Math.max(1, Math.ceil(next.frac * avail) - wins) : 0;
    return { wins, avail, frac, tier, next, needNext, nightOut: !!(tier && (tier.id === "gold" || tier.id === "diamond")) };
  }
  function claimedThisMonth(id) { const ym = fmtKey(today()).slice(0, 7); return ((S().game && S().game.claims) || []).some((c) => c.id === id && (c.date || "").slice(0, 7) === ym); }
  function canNightOut() { return monthTier(today()).nightOut && !claimedThisMonth("nightout"); }

  // ---- daily buff ----
  function dailyBuff(key) { let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 100000; return BUFFS[h % BUFFS.length]; }

  // ---- earnings ----
  function allDayKeys() { const out = []; let k = PLAN_START; const end = fmtKey(today()); let g = 0; while (k <= end && g++ < 800) { out.push(k); k = fmtKey(addDays(parseKey(k), 1)); } return out; }
  function dayEvents(key) {
    if (!hasData(key)) return [];
    const t = questScore(key);
    const rec = recoveryActive(key);
    if (!rec && t < FLOOR) return [];
    const y = questScore(prevKey(key)), delta = t - y, mult = t < 50 ? 0.5 : 1, buff = dailyBuff(key);
    const ev = [];
    let base, lbl;
    if (rec && t >= RECOVERY_BAR) { base = EARN.mom.held; lbl = `Recovery win — ${t}%`; }
    else if (delta >= 20) { base = EARN.mom[20]; lbl = `Momentum +${delta}% → ${t}%`; }
    else if (delta >= 10) { base = EARN.mom[10]; lbl = `Momentum +${delta}% → ${t}%`; }
    else if (delta >= 5) { base = EARN.mom[5]; lbl = `Momentum +${delta}% → ${t}%`; }
    else if (delta > 0) { base = EARN.mom.small; lbl = `Edged up to ${t}%`; }
    else { base = EARN.mom.held; lbl = t >= 50 ? `Held ${t}%` : `Showed up — ${t}%`; }
    ev.push({ date: key, icon: "📈", label: lbl, amt: Math.round(base * mult) });
    const comboMult = buff.id === "combo_double" ? 2 : 1;
    for (const c of combosFor(key)) ev.push({ date: key, icon: c.emoji, label: c.name + (comboMult > 1 ? " ×2" : ""), amt: Math.round(EARN.combo * mult * comboMult) });
    if (t >= 100) ev.push({ date: key, icon: "🎁", label: "Perfect 100% day", amt: EARN.chest });
    else if (t >= 80) ev.push({ date: key, icon: "🌟", label: `Strong day — ${t}%`, amt: EARN.bonus80 });
    const st = streakEndingAt(key); if (EARN.streak[st]) ev.push({ date: key, icon: "🔥", label: `${st}-day streak!`, amt: EARN.streak[st] });
    // buff payouts
    if (buff.id === "read_pays" && (S().days[key] || {}).readMin >= 20) ev.push({ date: key, icon: "📚", label: "Buff: reading paid", amt: 100 });
    if (buff.id === "win_bonus" && goodDay(key)) ev.push({ date: key, icon: "🎯", label: "Buff: win bonus", amt: 50 });
    return ev;
  }
  function dayEarn(key) { return dayEvents(key).reduce((a, e) => a + e.amt, 0); }

  // Bank statement: per-day events + weekly + monthly tier + spends, newest first.
  function earnLog() {
    const ev = [];
    for (const k of allDayKeys()) for (const e of dayEvents(k)) ev.push(e);
    const WLAB = { diet: "Diet target", study: "Study target", gym: "Gym classes", wake: "Wake-ups" };
    const weeks = [...new Set(allDayKeys().map((k) => fmtKey(monday(parseKey(k)))))];
    for (const wk of weeks) { const wp = weeklyProgress(parseKey(wk)); for (const key in wp) if (wp[key].have >= wp[key].need) ev.push({ date: wk, week: true, icon: "🗓️", label: `Weekly ${WLAB[key]}`, amt: wp[key].reward }); }
    const months = [...new Set(allDayKeys().map((k) => k.slice(0, 7)))];
    for (const ym of months) { const mt = monthTier(parseKey(ym + "-01")); if (mt.tier) ev.push({ date: ym + "-15", month: true, icon: mt.tier.emoji, label: `${mt.tier.name} month (${Math.round(mt.frac * 100)}%)`, amt: mt.tier.bonus }); }
    for (const c of ((S().game && S().game.claims) || [])) ev.push({ date: c.date, spend: true, icon: c.id === "nightout" ? "🍻" : "💸", label: c.name + " (spent)", amt: -(c.cost || 0) });
    const base = gameBaseline(); if (base > 0) ev.push({ date: (S().game && S().game.resetAt) || fmtKey(today()), reset: true, icon: "🔄", label: "Fresh start — previous balance cleared", amt: -base });
    ev.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return ev;
  }
  function earnedTotal() { let t = 0; for (const k of allDayKeys()) t += dayEarn(k); const weeks = [...new Set(allDayKeys().map((k) => fmtKey(monday(parseKey(k)))))]; for (const wk of weeks) { const wp = weeklyProgress(parseKey(wk)); for (const key in wp) if (wp[key].have >= wp[key].need) t += wp[key].reward; } const months = [...new Set(allDayKeys().map((k) => k.slice(0, 7)))]; for (const ym of months) { const mt = monthTier(parseKey(ym + "-01")); if (mt.tier) t += mt.tier.bonus; } return t; }
  function spentTotal() { return ((S().game && S().game.claims) || []).reduce((a, c) => a + (c.cost || 0), 0); }
  function gameBaseline() { return (S().game && S().game.baseline) || 0; }   // "start fresh" clears the running balance
  function balance() { return earnedTotal() - spentTotal() - gameBaseline(); }
  function canSpend() { return true; }   // recovery mode replaced the freeze — spending is always open
  function buyCost(item) { return (item.id === "coffee" && dailyBuff(fmtKey(today())).id === "coffee_half") ? Math.round(item.cost / 2) : item.cost; }
  function availableNow() { const b = balance(); return REWARDS.map((r) => ({ ...r, n: b > 0 ? Math.floor(b / buyCost(r)) : 0 })); }

  function punishment() {
    const tk = fmtKey(today()), run = badRun(prevKey(tk));
    if (run >= 3 && !goodDay(tk)) return { recovery: true, note: `Recovery Day — you've had a rough patch. Today's target drops to just ${RECOVERY_BAR}%. Clear that and you're back, no penalty.` };
    return { recovery: false, note: "" };
  }

  // ---- coach (shortest path) ----
  function coachTip(key) {
    const r = S().days[key] || {}, c = Score().dailyScores(key), t = questScore(key);
    if (goodDay(key)) return { head: "Today's win is secured 🎉", sub: "Anything more is pure bonus." };
    const todo = [];
    if ((r.readMin || 0) < 20) todo.push("a 20-min read");
    if (!(r.iron && r.b12)) todo.push("Iron + B12");
    if (!(r.wake === true || r.wakeTime)) todo.push("log your wake-up");
    if (!(r.gymClass || r.steps10k)) todo.push("a 10k-step walk");
    if (qaQuestionsToday(key) === 0) todo.push("one QA set");
    const target = recoveryActive(key) ? RECOVERY_BAR : Math.max(FLOOR, Math.min(50, questScore(prevKey(key)) + 5));
    const gap = Math.max(0, target - t);
    if (todo.length) return { head: gap ? `${gap} more points → today's win` : "You're almost there", sub: `Quickest path: ${todo[0]}.` };
    return { head: `${gap} more points → today's win`, sub: "Push any card up a notch." };
  }
  // ---- near-miss save (after 8 PM, close to a win) ----
  function nearMiss(key) {
    const h = new Date().getHours();
    if (h < 20 || goodDay(key)) return null;
    const t = questScore(key), target = recoveryActive(key) ? RECOVERY_BAR : Math.max(FLOOR, Math.min(50, questScore(prevKey(key)) + 5));
    const gap = target - t;
    if (gap <= 0 || gap > 18) return null;
    const r = S().days[key] || {}, opts = [];
    if ((r.readMin || 0) < 20) opts.push({ label: "20-min read", act: "tgt:read" });
    if (!(r.gymClass || r.steps10k)) opts.push({ label: "10k steps", act: "gym:steps" });
    if (!(r.wake === true || r.wakeTime)) opts.push({ label: "Log wake-up", act: "wake:yes" });
    if (!(r.iron && r.b12)) opts.push({ label: "Iron + B12", act: "vit:iron" });
    return opts.length ? { gap, opts: opts.slice(0, 3) } : null;
  }

  function dailyReward(key) { if (!hasData(key)) return null; const t = questScore(key), e = dayEarn(key); if (t >= 100) return { emoji: "🎁", text: "Mystery Chest!" }; if (e > 0) return { emoji: "💰", text: `+₹${e} banked today` }; return null; }

  // level from lifetime credits earned
  function level() { return Math.max(1, Math.floor(earnedTotal() / 1000) + 1); }

  window.Game = {
    EARN, REWARDS, SPEND_CATS, FLOOR, BAD, RECOVERY_BAR, WEEKLY_TARGETS, LADDERS, SKIP_RULES, MONTH_TIERS, BUFFS,
    questScore, goodDay, recoveryActive, dayEvents, dayEarn, currentStreak, streakEndingAt, combosFor,
    skipState, recommendSkip, weeklyProgress, monthTier, canNightOut, claimedThisMonth,
    earnedTotal, earnLog, spentTotal, balance, canSpend, buyCost, availableNow, dailyBuff,
    dailyReward, punishment, coachTip, nearMiss, level, qaQuestionsToday,
  };
})();
