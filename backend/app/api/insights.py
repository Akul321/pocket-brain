from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User
from ..auth import get_current_user
from ..schemas import InsightOut, SummaryOut
from ..services.insights_engine import compute_summary, generate_insights

router = APIRouter(prefix="/api", tags=["insights"])


@router.get("/summary", response_model=SummaryOut)
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    summary = compute_summary(db, current_user.id)
    insights = generate_insights(db, current_user.id)
    return {**summary, "insights": insights}


@router.get("/insights", response_model=List[InsightOut])
def get_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return generate_insights(db, current_user.id)
