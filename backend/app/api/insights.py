from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import InsightOut, SummaryOut
from ..services.insights_engine import compute_summary, generate_insights

router = APIRouter(prefix="/api", tags=["insights"])


@router.get("/summary", response_model=SummaryOut)
def get_summary(db: Session = Depends(get_db)):
    summary = compute_summary(db)
    insights = generate_insights(db)
    return {**summary, "insights": insights}


@router.get("/insights", response_model=List[InsightOut])
def get_insights(db: Session = Depends(get_db)):
    return generate_insights(db)
