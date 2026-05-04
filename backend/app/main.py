from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

load_dotenv()

from .database import engine, get_db, Base
from . import models
from .seed import seed_demo_data
from .auth import get_current_user
from .api import transactions, budgets, goals, insights, coach, simulator, risk
from .api.auth import router as auth_router
from .models import UserProfile, User
from .schemas import UserProfileCreate, UserProfileOut

Base.metadata.create_all(bind=engine)


def _run_migrations():
    from sqlalchemy import text
    with engine.connect() as conn:
        for table, col, definition in [
            ("transactions", "payment_method", "TEXT DEFAULT 'Other'"),
            ("transactions", "recurring", "TEXT DEFAULT 'no'"),
            ("transactions", "user_id", "INTEGER"),
            ("user_profiles", "user_id", "INTEGER"),
            ("budgets", "user_id", "INTEGER"),
            ("goals", "user_id", "INTEGER"),
            ("insight_cache", "user_id", "INTEGER"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {definition}"))
                conn.commit()
            except Exception:
                pass


_run_migrations()

app = FastAPI(title="Pocket Brain API", version="2.0.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://pocket-brain.vercel.app",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(insights.router)
app.include_router(coach.router)
app.include_router(simulator.router)
app.include_router(risk.router)


@app.get("/")
def health():
    return {"status": "ok", "app": "Pocket Brain API", "version": "2.0.0"}


@app.get("/api/profile", response_model=UserProfileOut)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return profile


@app.put("/api/profile", response_model=UserProfileOut)
def update_profile(
    payload: UserProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id, **payload.dict())
        db.add(profile)
    else:
        for k, v in payload.dict().items():
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile


class InitRequest(BaseModel):
    mode: str  # "fresh" or "demo"


@app.post("/api/init")
def init_app(
    payload: InitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from .models import Transaction, Budget, Goal
    db.query(Transaction).filter(Transaction.user_id == current_user.id).delete()
    db.query(Budget).filter(Budget.user_id == current_user.id).delete()
    db.query(Goal).filter(Goal.user_id == current_user.id).delete()
    db.commit()
    if payload.mode == "demo":
        seed_demo_data(db, user_id=current_user.id)
    return {"status": "ok", "mode": payload.mode}


@app.post("/api/reset-demo")
def reset_demo(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from .models import Transaction, Budget, Goal
    db.query(Transaction).filter(Transaction.user_id == current_user.id).delete()
    db.query(Budget).filter(Budget.user_id == current_user.id).delete()
    db.query(Goal).filter(Goal.user_id == current_user.id).delete()
    db.commit()
    seed_demo_data(db, user_id=current_user.id)
    return {"status": "reset complete"}
