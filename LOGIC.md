# Tanshi's 6-Month Sprint — How everything is calculated

A plain-English reference for every rule and formula the tracker currently uses.
Last updated: 27 Jun 2026.

---

## 1. The two headline numbers

**Overall Today** — how today went, scored out of 100, as a weighted mix of the 6 categories:

| Category | Weight |
|---|---|
| Study | 40% |
| Diet | 20% |
| Gym | 20% |
| Wake Up | 10% |
| Office | 5% |
| Vitamins | 5% |

- On an **off day** (Sunday, or 1st/3rd/5th Saturday), Office is excluded and the other weights re-balance so you're not penalised.
- **Week avg** shown under the ring = the same weighted score averaged across the current week.

**CAT Readiness** — exam-focused score, separate from daily habits:
`QA 40% + DILR 25% + RC/VARC 15% + Aeon/VARC-activity 10% + Wake-up consistency 10%`

---

## 2. Study (40% of the day)

Study is itself split:
- **QA = 50%** of study
- **DILR = 30%** of study
- **VARC block = 20%** of study, where the VARC block = average of **(VARC exercise + Vocab session + 20-min Reading)**, each counted yes/no. *(This is why logging Vocab or Reading moves your Overall score.)*

**Today's study credit:**
- **QA**: today's questions ÷ today's required pace (capped at 100). If pace can't be computed, any QA logged = 100.
- **DILR**: any DILR logged today = 100.
- **VARC block**: each of VARC / Vocab / Reading is 100 if done, then averaged.

### QA pacing (the important one)
- **Aim: 25 questions/day. Hard cap: 30/day** — the daily target is never higher than 30, no matter how much backlog builds up.
- Formula: `clamp(remaining ÷ days-left, 25, 30)`, never more than what's actually left.
- If you fall behind, the **finish date slides later** instead of the daily load spiking. ("Add a day to divide the load.")
- All QA is paced evenly to **31 August 2026** (the old June/July split was removed).
- **Per-topic breakdown**: the daily target is split across topics in order, capped at what's left in each — e.g. "Profit & Loss 7 + Simple Interest 18 = 25". A topic turns green when its share is done.
- **Skip / defer**: on the Study tab, "Skip" sets aside N questions of a chapter (they leave the daily plan but stay on record as "N deferred"); "Restore" brings them back.

### DILR (LR + DI) — one rotating topic per day
- Each day picks **one LR topic and one DI topic**, weighted so topics with **more questions remaining come up more often**. The pick is deterministic per day (stable for tap/undo).
- **1 set = 4 questions.** LR target ≈ 2 sets/day (8 Qs), DI ≈ 1 set/day (4 Qs), paced toward 31 Aug.

### VARC — one rotating topic per day
- One VARC topic picked daily (same weighted rotation), target ≈ 2 exercises.

### Vocab
- *Word Power Made Easy*, 1 session/day target (47 sessions total).

### Reading
- 20 min/day habit; weekly reading score = days with ≥20 min ÷ 7.

### Logging multiples
- Every study tile has a **− [count] +** stepper. **+** adds one unit (LR/DI step by a full set = 4 Qs; QA/VARC/Vocab by 1). You can also type a number directly.

---

## 3. Diet (20%)

- **Targets: 1200 kcal, 90g protein** (editable).
- Daily diet score = average of a calorie score and a protein score:

| Protein/day | Score | | Calories/day | Score |
|---|---|---|---|---|
| ≥90g | 100 | | ≤1300 | 100 |
| ≥80g | 90 | | ≤1400 | 90 |
| ≥70g | 75 | | ≤1500 | 75 |
| ≥60g | 50 | | ≤1700 | 50 |
| below | 25 | | above | 25 |

- A day with **no food logged is skipped** (not scored 0) in the weekly average.
- **Food database**: built-in Indian + gym + café foods, with a natural-language parser ("2 eggs", "rice and rajma"). Type a quantity and macros are auto-calculated.
- **Custom foods**: if a food isn't found, the search shows "➕ Add '<name>' yourself" → enter calories/protein → it logs *and* saves to your personal list for next time. There's also an "or enter your own" row for manual entry.

---

## 4. Gym (20%)

- Goal: **4 classes/week** (prorated to days available since plan start).
- **A gym class = full credit; a 10,000-step day = 25% credit** (¼ of a class). A day with a class counts once.
- Weekly gym score = (classes + step-days) ÷ weekly target.
- Class type (Legs, Arms & Chest, etc.) and calories burned are logged for record.

---

## 5. Wake Up (10%) — scored by *time*

The wake score depends on **when** you woke up (logged time), scaled to the 10% category:

| Wake time | Points |
|---|---|
| before 5:30 | 10 |
| 5:30 – 6:00 | 9 |
| 6:00 – 6:30 | 8 |
| 6:30 – 7:00 | 7 |
| 7:00 – 8:00 | 5 |
| 8:00 – 9:00 | 2 |
| after 9:00 | 0 |

- **Missed = 0.** "Woke up" with **no time logged = full credit** (10).
- Weekly wake score = average of daily wake points across the week.

---

## 6. Office (5%)

- **Working days** = all weekdays + 2nd/4th/5th Saturdays. **Off** = Sundays and 1st/3rd Saturdays.
- Score = days attended (Office or WFH) ÷ expected working days in the month (counted from plan start).
- **WFH cap: 2/month** (flagged red if exceeded).
- Off days are not expected and don't count against you.

---

## 7. Vitamins (5%)

- **Iron + B12 daily, Vitamin D once a week.**
- Weekly doses required = (2 × days available) + 1. Score = doses taken ÷ required.
- **Vitamin D** row hides once taken that week (shows only when due, or the day you took it).
- **Amla shot** is a yes/no log only — it does **not** affect the vitamin score.

---

## 8. Plan & calendar rules

- **Plan starts 15 June 2026.** Earlier dates are dropped; the calendar floors here but moves forward freely.
- Weekly/monthly targets are **prorated** — days before the plan start (or before today, this week) don't inflate the denominator.
- Deadlines: **QA → 31 Aug**, DILR & VARC → 31 Aug, Vocab → 3 Aug. CAT exam: **29 Nov 2026**.
- Already-done QA chapters at start: Averages, Percentages, Ratio-Proportion-Variation, Alligations.

---

## 9. The coach (Bun) 🐰

- Bun's message is **time-aware**: a low score in the **morning** is encouraging ("off to a good start"), afternoons are upbeat, evenings give a gentle nudge — only genuinely missed *past* days get a soft note. Strong scores celebrate any time.
- **Confetti** fires when you complete a study target (by tap or by hitting the count).

---

## 10. Data & safety

- **All data lives in your browser** (localStorage) — nothing is on GitHub (GitHub only hosts the app code). Data is tied to the website address.
- **Backups (3 layers):** a linked on-disk file (Chrome/Edge), rolling 7-day snapshots, and an auto-exported dated JSON to Downloads every ~3 days (rides your first tap, so Safari doesn't block it).
- **Export / Import** anytime from the header. Importing replaces current data with the file's.
- **Reset** requires typing DELETE and auto-downloads a backup first.
- The app loads fresh on every update (cache-busting), so new features appear without manual refresh.

---

## 11. 🎮 Game Mode

A play layer on top of the same scores — nothing about the categories above changes.

### Daily Quest — momentum
- The goal is to **improve on yesterday**, not hit 100%. The bigger the jump, the bigger the reward.
- **No 50% cliff** — every band earns: below 30% nothing · 30–49% half · 50%+ full · 80%+ bonus · 100% Mystery Chest.

### Fun Fund (one credit currency)
- A single credit **balance = total earned − total spent**. **Credits only count from the day Game Mode starts** (not retroactively from your whole history), so there's never a phantom balance.
- **You can only spend what you've banked** — no negative balance.
- **↺ Start fresh** (in the card) re-zeroes the balance and banks forward from today; your logged data is untouched.
- **Level** rises with lifetime credits earned (~every ₹1,000 = +1).

**Earning (scaled by today's band — ×0.5 in the 30–49% band):**
| Source | ₹ |
|---|---|
| Improved +5% / +10% / +20% over yesterday | +50 / +100 / +200 |
| Small gain, or held a solid 50%+ | +25 |
| 80%+ day | +50 · 100% day | +200 |
| Each combo | +25 |
| Streak milestones (3 / 5 / 10 / 20 days) | +150 / +200 / +500 / +1000 |
| Weekly quest hit (diet/study/gym/wake) | +200 / +300 / +250 / +150 |
| Monthly tier (Bronze/Silver/Gold/Diamond) | +300 / +600 / +1200 / +2000 |

### Spending (you set the amount)
- **No fixed prices.** Tap a chip (☕ Coffee · 🍰 Sweet Treat · 🥟 Momos · 🍔 Meal · 🛍️ Shopping · 💇 Salon · ✈️ Trip · ✨ Other) to fill the label, then **type the real ₹ you actually spent** and hit Spend.
- **Earn then spend:** you can only spend what you've banked — no overspending or going negative.
- Everything is logged with date + amount (undo ✕ refunds). The **Statement** is a dated bank statement of every earning **and** spend.

### 🐰 Bun the coach
Shows the **shortest path** to securing today's win (e.g. "25 more points → today's win · Quickest path: a 20-min read"), or "win secured" once you're there.

### ⏰ Near-Miss Save
After **8 PM**, if you're close to a win (within ~18 points), Bun offers one quick action (reading / 10k steps / wake-up / vitamins) to save the day.

### 🍀 Daily Buff
A different bonus each day (deterministic): **Reading pays +₹100** · **Combos pay double** · **+₹50 if you win** · **Gym/steps pays +₹75**.

### Streaks & Combos
- Streak = consecutive winning days; milestones at 3/5/10/20 pay out.
- Combos (auto, +₹25 each): 🏋️ Fitness (Gym+Diet) · 📚 Scholar (Study+Reading) · 🌅 Morning Warrior (Wake+Gym) · 🧠 Brain Day (QA+DILR+Reading) · 🥗 Clean Day (Calories+Protein) · ⚡ Productivity (Wake+Study).

### 🏅 Monthly Tiers
By % of winning days in the month: **Bronze 50% · Silver 65% · Gold 80% · Diamond 95%** — each banks an escalating bonus (₹300 / ₹600 / ₹1,200 / ₹2,000), and **Gold+ unlocks a 🍻 Night Out**. Needs at least 10 tracked days in the month before a tier is awarded.

### 🎲 Strategic Skip (smart)
Skip one category/day **if you compensate** (it then drops out of the day's scoring): Skip Gym → Diet 90+ / +20 QA / 2 DILR sets · Skip Diet → Gym/10k steps · Skip Study → Gym + Diet 90+. **Bun recommends** the safest skip based on what's already strong.

### 🛟 No Zero Days & 🩹 Recovery Mode
- A backup ladder per category so there's always an easy win (Gym → 10k steps → walk → stretch).
- After a 3+ day slump there's **no freeze or penalty** — instead it's a **Recovery Day**: today's win bar drops to **40%**. Clear that and you're back.

---

*This document describes the logic as configured on 30 Jun 2026, including Game Mode v2 (one credit currency, momentum, tiers, coach, buffs, recovery). If any rule changes, ask and I'll update this file.*
