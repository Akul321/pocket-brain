from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Goal
from ..schemas import GoalCreate, GoalUpdate, GoalOut

router = APIRouter(prefix="/api/goals", tags=["goals"])


def enrich_goal(g: Goal) -> GoalOut:
    remaining = g.target_amount - g.current_amount
    pct = (g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0
    estimated_months = None
    if g.monthly_contribution > 0 and remaining > 0:
        estimated_months = int(remaining / g.monthly_contribution) + 1

    suggestion = ""
    if g.monthly_contribution > 0 and remaining > 0:
        boost = g.monthly_contribution * 0.20
        new_months = remaining / (g.monthly_contribution + boost)
        curr_months = remaining / g.monthly_contribution
        diff = curr_months - new_months
        if diff >= 1:
            suggestion = f"Add ₹{boost:,.0f}/month to reach this goal {diff:.0f} month(s) earlier."
        else:
            suggestion = "You're on track! Keep contributing consistently."
    elif remaining <= 0:
        suggestion = "Goal achieved! 🎉"
    else:
        suggestion = "Set a monthly contribution to start tracking progress."

    return GoalOut(
        id=g.id,
        name=g.name,
        target_amount=g.target_amount,
        current_amount=g.current_amount,
        monthly_contribution=g.monthly_contribution,
        deadline=g.deadline,
        priority=g.priority,
        progress_pct=round(pct, 1),
        remaining_amount=round(remaining, 2),
        estimated_months=estimated_months,
        ai_suggestion=suggestion,
        created_at=g.created_at,
    )


@router.get("", response_model=List[GoalOut])
def list_goals(db: Session = Depends(get_db)):
    goals = db.query(Goal).order_by(Goal.created_at.desc()).all()
    return [enrich_goal(g) for g in goals]


@router.post("", response_model=GoalOut, status_code=201)
def create_goal(payload: GoalCreate, db: Session = Depends(get_db)):
    g = Goal(**payload.dict())
    db.add(g)
    db.commit()
    db.refresh(g)
    return enrich_goal(g)


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(goal_id: int, payload: GoalUpdate, db: Session = Depends(get_db)):
    g = db.query(Goal).filter(Goal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(g, field, value)
    db.commit()
    db.refresh(g)
    return enrich_goal(g)


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    g = db.query(Goal).filter(Goal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(g)
    db.commit()
