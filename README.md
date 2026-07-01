# StartSmart

StartSmart is a personal productivity application that goes beyond simple task management. It combines planning, scheduling, focus sessions, time tracking, and estimation analytics into one cohesive tool — so users can not only complete their work but gradually become better at planning it.

Most productivity apps help you organize what needs to be done. StartSmart also helps you understand how long things actually take, where time is lost, and how to plan more accurately next time. Every completed focus session feeds into a personal analytics layer that surfaces patterns, highlights gaps, and gives actionable recommendations.

The result is a tool that grows with you: the more you use it, the more useful the data becomes, and the more accurately you can plan your future work.

In addition to helping users organize their work, StartSmart encourages long-term habit building through focus sessions, achievements, productivity insights, progress tracking, and continuous feedback. Rather than simply managing tasks, the application helps users reduce procrastination, improve planning accuracy, and stay motivated as they build better productivity habits over time.


**Live Vercel:** [https://start-smart-livid.vercel.app](https://start-smart-livid.vercel.app)
**GitHub:** [https://github.com/KarinLevy/StartSmart](https://github.com/KarinLevy/StartSmart)

---

## The Problem

Most people don’t struggle with productivity because they forget what they need to do. They struggle because they procrastinate, lose focus, and consistently underestimate how long tasks actually take.
A task estimated at 30 minutes often takes 90. A project planned for one week stretches into two. Over time, this gap between intention and reality leads to stress, missed deadlines, reduced motivation, and a growing lack of confidence in one’s ability to plan effectively.
Existing productivity tools help users organize tasks, schedule events, or track time, but they rarely address the complete productivity cycle. They do not explain why plans fail, how procrastination affects productivity, or how planning accuracy improves over time.
StartSmart was built to solve exactly this challenge. Every completed task becomes meaningful data. The application measures the gap between estimated and actual time, identifies productivity patterns, encourages users to stay focused, and provides insights that help them build better planning habits while maintaining motivation.

---

## Target Audience

- **Students** — organize study sessions, assignments, and exam preparation while improving time estimation.
- **Employees** — manage daily responsibilities, meetings, and workloads more effectively.
- **Managers** — monitor planning accuracy and improve team productivity through better organization.
- **Freelancers** — estimate project durations more accurately and track working time.
- **Parents** — balance personal responsibilities, work, and family tasks using structured planning and focus sessions.
- **Anyone who wants better focus and time management** — reduce procrastination, improve productivity, and build sustainable habits over time.

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

The core idea behind StartSmart is that every completed task is more than a checkbox — it becomes valuable data.
The application records the gap between estimated and actual time, analyzes long-term productivity trends, and transforms them into meaningful statistics and personalized recommendations.
Unlike traditional task managers, StartSmart encourages users to stay motivated throughout their productivity journey. Focus Sessions, achievements, productivity insights, progress tracking, and positive feedback help users build better habits instead of simply checking off completed tasks.
The goal is not only to organize work, but to reduce procrastination, improve planning accuracy, strengthen focus, and increase motivation through continuous feedback and measurable progress.

---

## Live vercel

**URL:** [https://start-smart-livid.vercel.app](https://start-smart-livid.vercel.app)

### Demo Account

A demo account is available with realistic tasks, statistics, achievements, and history.

| Field | Value |
|---|---|
| Email | demo@startsmart.app |
| Password | Demo2026! |


The demo account includes preloaded tasks, completed focus sessions, statistics, achievements, notifications, and historical data, allowing the application’s core features to be explored immediately.

---

## Features

### Fully Implemented

- **Task Management** — Create, edit, delete tasks with title, description, estimated time, priority, tags, and scheduled date
- **Focus Mode** — Full-screen countdown timer, tracks actual vs estimated time, pause/resume/discard, saves time log to Supabase on finish
- **Schedule** — Daily timeline, weekly grid, monthly calendar, status/priority/tag filters, tag colour accents, RTL-aware navigation
- **Task History** — Read-only record of completed tasks, sort by date, A–Z, gap size, estimated/actual time, date-range filters, per-task reflection notes
- **Statistics** — Estimation accuracy, total focus time, average gap, productivity score, task breakdown table, time range filters (this week, last 30 days, all time, custom)
- **Insights** — Gap distribution, trend analysis, best/worst estimation, personalised recommendations
- **Dashboard** — Hero card showing active task, Priority Workflow table, Insight card
- **Notifications** — In-app notifications with unread count badge, mark all read
- **User Profile** — Avatar upload (Supabase Storage), bio, name, phone, secure password change with current-password verification, account deletion
- **Settings** — Theme toggle, language switcher, notification preferences, Google Calendar connection management, sync status, reconnect and disconnect controls
- **Achievements** — First task, 7-day streak, 90% accuracy, 100 tasks, study master, work champion
- **Multi-language** — English, Hebrew (RTL), Arabic (RTL), French, German, Russian
- **Dark Mode** — Full dark theme via CSS custom properties, respects `prefers-color-scheme`
- **Responsive Design** — Works from 375 px (iPhone SE) to desktop
- **Password Reset** — Full forgot-password + reset-password flow via Supabase Auth email links
- **Google Authentication** — Secure sign-in with Google OAuth using Supabase Auth
- **Google Calendar Integration** (Read-only) — Optional connection to Google Calendar with explicit user consent, upcoming events are displayed inside the Schedule and Settings pages without modifying the user's calendar

---

## Entity Relationship Diagram

The database was designed in Supabase and includes normalized tables with defined relationships, primary keys, foreign keys, and Row Level Security policies that enforce per-user data isolation at the database level.


<img width="2846" height="1808" alt="image" src="https://github.com/user-attachments/assets/70cb8db3-7783-488b-b21f-1b59ef6f64af" />


**Tables:** `profiles`, `tasks`, `task_tags`, `tags`, `time_logs`, `break_logs`, `notifications`, `user_settings`, `subscriptions`

**Storage buckets:** `avatars`

---

## Technologies

React was chosen for its component model and ecosystem, which made it practical to build a complex multi-page application with shared state. Supabase was selected because it provides a managed PostgreSQL database, authentication, file storage, and OAuth integration in one platform — removing the need to build and maintain a separate backend. Vercel was chosen for deployment because it integrates directly with GitHub and handles builds, CDN, and HTTPS automatically. Google OAuth and the Google Calendar API were integrated to provide optional calendar connectivity while keeping user data secure.

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
| Supabase | Backend as a Service — database, authentication, storage, and OAuth integration |
| PostgreSQL | Relational database (managed by Supabase) |
| Supabase Auth | Email/password authentication, Google OAuth, password reset, JWT sessions, and session management |
| Supabase Storage | Secure avatar image uploads and delivery |
| Row Level Security (RLS) | Per-user data isolation enforced at the database level |
| Google OAuth 2.0 | Secure authentication with Google accounts |
| Google Calendar API | Optional read-only synchronization of upcoming Google Calendar events |

### Deployment
| Technology | Purpose |
|---|---|
| Vercel | Hosting and CI/CD deployment |
| GitHub | Version control and source repository |

---

### External Services

| Service | Type | Purpose |
|---|---|---|
| Supabase | Backend as a Service | PostgreSQL database, authentication, storage, and security |
| Supabase Auth | Authentication service | Email/password authentication, Google OAuth, password recovery, JWT session management |
| Supabase Storage | Object storage | Stores and serves user avatar images |
| Google OAuth 2.0 | OAuth provider | Secure Google authentication |
| Google Calendar API | External API | Optional read-only synchronization of upcoming calendar events |
| Vercel | Deployment platform | Hosting, CDN, HTTPS, automatic deployments from GitHub |
| Material Symbols | CDN icon font | UI icons throughout the application |

---

## Architecture

```

src/
├── components/         # Shared UI components (Navbar, Footer, PageShell, TaskCards, Statistics, Google Calendar UI)
├── context/            # React context providers (Auth, Tasks, Theme, Locale, Regional, Notifications, Profile, Calendar)
├── i18n/               # Locale files (en, he, ar, fr, de, ru) + LocaleContext
├── lib/                # Supabase client configuration
├── pages/              # One directory per route/page
│   ├── Auth/           # Shared authentication CSS
│   ├── Dashboard/
│   ├── FocusMode/      # FocusPicker + active focus session timer
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
│   ├── Schedule/       # Daily, weekly, monthly schedule + Google Calendar event display
│   ├── Settings/       # Preferences, language/theme settings, Google Calendar connection management
│   ├── Statistics/
│   ├── TaskDetails/
│   └── TaskHistory/
├── services/           # Data/API services (tasks, time logs, notifications, settings, user, Google Calendar)
├── styles/             # Global CSS and design tokens
└── utils/              # Tag colours, achievements, date/time formatting, analytics helpers
```

**State management:** React Context (no Redux). Auth state lives in `AuthContext`, tasks in `TasksContext` (real-time Supabase subscriptions), theme in `ThemeContext`, locale in `LocaleContext`, and Google Calendar state in `CalendarContext`.

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

The application supports both Left-to-Right (LTR) and Right-to-Left (RTL) layouts, automatically adapting the interface based on the selected language. Hebrew and Arabic are displayed in RTL, while English, French, German, and Russian use LTR layouts.
The selected language is stored in localStorage, allowing the application to remember the user’s preference across future visits.
StartSmart currently supports six languages, with most of the interface fully localized. As part of the project’s ongoing development, localization will continue to be refined by completing the remaining interface translations and improving language-specific layouts and user experience across all supported languages.
---


## Security

- **Supabase Auth** — Secure JWT-based authentication with email/password and Google OAuth. Passwords are hashed and managed entirely by Supabase.
- **Row Level Security (RLS)** — Every database table enforces per-user access, ensuring users can only access their own data.
- **Protected Routes** — Unauthenticated users are redirected to the login page before protected content is rendered.
- **Subscription Protection** — Database policies prevent users from upgrading their own subscription from the client. Subscription changes require privileged backend access.
- **Secure Password Reset** — Password reset uses Supabase email recovery with email enumeration protection, expired-link detection, and localized validation.
- **Password Change Verification** — Users must verify their current password before changing it.
- **Avatar Storage Security** — Avatar uploads are protected by Supabase Storage policies, allowing users to upload only their own files.
- **Google OAuth Security** — Signing in with Google does not automatically grant Google Calendar access. Calendar permissions are requested only after the user explicitly chooses to connect Google Calendar.
- **Google Calendar Privacy** — Google Calendar events are accessed in read-only mode. No Google Calendar data or OAuth tokens are permanently stored in the application database.
- **HTTPS** — All production traffic is encrypted using HTTPS provided by Vercel.
- **Input Validation** — Client-side validation is performed on all forms, while Supabase enforces additional database constraints.

---

## Accessibility

- Semantic HTML (`<main>`, `<nav>`, `<button>`, `<label>`, `<form>`)
- ARIA labels on icon-only buttons and status regions
- Keyboard navigation throughout, Space bar starts/pauses Focus Mode timer
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
| Export Tasks to Google Calendar | Create Google Calendar events directly from scheduled StartSmart tasks |
| Google Calendar Two-Way Sync | Keep StartSmart tasks and Google Calendar synchronized |
| Google Meet Integration | Create Google Meet links for scheduled tasks |

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

**StartSmart was developed as a final project for the AI-Based Product Development course at Ono Academic College.**
