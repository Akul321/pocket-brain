from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import get_current_user
from ..schemas import SimulateRequest, SimulateResult
from ..services.simulator_engine import run_simulation

router = APIRouter(prefix="/api", tags=["simulator"])


@router.post("/simulate", response_model=SimulateResult)
def simulate(
    payload: SimulateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return run_simulation(db, payload.dict(), current_user.id)
