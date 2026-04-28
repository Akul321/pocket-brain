from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import RiskOut
from ..services.risk_engine import compute_risk

router = APIRouter(prefix="/api", tags=["risk"])


@router.get("/risk", response_model=RiskOut)
def get_risk(db: Session = Depends(get_db)):
    return compute_risk(db)
