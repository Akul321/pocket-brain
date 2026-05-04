from collections import defaultdict
from typing import Optional
from sqlalchemy.orm import Session
from ..models import Transaction, Goal
from .insights_engine import get_active_month, get_month_transactions


def run_simulation(db: Session, params: dict, user_id: Optional[int] = None) -> dict:
    month = get_active_month(db, user_id)
    txns = get_month_transactions(db, month, user_id)

    income = sum(t.amount for t in txns if t.type == "income")
    expenses = sum(t.amount for t in txns if t.type == "expense")

    cat_totals = defaultdict(float)
    for t in txns:
        if t.type == "expense":
            cat_totals[t.category] += t.amount

    sim_income = income + params.get("income_change", 0)
    sim_expenses = expenses + params.get("expense_change", 0) + params.get("one_time_purchase", 0)

    category = params.get("category")
    reduction_pct = params.get("category_reduction_pct", 0)
    if category and reduction_pct > 0:
        sim_expenses -= cat_totals.get(category, 0) * (reduction_pct / 100)

    sim_expenses += params.get("goal_contribution_change", 0)

    sim_savings = sim_income - sim_expenses
    sim_savings_rate = (sim_savings / sim_income * 100) if sim_income > 0 else 0
    curr_savings = income - expenses
    curr_savings_rate = (curr_savings / income * 100) if income > 0 else 0

    curr_risk = _risk_level(curr_savings_rate)
    sim_risk = _risk_level(sim_savings_rate)

    if sim_risk == curr_risk:
        risk_change = f"Risk stays {curr_risk}"
    elif sim_risk == "Low":
        risk_change = f"Risk improves from {curr_risk} to Low"
    elif sim_risk == "High":
        risk_change = f"Risk worsens from {curr_risk} to High"
    else:
        risk_change = f"Risk changes from {curr_risk} to {sim_risk}"

    delta = sim_savings - curr_savings
    if delta > 0:
        recommendation = f"This scenario improves your savings by ₹{delta:,.0f}/month. Go for it!"
    elif delta == 0:
        recommendation = "No net change in savings. This decision is neutral."
    else:
        recommendation = f"This reduces your savings by ₹{abs(delta):,.0f}/month. Ensure you have enough buffer before proceeding."

    return {
        "current_savings": round(curr_savings, 2),
        "simulated_savings": round(sim_savings, 2),
        "current_savings_rate": round(curr_savings_rate, 1),
        "simulated_savings_rate": round(sim_savings_rate, 1),
        "current_cash_left": round(curr_savings, 2),
        "simulated_cash_left": round(sim_savings, 2),
        "risk_change": risk_change,
        "recommendation": recommendation,
    }


def _risk_level(savings_rate: float) -> str:
    if savings_rate < 10:
        return "High"
    if savings_rate < 20:
        return "Medium"
    return "Low"
