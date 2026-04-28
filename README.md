# 🧠 Pocket Brain

**Your AI-powered money operating system.**

> Track spending · Plan goals · Simulate decisions · Get AI insights — all free, all local.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)](https://python.org)
[![SQLite](https://img.shields.io/badge/SQLite-local--first-orange)](https://sqlite.org)

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Setup — Backend](#setup--backend)
- [Setup — Frontend](#setup--frontend)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Free Resources Policy](#free-resources-policy)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Problem Statement

Most personal finance apps either:
- Cost money or require a credit card
- Require connecting your actual bank (privacy risk)
- Provide generic advice not based on your real data
- Have overwhelming, cluttered interfaces

Young professionals need a free, private, and intelligent tool to understand where their money goes.

---

## Solution

Pocket Brain is a local-first AI personal finance dashboard.

- **No paid APIs** — all intelligence is rule-based on your own data
- **No bank connection required** — manual entry or CSV upload
- **Privacy-first** — your data stays in a local SQLite database
- **Beautiful fintech-grade UI** — dark glassmorphism design

---

## Features

| Feature | Description |
|---|---|
| 📊 Dashboard | Income, expenses, savings rate, risk level at a glance |
| 💳 Transactions | Add, edit, delete, search, filter, and sort transactions |
| 📁 CSV Import/Export | Bulk import from bank exports, export anytime |
| 🤖 AI Categorization | Rule-based auto-categorizer (Swiggy → Food, Uber → Transport) |
| 📈 Budget Planner | Set per-category limits with animated progress bars |
| 🎯 Goals | Track savings goals with progress rings and AI suggestions |
| 🧠 AI Money Coach | Chat-style interface answering questions from your real data |
| 🔬 What-If Simulator | Model purchases, income changes, and spending cuts before committing |
| 🛡 Risk Radar | Real-time risk score with detailed breakdown and recommendations |
| ⚙️ Settings | Profile, currency, data reset, CSV export |

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Recharts (charts)
- Lucide React (icons)
- Zustand / Context (state)
- React Hot Toast (notifications)

**Backend**
- Python 3.11+
- FastAPI
- SQLAlchemy (ORM)
- SQLite (database)
- Pydantic v2 (validation)
- Pandas (CSV parsing)

**AI / Logic**
- Rule-based categorization engine
- Deterministic insight engine
- Rule-based coach Q&A (no paid LLM)
- Optional: Ollama local LLM support

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     POCKET BRAIN                         │
│                                                         │
│  ┌──────────────────┐        ┌─────────────────────┐   │
│  │   Next.js 14     │        │    FastAPI Backend   │   │
│  │   Frontend       │◄──────►│    Python 3.11+      │   │
│  │                  │  HTTP  │                      │   │
│  │  - Dashboard     │        │  - Transactions API  │   │
│  │  - Transactions  │        │  - Budgets API       │   │
│  │  - Budgets       │        │  - Goals API         │   │
│  │  - Goals         │        │  - Insights Engine   │   │
│  │  - AI Coach      │        │  - Coach Engine      │   │
│  │  - Simulator     │        │  - Simulator Engine  │   │
│  │  - Risk Radar    │        │  - Risk Engine       │   │
│  │  - Settings      │        │                      │   │
│  └──────────────────┘        └─────────┬───────────┘   │
│                                        │                │
│                               ┌────────▼────────┐      │
│                               │   SQLite DB      │      │
│                               │  pocket_brain.db │      │
│                               └─────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
pocket-brain/
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── .gitignore
├── screenshots/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py          # FastAPI app, startup, CORS
│       ├── database.py      # SQLAlchemy engine + session
│       ├── models.py        # DB table definitions
│       ├── schemas.py       # Pydantic I/O models
│       ├── seed.py          # Demo data seeding
│       ├── api/
│       │   ├── transactions.py
│       │   ├── budgets.py
│       │   ├── goals.py
│       │   ├── insights.py
│       │   ├── coach.py
│       │   ├── simulator.py
│       │   └── risk.py
│       └── services/
│           ├── categorizer.py      # Rule-based AI categorizer
│           ├── insights_engine.py  # AI insight generator
│           ├── coach_engine.py     # Chat coach logic
│           ├── simulator_engine.py # What-If computation
│           ├── risk_engine.py      # Risk score computation
│           ├── csv_service.py      # CSV import/export
│           └── ollama_service.py   # Optional local LLM
└── frontend/
    ├── package.json
    ├── tailwind.config.ts
    ├── next.config.js
    ├── tsconfig.json
    ├── .env.example
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx             # Landing page
    │   ├── dashboard/page.tsx
    │   ├── transactions/page.tsx
    │   ├── budgets/page.tsx
    │   ├── goals/page.tsx
    │   ├── coach/page.tsx
    │   ├── simulator/page.tsx
    │   ├── risk/page.tsx
    │   └── settings/page.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   └── Topbar.tsx
    │   ├── ui/
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Modal.tsx
    │   │   └── SkeletonCard.tsx
    │   └── dashboard/
    │       ├── MetricCard.tsx
    │       ├── InsightPanel.tsx
    │       ├── SpendingChart.tsx
    │       └── TrendChart.tsx
    └── lib/
        ├── api.ts
        ├── utils.ts
        └── types.ts
```

---

## Setup — Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate       # Linux/macOS
.venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

The database is created automatically on first run. Demo data is seeded automatically.

Visit: http://localhost:8000/docs for the interactive API docs.

---

## Setup — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Visit: http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=sqlite:///./pocket_brain.db
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/summary` | Dashboard summary + insights |
| GET | `/api/insights` | AI insights list |
| GET | `/api/profile` | User profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/transactions` | List transactions (filterable) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| POST | `/api/transactions/import` | CSV import |
| GET | `/api/transactions/export` | CSV export |
| GET | `/api/budgets` | List budgets with spending |
| POST | `/api/budgets` | Create/update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |
| GET | `/api/goals` | List goals with projections |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/{id}` | Update goal |
| DELETE | `/api/goals/{id}` | Delete goal |
| POST | `/api/coach` | AI coach response |
| POST | `/api/simulate` | What-If simulation |
| GET | `/api/risk` | Risk score and breakdown |
| POST | `/api/reset-demo` | Reset to demo data |

---

## Deployment

### Frontend — Vercel (Free)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → Select `frontend/` as root
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url`
4. Deploy

### Backend — Railway / Render (Free tier)

**Railway:**
```bash
railway init
railway up
```

**Render:**
1. New Web Service → connect repo
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Hugging Face Spaces (Docker):**
1. Create a new Space → Docker
2. Upload `backend/` contents
3. The `Dockerfile` handles the rest

### Local (No deployment)
```bash
# Terminal 1 — backend
cd backend && uvicorn app.main:app --reload

# Terminal 2 — frontend
cd frontend && npm run dev
```

---

## Free Resources Policy

Pocket Brain is committed to being 100% free:

- ✅ No OpenAI API
- ✅ No paid bank APIs (Plaid, etc.)
- ✅ No paid hosting required
- ✅ No credit card setup
- ✅ SQLite — no cloud database
- ✅ All icons from Lucide React (MIT)
- ✅ All UI components built from scratch

---

## Roadmap

- [ ] Multi-user support with auth
- [ ] Recurring transaction detection
- [ ] Bank CSV format templates (HDFC, SBI, Kotak)
- [ ] Mobile app (React Native)
- [ ] Ollama chat integration
- [ ] Tax filing summary
- [ ] Net worth tracker

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

---

## License

[MIT](LICENSE)

---

## Author

Built by **Akul Ramesh**

> Pocket Brain provides educational financial insights and planning simulations.
> It does not provide professional financial, investment, tax, or legal advice.
