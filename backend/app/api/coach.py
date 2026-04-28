from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import CoachRequest, CoachResponse
from ..services.coach_engine import generate_coach_reply

router = APIRouter(prefix="/api", tags=["coach"])


@router.post("/coach", response_model=CoachResponse)
def ask_coach(payload: CoachRequest, db: Session = Depends(get_db)):
    reply = generate_coach_reply(payload.message, db)
    return {"reply": reply}
