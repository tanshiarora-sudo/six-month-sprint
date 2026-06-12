// Fluff, the resident coach: a fluffy purple gym-buddy blob (soft shading, no outlines,
// big glossy eyes) that reacts to your day. CSS-animated.
// Moods: start, great, happy, ok, sad, angry.
(function () {
  const EYE = "#221d38", MOUTH = "#352a57", BROW = "#4d3d80";

  // scalloped fluffy outline
  function fluff(cx, cy, rx, ry, n, amp) {
    const pt = (a) => [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
    const step = (Math.PI * 2) / n;
    let d = "";
    for (let i = 0; i < n; i++) {
      const a1 = i * step - Math.PI / 2, a2 = a1 + step, am = a1 + step / 2;
      const [x1, y1] = pt(a1), [x2, y2] = pt(a2);
      const mx = cx + rx * (1 + amp) * Math.cos(am), my = cy + ry * (1 + amp) * Math.sin(am);
      d += (i === 0 ? `M${x1.toFixed(1)} ${y1.toFixed(1)}` : "") +
        ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }
    return d + " Z";
  }

  function glossy(x) {
    return `<ellipse cx="${x}" cy="86" rx="13" ry="15.5" fill="${EYE}"/>
      <circle cx="${x - 4.5}" cy="79" r="4.8" fill="#fff"/>
      <circle cx="${x + 4.5}" cy="92" r="2.1" fill="#fff" opacity=".85"/>`;
  }

  function face(mood) {
    switch (mood) {
      case "great": // joyful closed arcs + big open smile
        return `
          <path d="M50 88 Q62 71 74 88" fill="none" stroke="${EYE}" stroke-width="6" stroke-linecap="round"/>
          <path d="M96 88 Q108 71 120 88" fill="none" stroke="${EYE}" stroke-width="6" stroke-linecap="round"/>
          <path d="M67 112 Q85 134 103 112 Q85 121 67 112 Z" fill="${MOUTH}"/>
          <ellipse cx="85" cy="121" rx="7.5" ry="3.8" fill="#e58ba8"/>`;
      case "happy":
        return `${glossy(62)}${glossy(108)}
          <path d="M72 114 Q85 126 98 114" fill="none" stroke="${MOUTH}" stroke-width="4.5" stroke-linecap="round"/>`;
      case "ok":
        return `${glossy(62)}${glossy(108)}
          <path d="M76 118 L94 118" stroke="${MOUTH}" stroke-width="4.5" stroke-linecap="round"/>
          <g class="m-dots" fill="#b9a8e8">
            <circle class="d1" cx="148" cy="70" r="3.6"/><circle class="d2" cx="154" cy="84" r="3.6"/><circle class="d3" cx="149" cy="98" r="3.6"/>
          </g>`;
      case "sad":
        return `
          <path d="M48 70 Q60 77 72 72" fill="none" stroke="${BROW}" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M122 70 Q110 77 98 72" fill="none" stroke="${BROW}" stroke-width="4.5" stroke-linecap="round"/>
          ${glossy(62)}${glossy(108)}
          <path d="M73 122 Q85 111 97 122" fill="none" stroke="${MOUTH}" stroke-width="4.5" stroke-linecap="round"/>
          <path class="m-tear" d="M119 98 q7 10 0 15 q-7 -5 0 -15" fill="#aeddf5" stroke="#7fbede" stroke-width="1.5"/>`;
      case "angry":
        return `
          <path d="M46 68 L74 80" stroke="${BROW}" stroke-width="6.5" stroke-linecap="round"/>
          <path d="M124 68 L96 80" stroke="${BROW}" stroke-width="6.5" stroke-linecap="round"/>
          ${glossy(62)}${glossy(108)}
          <rect x="70" y="111" width="30" height="10" rx="5" fill="#fff"/>
          <path d="M80 111.5 v9 M90 111.5 v9" stroke="${MOUTH}" stroke-width="2.6"/>
          <g class="m-mark" stroke="#ff8a8a" stroke-width="3.8" stroke-linecap="round" fill="none">
            <path d="M26 36 q-5 -1 -7 -6"/><path d="M33 30 q-1 -5 3 -9"/><path d="M22 47 q-6 1 -9 -3"/>
          </g>`;
      default: // start: sleepy lids + tiny o
        return `
          <path d="M50 86 Q62 96 74 86" fill="none" stroke="${EYE}" stroke-width="5.5" stroke-linecap="round"/>
          <path d="M96 86 Q108 96 120 86" fill="none" stroke="${EYE}" stroke-width="5.5" stroke-linecap="round"/>
          <ellipse cx="85" cy="117" rx="5.5" ry="6.5" fill="${MOUTH}"/>`;
    }
  }

  function extras(mood) {
    if (mood === "great") return `
      <g fill="#f5cf5d">
        <path class="m-spark s1" d="M20 50 l2.8 6.8 6.8 2.8 -6.8 2.8 -2.8 6.8 -2.8 -6.8 -6.8 -2.8 6.8 -2.8 Z"/>
        <path class="m-spark s2" d="M144 26 l2.3 5.5 5.5 2.3 -5.5 2.3 -2.3 5.5 -2.3 -5.5 -5.5 -2.3 5.5 -2.3 Z"/>
        <path class="m-spark s3" d="M156 66 l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8 Z"/>
      </g>`;
    if (mood === "angry") return `
      <g class="m-prop"><g transform="translate(116,146)">
        <rect x="2" y="6" width="34" height="7" rx="3.5" fill="#f48fb1"/>
        <rect x="-6" y="0" width="11" height="19" rx="4" fill="#f06c9b"/>
        <rect x="33" y="0" width="11" height="19" rx="4" fill="#f06c9b"/>
      </g></g>`;
    if (mood === "start") return `
      <g transform="translate(126,140)">
        <rect x="0" y="0" width="18" height="16" rx="3.5" fill="#fff"/>
        <rect x="0" y="0" width="18" height="5" rx="2.5" fill="#e8e2f4"/>
        <path d="M18 4 q8 2 0 9" fill="none" stroke="#fff" stroke-width="3.5"/>
        <g class="m-steam" fill="none" stroke="#cabfe8" stroke-width="2.6" stroke-linecap="round">
          <path d="M5 -5 q2.5 -3.5 0 -7"/><path d="M11 -4 q2.5 -3.5 0 -7"/>
        </g>
      </g>`;
    return "";
  }

  function svg(mood) {
    const body = fluff(85, 94, 59, 72, 13, 0.055);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 182" class="mascot-svg mood-${mood}" role="img" aria-label="Fluff the coach, feeling ${mood}">
      <defs>
        <radialGradient id="fluffGrad" cx="38%" cy="28%" r="85%">
          <stop offset="0%" stop-color="#b79bef"/>
          <stop offset="55%" stop-color="#8f6fdd"/>
          <stop offset="100%" stop-color="#6a4cc2"/>
        </radialGradient>
      </defs>
      <ellipse class="m-shadow" cx="85" cy="174" rx="46" ry="6" fill="#cfc4e8" opacity=".6"/>
      <g class="bun">
        <!-- hair tufts -->
        <path d="M68 26 q-2 -12 6 -16 q2 8 6 11 Z" fill="#8f6fdd"/>
        <path d="M82 22 q1 -13 10 -15 q0 9 4 13 Z" fill="#9d7ee4"/>
        <path d="M98 27 q4 -10 12 -10 q-2 8 1 13 Z" fill="#8466d4"/>
        <!-- feet -->
        <ellipse cx="64" cy="168" rx="14" ry="8" fill="#5e42b2"/>
        <ellipse cx="106" cy="168" rx="14" ry="8" fill="#5e42b2"/>
        <!-- fluffy body -->
        <path d="${body}" fill="url(#fluffGrad)"/>
        <!-- soft belly light + fur strokes -->
        <ellipse cx="78" cy="106" rx="34" ry="30" fill="#c0a8f2" opacity=".22"/>
        <g stroke="#cdbaf4" stroke-width="2.2" stroke-linecap="round" opacity=".5" fill="none">
          <path d="M38 64 q4 -6 10 -8"/><path d="M126 58 q5 3 7 9"/><path d="M44 132 q-5 -3 -7 -9"/>
        </g>
        ${face(mood)}
        ${extras(mood)}
      </g>
    </svg>`;
  }

  // Decide mood + message for a given day key.
  function assess(dayKey) {
    const r = window.S.days[dayKey];
    const logged = !!(r && (r.wake !== null || r.office || r.gymClass || r.steps10k || r.iron || r.b12 || r.vitd ||
      (r.foods && r.foods.length) || r.dilr || r.rc || r.aeon || (r.vocabPages || 0) > 0 || Object.keys(r.qa || {}).length));
    const score = window.Score.overallToday(dayKey);
    const isToday = dayKey === D.fmtKey(D.today());
    const hour = new Date().getHours();
    const v = Number(dayKey.slice(8, 10)) % 2; // alternate phrasings by date

    if (!logged) {
      if (isToday && hour < 12) return { mood: "start", head: v ? "Morning! Clean slate ☀️" : "Fresh day, fresh chances", sub: "Log your wake-up and let's get rolling. I'll be watching 👀" };
      if (isToday && hour < 18) return { mood: "ok", head: "Nothing logged yet today", sub: "No stress. One tap on any card below gets us started." };
      if (isToday) return { mood: "angry", head: "Empty day?! I brought the dumbbell", sub: "Rest days are fine, but I miss you already. Log ONE thing before bed." };
      return { mood: "sad", head: "This day went unlogged", sub: "It happens. The streak restarts the moment you log today." };
    }
    if (score >= 80) return { mood: "great", head: v ? `${score}% today. LET'S GO! 🎉` : `${score}%! Absolute machine`, sub: "This is exactly how CAT 2026 gets crushed. Same again tomorrow?" };
    if (score >= 60) return { mood: "happy", head: v ? `${score}% today, solid work!` : `${score}%! Doing my happy wiggle`, sub: "Push one more card above 80 and the sparkles come out." };
    if (score >= 40) return { mood: "ok", head: `${score}%. We move.`, sub: "Decent base. Pick the weakest card below and bump it before bed." };
    if (score >= 20) return { mood: "sad", head: `${score}%... I still believe in you`, sub: "Rough days happen. One small log right now turns the day around." };
    return { mood: "angry", head: `${score}%?! Grabbing my dumbbell`, sub: "Not shame, just fire. Easiest 10 points: vitamins plus a 10k-step walk." };
  }

  window.Mascot = { svg, assess };
})();
