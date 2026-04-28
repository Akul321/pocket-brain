# Contributing to Pocket Brain

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Guidelines

- Keep all dependencies free and open source
- No paid APIs (OpenAI, Plaid, etc.)
- Follow the existing code style
- Test your changes before submitting a PR
- Add a clear description to your PR

## PR Checklist

- [ ] Code runs without errors
- [ ] No console errors in the browser
- [ ] No paid services added
- [ ] Changes are scoped and focused

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser / OS / Python version
