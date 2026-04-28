from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from collections import defaultdict
from ..database import get_db
from ..models import Budget, Transaction
from ..schemas import BudgetCreate, BudgetOut
from ..services.insights_engine import get_current_month_str, get_month_transactions

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


def enrich_budget(budget: Budget, cat_totals: dict) -> BudgetOut:
    spent = cat_totals.get(budget.category, 0)
    remaining = budget.monthly_limit - spent
    pct = (spent / budget.monthly_limit * 100) if budget.monthly_limit > 0 else 0
    if pct > 100:
        status = "over"
    elif pct > 80:
        status = "near"
    else:
        status = "safe"
    return BudgetOut(
        id=budget.id,
        category=budget.category,
        monthly_limit=budget.monthly_limit,
        month=budget.month,
        spent=round(spent, 2),
        remaining=round(remaining, 2),
        percentage=round(pct, 1),
        status=status,
        created_at=budget.created_at,
    )


@router.get("", response_model=List[BudgetOut])
def list_budgets(db: Session = Depends(get_db)):
    month = get_current_month_str()
    budgets = db.query(Budget).filter(Budget.month == month).all()
    txns = get_month_transactions(db, month)
    cat_totals: dict = defaultdict(float)
    for t in txns:
        if t.type == "expense":
            cat_totals[t.category] += t.amount
    return [enrich_budget(b, cat_totals) for b in budgets]


@router.post("", response_model=BudgetOut, status_code=201)
def create_or_update_budget(payload: BudgetCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(Budget)
        .filter(Budget.category == payload.category, Budget.month == payload.month)
        .first()
    )
    if existing:
        existing.monthly_limit = payload.monthly_limit
        db.commit()
        db.refresh(existing)
        budget = existing
    else:
        budget = Budget(**payload.dict())
        db.add(budget)
        db.commit()
        db.refresh(budget)

    txns = get_month_transactions(db, payload.month)
    cat_totals: dict = defaultdict(float)
    for t in txns:
        if t.type == "expense":
            cat_totals[t.category] += t.amount
    return enrich_budget(budget, cat_totals)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    b = db.query(Budget).filter(Budget.id == budget_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b)
    db.commit()
