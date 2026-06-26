# StartSmart

A personal productivity application that helps people plan tasks, track focus time, and understand where their time really goes.

**Live Demo:** [https://start-smart-app.vercel.app](https://start-smart-app.vercel.app)
**GitHub:** [https://github.com/KarinLevy/StartSmart](https://github.com/KarinLevy/StartSmart)

---

## The Problem

Most productivity tools help you organize tasks. They do not help you understand why tasks take longer than expected, or how to improve your planning over time.

People — students, employees, freelancers, managers — consistently underestimate how long work takes. Tasks slip, deadlines approach unexpectedly, and no existing tool provides honest feedback on the gap between intention and reality.

---

## Target Audience

- Students managing coursework and deadlines
- Employees juggling multiple projects
- Freelancers tracking billable time
- Managers coordinating team work
- Anyone who struggles with procrastination, planning, or staying focused

---

## Competitor Analysis

| Competitor | What it offers | How StartSmart differs |
|---|---|---|
| Todoist | Excellent task management | StartSmart adds focus sessions, time tracking, and gap analysis |
| Notion | Flexible workspace | StartSmart provides a guided productivity experience with real data |
| Google Calendar | Calendar and scheduling | StartSmart combines scheduling with focus sessions and statistics |
| Toggl | Time tracking | StartSmart ties tracking directly to tasks with planning estimates |
| Excel / paper planner | Manual planning | StartSmart automates tracking, analytics, and personalised insights |

---

## What Makes StartSmart Different

StartSmart is built around the concept of the **Gap** — the difference between how long you estimate a task will take and how long it actually takes.

Every focus session captures this gap. Over time, patterns emerge. StartSmart surfaces those patterns through statistics, insights, and recommendations so that planning gradually improves — session by session, week by week.

---

## Live Demo

**URL:** [https://start-smart-app.vercel.app](https://start-smart-app.vercel.app)

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

![ERD](docs/ERD.png)

**Tables:** `profiles`, `tasks`, `task_tags`, `tags`, `time_logs`, `break_logs`, `notifications`, `user_settings`, `subscriptions`

**Storage buckets:** `avatars`

---

## Technologies

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
| Supabase Auth | User registration, login, password reset, JWT sessions |
| Supabase Storage | Avatar image uploads |
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
| Supabase Auth | Authentication service | User registration, login, JWT sessions, password reset emails |
| Supabase Storage | Object storage | Avatar image uploads and delivery |
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

| Feature | Status |
|---|---|
| Google Sign-In (OAuth) | Planned |
| Google Calendar Sync | Planned |
| AI Productivity Assistant | Planned |
| AI Weekly Reports | Planned |
| Premium subscription (Stripe) | Planned — UI exists, payment not wired |
| Motivation & Rewards System | Planned |
| Gift Card / Partner Store | Planned |
| Mobile app (React Native) | Planned |

---

## About the Developer

**Karin Levy** — Business Administration, Information Systems specialisation, Ono Academic College.

StartSmart was developed as a university Web Development course project and grew into a full production application. The motivation was personal: a real struggle with procrastination and time estimation that no existing tool addressed the way this one does.
