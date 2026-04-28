from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os

from .database import engine, get_db, Base
from . import models
from .seed import seed_demo_data
from .api import transactions, budgets, goals, insights, coach, simulator, risk
from .models import UserProfile
from .schemas import UserProfileCreate, UserProfileOut

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pocket Brain API", version="1.0.0", description="AI-powered personal finance API")

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

app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(insights.router)
app.include_router(coach.router)
app.include_router(simulator.router)
app.include_router(risk.router)


@app.on_event("startup")
def startup_event():
    pass  # Users choose fresh or demo on first visit


@app.get("/")
def health():
    return {"status": "ok", "app": "Pocket Brain API", "version": "1.0.0"}


@app.get("/api/profile", response_model=UserProfileOut)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    return profile


@app.put("/api/profile", response_model=UserProfileOut)
def update_profile(payload: UserProfileCreate, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile(**payload.dict())
        db.add(profile)
    else:
        for k, v in payload.dict().items():
            setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile


class InitRequest(BaseModel):
    mode: str  # "fresh" or "demo"
    name: str = "User"
    currency: str = "₹"
    monthly_income_target: float = 50000.0


@app.post("/api/init")
def init_app(payload: InitRequest, db: Session = Depends(get_db)):
    from .models import Transaction, Budget, Goal, UserProfile
    db.query(Transaction).delete()
    db.query(Budget).delete()
    db.query(Goal).delete()
    db.query(UserProfile).delete()
    db.commit()
    if payload.mode == "demo":
        seed_demo_data(db, name=payload.name, currency=payload.currency,
                       monthly_income_target=payload.monthly_income_target)
    else:
        profile = UserProfile(name=payload.name, currency=payload.currency,
                              monthly_income_target=payload.monthly_income_target)
        db.add(profile)
        db.commit()
    return {"status": "ok", "mode": payload.mode}


@app.post("/api/reset-demo")
def reset_demo(db: Session = Depends(get_db)):
    from .models import Transaction, Budget, Goal, UserProfile
    profile = db.query(UserProfile).first()
    name = profile.name if profile else "Demo User"
    currency = profile.currency if profile else "₹"
    income = profile.monthly_income_target if profile else 50000.0
    db.query(Transaction).delete()
    db.query(Budget).delete()
    db.query(Goal).delete()
    db.query(UserProfile).delete()
    db.commit()
    seed_demo_data(db, name=name, currency=currency, monthly_income_target=income)
    return {"status": "reset complete"}
