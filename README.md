# Gravio 🪐
### Your Academic Command Center

> *"I didn't build Gravio because I had it all figured out. I built it because I wish it existed when I didn't."*

**[Live Demo →](https://ufidtech.github.io/gravio/)**

---

## What is Gravio?

Gravio is a mobile-first web app that helps Nigerian university students take control of their CGPA. Most CGPA tools only tell you where you are. Gravio tells you **what you need to do from here.**

It combines four tools in one:

- **📊 Live GPA Calculator** — Add courses and grades. Your semester GPA and cumulative CGPA recalculate on every keystroke, no button press needed.
- **🪐 Orbit Planner** — The exact GPA you must average per remaining semester to graduate at your target class. Powered by a weighted quality-points formula.
- **🛡️ The Pledge** — Write your academic commitments before semester starts. Sign them — they lock. Review them at the end of semester, kept or broken.
- **👤 Academic Profile** — Your complete semester history, color-coded by GPA strength. Export your data as JSON anytime.

---

## The Orbit Formula

This is the mathematical core of Gravio. It answers the question students actually need answered:

```
totalQPDone      = currentCGPA × unitsDone
totalUnitsAtGrad = unitsDone + remainingUnits
totalQPNeeded    = targetCGPA × totalUnitsAtGrad
qpStillNeeded    = totalQPNeeded − totalQPDone
neededGPA        = qpStillNeeded ÷ remainingUnits
```

The result is color-coded:
- 🟢 **≤ 4.0** — On Track
- 🟢 **≤ 4.5** — Achievable
- 🟡 **≤ 5.0** — Difficult
- 🔴 **> 5.0** — Not Possible

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Structure | HTML5 | Semantic, no build step needed |
| Styling | CSS3 + Custom Properties | Full design system in variables.css |
| Logic | Vanilla JavaScript (ES6) | Classes, modules, no framework overhead |
| Persistence | localStorage | Data stays on the user's device, works offline |
| Fonts | DM Sans + DM Mono | Clean UI text + monospace for GPA numbers |

No frameworks. No libraries. No build tools. Open `index.html` and it runs.

---

## File Structure

```
gravio/
├── index.html                  ← Landing page (entry point)
├── dashboard.html              ← Home screen / dashboard
├── css/
│   ├── variables.css           ← All design tokens (colors, spacing, radius)
│   ├── base.css                ← Reset, app shell, typography
│   ├── components.css          ← Full component library
│   └── animations.css          ← Keyframes and transition classes
├── js/
│   ├── landing.js              ← Landing page behaviour + smart routing
│   ├── classes/
│   │   ├── Course.js           ← creditUnits, grade, getQualityPoints()
│   │   ├── Semester.js         ← courses[], getSemesterGPA(), toJSON()
│   │   ├── Student.js          ← calculateCGPA(), getRecoveryPath()
│   │   └── Pledge.js           ← rules[], signPledge(), keptCount
│   └── modules/
│       ├── storage.js          ← saveStudent(), loadSemesters(), exportAllData()
│       ├── calculator.js       ← calcSemesterGPA(), calcCumulativeCGPA()
│       └── router.js           ← checkSession(), getTimeGreeting()
└── pages/
    ├── onboarding.html         ← 3-step first-time setup
    ├── calculator.html         ← Live GPA calculator
    ├── orbit.html              ← Recovery path planner
    ├── pledge.html             ← Write → Signed → Review flow
    └── profile.html            ← History, edit, export, reset
```

---

## How to Run Locally

No installation. No npm. No terminal needed.

1. Download or clone this repository
2. Open `index.html` in any browser
3. That's it

```bash
git clone https://github.com/ufidtech/gravio.git
cd gravio
# Open index.html in your browser
```

---

## Architecture Decisions

**Why ES6 classes?**
Each data model — `Course`, `Semester`, `Student`, `Pledge` — owns its own logic and knows how to serialize itself. `Course.getQualityPoints()` lives on Course. `Student.getRecoveryPath()` lives on Student. This makes the code readable and testable without a framework.

**Why localStorage over a backend?**
Gravio is a personal tool, like a notes app. Your academic data is private. A backend would require auth, hosting costs, and an internet connection. localStorage means zero friction, zero cost, and it works offline on any device. Data export is available as JSON if you ever want to move it.

**Why no framework?**
This is a learning project built to demonstrate understanding of the fundamentals — DOM manipulation, event handling, state management, modular JS. Using React or Vue would have hidden exactly the skills this project is meant to show.

---

## localStorage Keys

All data is prefixed `gravio_*` for clean identification and reset.

| Key | Value | Description |
|---|---|---|
| `gravio_student` | JSON object | Student profile from onboarding |
| `gravio_semesters` | JSON array | All saved semesters with courses |
| `gravio_pledges` | JSON array | All signed pledges with review results |

---

## Design System

The entire visual language lives in `css/variables.css`.

```css
--g-bg:        #0A2218;   /* Page background */
--g-bg-card:   #112B1E;   /* Cards and panels */
--g-bg-raised: #0F3525;   /* Active states */
--g-accent:    #4ECCA3;   /* Primary teal — CTAs, key numbers */
--g-amber:     #F5A623;   /* Warning — Difficult Orbit status */
--g-red:       #E85555;   /* Danger — Not Possible, Reset */
--g-text:      #E8F5F0;   /* Primary text */
--g-muted:     #7AB89A;   /* Secondary text, labels */
```

---

## Test Results

The GPA calculator and Orbit formula were verified against 13 test cases:

| Test | Result |
|---|---|
| Mixed grades (A, B, C) | ✅ Pass |
| All A grades → 5.00 | ✅ Pass |
| All F grades → 0.00 (NaN guard) | ✅ Pass |
| Empty course list → 0 | ✅ Pass |
| E grade (1 point) — often missed | ✅ Pass |
| Invalid grade character → 0 QP | ✅ Pass |
| Floating point precision (3.89) | ✅ Pass |
| CGPA with baseline + saved + live | ✅ Pass |
| Brand new student (0 units) | ✅ Pass |
| Onboarding-only, no new semesters | ✅ Pass |
| Rounding drift over 8 semesters | ✅ Pass |
| Target already reached | ✅ Pass |
| Realistic 300L scenario | ✅ Pass |

---

## Roadmap

These are planned for future versions — not in the MVP:

- [ ] Multi-device sync with a real backend (Supabase or Firebase)
- [ ] Push notifications before assignment and exam deadlines  
- [ ] Semester-over-semester CGPA trend chart
- [ ] Degree class probability calculator
- [ ] Shareable Orbit card for social media

---

## About the Builder

Built by **Umar Farooq Ibrahim Danjuma**  
300 Level · Computer Science · Federal University of Technology, Minna (FUTMinna)

I built Gravio during my 300L year because I needed it and it didn't exist. The Orbit formula came from a real question I couldn't answer: *"If I work hard from today, can I still graduate with a First Class?"* Gravio answers that question.

---

## License

MIT License — free to use, modify, and build on.

---

*Built with HTML, CSS, and Vanilla JavaScript. No frameworks were harmed in the making of this project.*
