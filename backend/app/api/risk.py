from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import get_current_user
from ..schemas import RiskOut
from ..services.risk_engine import compute_risk

router = APIRouter(prefix="/api", tags=["risk"])


@router.get("/risk", response_model=RiskOut)
def get_risk(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return compute_risk(db, current_user.id)
