# StartSmart

StartSmart is a personal productivity application that goes beyond simple task management. It combines planning, scheduling, focus sessions, time tracking, and estimation analytics into one cohesive tool — so users can not only complete their work but gradually become better at planning it.

Most productivity apps help you organize what needs to be done. StartSmart also helps you understand how long things actually take, where time is lost, and how to plan more accurately next time. Every completed focus session feeds into a personal analytics layer that surfaces patterns, highlights gaps, and gives actionable recommendations.

The result is a tool that grows with you: the more you use it, the more useful the data becomes, and the more accurately you can plan your future work.

**Live Vercel:** [https://start-smart-app.vercel.app](https://start-smart-livid.vercel.app)
**GitHub:** [https://github.com/KarinLevy/StartSmart](https://github.com/KarinLevy/StartSmart)

---

## The Problem

Most people don't fail at productivity because they forget their tasks. They fail because they consistently underestimate how long tasks take. A task you estimate at 30 minutes takes 90. A project you plan for a week runs two. Over time, this gap between intention and reality creates stress, missed deadlines, and a growing distrust of your own planning.

Existing productivity tools — task managers, calendars, time trackers — solve pieces of this problem. But none of them close the loop. They don't show you how your estimates compared to reality, they don't help you spot patterns in your planning, and they don't get smarter the more you use them.

StartSmart was built specifically to solve this. It treats every completed task as useful data. It measures the gap between estimated and actual time, tracks it over time, and turns it into insights that make future planning more accurate.

---

## Target Audience

- **Students** — organize coursework, track study sessions, and prepare for exams with realistic time estimates
- **Employees** — manage daily workloads and build a clear picture of where working hours actually go
- **Freelancers** — improve project estimation accuracy and reduce the risk of underquoting time on client work
- **Managers** — gain better visibility into planning accuracy and understand where team time is being spent
- **Anyone who struggles with procrastination** — use structured focus sessions to build momentum and improve time awareness session by session

---

## Competitor Analysis

| Competitor | What it offers | How StartSmart differs |
|---|---|---|
| Todoist | Excellent task management | StartSmart adds focus sessions, time tracking, and gap analysis |
| Notion | Flexible workspace | StartSmart provides a guided productivity experience with real data |
| Google Calendar | Calendar and scheduling | StartSmart combines scheduling with focus sessions and statistics |
| Toggl | Time tracking | StartSmart ties tracking directly to tasks with planning estimates |
| Excel / paper planner | Manual planning | StartSmart automates tracking, analytics, and personalised insights |

Each of these tools solves part of the problem. Todoist organizes tasks. Toggl tracks time. Google Calendar schedules work. But none of them connect all three — plan, execute, and reflect — in a single loop. StartSmart is designed around that loop: plan a task with an estimate, execute it in a focus session, and immediately see how accurate the estimate was. Over time, this cycle builds better planning habits that no single-purpose tool can create.

---

## What Makes StartSmart Different

The core idea is simple: every completed task is more than a checkbox. It is a data point. StartSmart records the gap between how long you planned to work and how long you actually worked, then aggregates those gaps into statistics, trends, and personalised recommendations.

The goal is not just to manage your task list — it is to help you become a better planner. Over weeks and months, you start to see whether you consistently overestimate certain types of work, whether your accuracy improves on tasks you have done before, and what your most productive hours look like. That continuous feedback loop is what makes StartSmart different from any task manager or timer on its own.

---

## Live vercel

**URL:** [https://start-smart-app.vercel.app](https://start-smart-livid.vercel.app)

### Demo Account

A demo account is available with realistic tasks, statistics, achievements, and history.

| Field | Value |
|---|---|
| Email | demo@startsmart.app |
| Password | Demo2026! |

---

## Features

### Fully Implemented

- **Task Management** — Create, edit, delete tasks with title, description, estimated time, priority, tags, and scheduled date
- **Focus Mode** — Full-screen countdown timer; tracks actual vs estimated time; pause/resume/discard; saves time log to Supabase on finish
- **Schedule** — Daily timeline, weekly grid, monthly calendar; status/priority/tag filters; tag colour accents; RTL-aware navigation
- **Task History** — Read-only record of completed tasks; sort by date, A–Z, gap size, estimated/actual time; date-range filters; per-task reflection notes
- **Statistics** — Estimation accuracy, total focus time, average gap, productivity score; task breakdown table; time range filters (this week, last 30 days, all time, custom)
- **Insights** — Gap distribution, trend analysis, best/worst estimation, personalised recommendations
- **Dashboard** — Hero card showing active task, Priority Workflow table, Insight card
- **Notifications** — In-app notifications with unread count badge; mark all read
- **User Profile** — Avatar upload (Supabase Storage), bio, name, phone; password change modal; account deletion
- **Settings** — Theme toggle (light/dark), language switcher, focus/planning toggles, notification preferences
- **Achievements** — First task, 7-day streak, 90% accuracy, 100 tasks, study master, work champion
- **Multi-language** — English, Hebrew (RTL), Arabic (RTL), French, German, Russian
- **Dark Mode** — Full dark theme via CSS custom properties; respects `prefers-color-scheme`
- **Responsive Design** — Works from 375 px (iPhone SE) to desktop
- **Password Reset** — Full forgot-password + reset-password flow via Supabase Auth email links

---

## Entity Relationship Diagram

The database was designed in Supabase and includes normalized tables with defined relationships, primary keys, foreign keys, and Row Level Security policies that enforce per-user data isolation at the database level.

![ERD](docs/ERD.png)
<img width="2846" height="1808" alt="image" src="https://github.com/user-attachments/assets/70cb8db3-7783-488b-b21f-1b59ef6f64af" />


**Tables:** `profiles`, `tasks`, `task_tags`, `tags`, `time_logs`, `break_logs`, `notifications`, `user_settings`, `subscriptions`

**Storage buckets:** `avatars`

---

## Technologies

React was chosen for its component model and ecosystem, which made it practical to build a complex multi-page application with shared state. Supabase was selected because it provides a managed PostgreSQL database, authentication, and file storage in one platform — removing the need to build and maintain a separate backend. Vercel was chosen for deployment because it integrates directly with GitHub and handles builds, CDN, and HTTPS automatically.

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI component library |
| Vite | 8.x | Build tool and dev server |
| React Router DOM | 7.x | Client-side routing (SPA) |
| JavaScript (ES Modules) | — | Application language |
| CSS (custom properties) | — | Styling and design tokens |
| Material Symbols | CDN | Icon font |

### Backend & Database
| Technology | Purpose |
|---|---|
| Supabase | Backend as a Service — database, auth, storage |
| PostgreSQL | Relational database (managed by Supabase) |
| Supabase Auth | User registration, login, password reset, JWT sessions, and full session management |
| Supabase Storage | Avatar image uploads and delivery |
| Row Level Security (RLS) | Per-user data isolation at the database level |

### Deployment
| Technology | Purpose |
|---|---|
| Vercel | Hosting and CI/CD deployment |
| GitHub | Version control and source repository |

---

## External Services

| Service | Type | Purpose |
|---|---|---|
| Supabase | Backend as a Service | PostgreSQL database, authentication, file storage |
| Supabase Auth | Authentication service | Handles user registration, login, password recovery via email link, and JWT session management — no credentials are stored in the frontend |
| Supabase Storage | Object storage | Stores and serves user avatar images uploaded from the Profile page |
| Vercel | Deployment platform | Hosting, CDN, automatic deploys from GitHub |
| Material Symbols | CDN icon font | UI icons throughout the application |

---

## Architecture

```
src/
├── components/         # Shared UI components (Navbar, Footer, PageShell, TaskCards, Statistics)
├── context/            # React context providers (Auth, Tasks, Theme, Locale, Notifications, Profile)
├── i18n/               # Locale files (en, he, ar, fr, de, ru) + LocaleContext
├── lib/                # Supabase client
├── pages/              # One directory per route/page
│   ├── Auth/           # Shared auth CSS
│   ├── Dashboard/
│   ├── FocusMode/      # FocusPicker (select task) + FocusMode (active session)
│   ├── FooterPages/    # About, FAQ, Contact, HelpCenter, Privacy, Terms, Cookies, Accessibility
│   ├── ForgotPassword/
│   ├── ResetPassword/
│   ├── Insights/
│   ├── LandingPage/
│   ├── Login/
│   ├── Notifications/
│   ├── Premium/
│   ├── Profile/
│   ├── Register/
│   ├── Schedule/
│   ├── Settings/
│   ├── Statistics/
│   ├── TaskDetails/
│   └── TaskHistory/
├── services/           # Supabase data access (tasks, timeLogs, notifications, settings, user)
├── styles/             # Global CSS and design tokens
└── utils/              # Tag colours, achievement logic, formatting helpers
```

**State management:** React Context (no Redux). Auth state lives in `AuthContext`; tasks in `TasksContext` (real-time Supabase subscription); theme in `ThemeContext`; locale in `LocaleContext`.

**Routing:** React Router DOM v7 with `BrowserRouter`. Protected routes redirect unauthenticated users to `/login`. The `vercel.json` SPA rewrite ensures direct URL navigation does not return 404.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The `SUPABASE_SERVICE_ROLE_KEY` is only needed for the optional seed scripts (`npm run seed:demo`) and should never be committed.

---

## Installation

```bash
# Clone
git clone https://github.com/KarinLevy/StartSmart.git
cd StartSmart

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your Supabase project credentials

# Develop
npm run dev

# Build
npm run build
```

---

## Internationalization

StartSmart supports 6 languages with full RTL support for Hebrew and Arabic:

| Language | Code | Direction |
|---|---|---|
| English | en | LTR |
| Hebrew | he | RTL |
| Arabic | ar | RTL |
| French | fr | LTR |
| German | de | LTR |
| Russian | ru | LTR |

The language switcher is available on every page via the Navbar. Locale is persisted in `localStorage`. RTL layout is applied via `document.documentElement.dir = 'rtl'`.

---

## Security

- **Supabase Auth** — JWT-based sessions; passwords hashed by Supabase; no credentials stored in frontend
- **Row Level Security (RLS)** — Every Supabase table enforces per-user access; users can only read/write their own data
- **Protected routes** — Unauthenticated users are redirected to `/login` before any protected page renders
- **HTTPS** — Enforced by Vercel on all requests
- **Input validation** — Client-side validation on all forms; server rejects invalid data via Supabase constraints

---

## Accessibility

- Semantic HTML (`<main>`, `<nav>`, `<button>`, `<label>`, `<form>`)
- ARIA labels on icon-only buttons and status regions
- Keyboard navigation throughout; Space bar starts/pauses Focus Mode timer
- Focus indicators visible on all interactive elements
- Skip-navigation link in `index.html`
- Colour contrast meets WCAG AA in both light and dark themes
- Responsive layout from 375 px upward
- `aria-live` regions for timer and filter state changes

---

## Future Roadmap

The features below are planned for future development and are **not yet implemented**.

### AI Features
| Feature | Description |
|---|---|
| AI Productivity Assistant | Conversational assistant to help plan tasks and manage workload |
| AI Planning Assistant | Suggests realistic time estimates based on past performance |
| AI Recommendations | Personalised advice based on usage patterns and gap history |
| AI Weekly Summaries | Automated weekly report summarising productivity and trends |

### Google Integration
| Feature | Description |
|---|---|
| Google Sign-In | OAuth login with Google account |
| Google Calendar Sync | Two-way sync between StartSmart tasks and Google Calendar |

### Motivation & Rewards
| Feature | Description |
|---|---|
| Motivation System | Streaks, badges, and progress milestones |
| Rewards | Points earned for completing tasks and sessions |
| Partner Stores | Redeem points at partner retailers |
| Gift Cards | Digital gift cards as productivity rewards |

### Premium Subscription
| Feature | Description |
|---|---|
| Secure Online Payments | Stripe integration for subscription billing |
| Subscription Activation | Unlock premium features on payment |
| Premium Analytics | Advanced statistics, custom date ranges, export |

### Localization
| Feature | Description |
|---|---|
| Translation Refinement | Complete review and improvement of all 6 language files |
| Additional Languages | Support for Spanish, Italian, Portuguese, and others |

---

## About the Developer

**Karin Levy** — Business Administration, Information Systems specialisation, Ono Academic College.

StartSmart grew out of a personal problem. For years I struggled with procrastination and with consistently underestimating how long things take. I would plan my day optimistically, run out of time by early afternoon, and feel like I had achieved nothing — even on days when I had actually worked hard.

I looked for a tool that would help me understand this pattern and improve over time, not just one that would show me a list of tasks. I couldn't find one, so I built it.

The goal of StartSmart is not to turn users into productivity machines. It is to give people honest, useful feedback about how they actually spend their time — so they can gradually plan more realistically, feel less overwhelmed, and build habits that stick.
