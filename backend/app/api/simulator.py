from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import SimulateRequest, SimulateResult
from ..services.simulator_engine import run_simulation

router = APIRouter(prefix="/api", tags=["simulator"])


@router.post("/simulate", response_model=SimulateResult)
def simulate(payload: SimulateRequest, db: Session = Depends(get_db)):
    return run_simulation(db, payload.dict())
