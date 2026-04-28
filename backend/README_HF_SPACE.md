---
title: Pocket Brain API
emoji: 🧠
colorFrom: green
colorTo: emerald
sdk: docker
pinned: false
short_description: AI-powered personal finance API — FastAPI + SQLite
---

# Pocket Brain — Backend API

FastAPI backend for the [Pocket Brain](https://github.com/Akul321/pocket-brain) personal finance dashboard.

## Endpoints

- `GET /` — health check
- `GET /api/summary` — dashboard summary + AI insights
- `GET /api/transactions` — list/filter transactions
- `POST /api/transactions` — create transaction
- `GET /api/budgets` — budgets with spending
- `GET /api/goals` — goals with projections
- `POST /api/coach` — AI money coach response
- `POST /api/simulate` — what-if simulation
- `GET /api/risk` — risk score and breakdown

## Notes

- Data is stored in `/data/pocket_brain.db` (SQLite)
- Enable **Persistent Storage** in Space settings to keep data across restarts
- Set `ALLOWED_ORIGINS` in Space secrets to match your Vercel frontend URL
