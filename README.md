# CAT 2026 Performance OS

A zero-build, offline personal tracker for CAT 2026 prep plus health habits. Apple-inspired light UI, all data stays in your browser (localStorage). Export a JSON backup any time from the header.

## Run it

No build step, no dependencies. Either:

```bash
cd ~/Desktop/cat-tracker
python3 -m http.server 4183
# open http://127.0.0.1:4183
```

or just double-click `index.html` (works over `file://` in Chrome/Safari).

## What it tracks

| Category | Weight | Rule |
|---|---|---|
| Study | 40% | QA 50 / DILR 30 / VARC 20 inside study |
| Diet | 20% | 1200 kcal / 90g protein targets, tiered scoring |
| Gym | 20% | 4 classes/week, 10k-step day = 25% credit |
| Wake Up | 10% | successful days / 7 |
| Office | 5% | attendance / expected working days (Sun + 1st/3rd Sat off, WFH cap 2/month) |
| Vitamins | 5% | Iron x7 + B12 x7 + Vitamin D x1 = 15 weekly doses |

**CAT Readiness Score** (the headline number): QA 40% + DILR 25% + RC 15% + Aeon essays 10% + wake-up consistency 10%.

## Tabs

- **Today**: one-tap daily logging with a "today's overall score" ring (weekly average shown alongside). Wake-up, office status, gym (with class type: Legs, Arms and Chest, Chest and Back, Full Body Burn, Yoga, Dance Fitness), vitamins, diet split into Breakfast / Lunch / Evening Snacks / Dinner (type "rice and rajma" and it logs two separate items with macros from a built-in 130-item Indian food database), a dedicated QA window (chapter logging now, detailed module planned), and a study log: DILR sets, RCs, Aeon essay or Norman Lewis vocab pages (either satisfies the same daily reading slot).
- **Study**: QA chapter manager (total, done, % complete, remaining, required pace/day, projected finish date from your last-14-day pace), DILR and VARC weekly history.
- **Dashboard**: daily activity flow, weekly rhythm radar, weekly totals, month heatmap, ranked categories.
- **Reports**: toggle between the Weekly Report (category deltas vs last week, Weekly Wins, Areas to Improve, Next Week Focus) and the Monthly Report (trends vs previous month, week-by-week, momentum).

## Files

| File | Owns |
|---|---|
| `index.html` | shell + load order |
| `styles.css` | design tokens, light Apple theme |
| `foods.js` | food database + natural-language entry parser |
| `core.js` | state, persistence, date utils, full scoring engine |
| `charts.js` | dependency-free SVG rings, line/bar charts, radar |
| `app.js` | all four tabs, rendering and events |

## Notes & assumptions

- A 10k-step day earns the same 25% credit as one gym class (per "10,000 steps = 25% gym credit"); a day with both counts once.
- Days with no food logged are excluded from the weekly diet average rather than scored 0.
- An Aeon essay or any Norman Lewis vocab pages count as the same daily reading habit (7 days/week goal); pages are also totalled weekly.
- "Overall Today" scores just the selected day (gym class = 100, steps-only = 25; office is skipped and weights renormalize on off days; QA measured against the summed required pace of open chapters). The weekly/monthly spec formulas still drive CAT Readiness and the Reports tab.
- Unknown foods fall back to manual calorie/protein entry.
- Deleting a chapter keeps its logged questions in daily history but stops counting them.
