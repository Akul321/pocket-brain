from collections import defaultdict
from typing import Optional
from sqlalchemy.orm import Session
from ..models import Transaction, Budget, Goal
from .insights_engine import get_active_month, get_month_transactions, get_prev_month_str


def compute_risk(db: Session, user_id: Optional[int] = None) -> dict:
    month = get_active_month(db, user_id)
    prev_month = get_prev_month_str(month)

    curr_txns = get_month_transactions(db, month, user_id)
    prev_txns = get_month_transactions(db, prev_month, user_id)

    income = sum(t.amount for t in curr_txns if t.type == "income")
    expenses = sum(t.amount for t in curr_txns if t.type == "expense")
    savings = income - expenses
    savings_rate = (savings / income * 100) if income > 0 else 0
    prev_expenses = sum(t.amount for t in prev_txns if t.type == "expense")

    cat_totals = defaultdict(float)
    for t in curr_txns:
        if t.type == "expense":
            cat_totals[t.category] += t.amount

    goal_q = db.query(Goal)
    if user_id is not None:
        goal_q = goal_q.filter(Goal.user_id == user_id)
    goals = goal_q.all()

    budget_q = db.query(Budget).filter(Budget.month == month)
    if user_id is not None:
        budget_q = budget_q.filter(Budget.user_id == user_id)
    budgets = budget_q.all()

    risks = []
    score = 100

    if savings_rate < 10:
        risks.append({"label": "Critical savings rate", "detail": f"Savings rate is {savings_rate:.1f}% (below 10% threshold)", "severity": "danger"})
        score -= 25
    elif savings_rate < 20:
        risks.append({"label": "Low savings rate", "detail": f"Savings rate is {savings_rate:.1f}% — aim for 20%+", "severity": "warning"})
        score -= 10

    if income > 0 and expenses / income > 0.90:
        risks.append({"label": "High expense ratio", "detail": f"Expenses are {expenses / income * 100:.0f}% of income", "severity": "danger"})
        score -= 20
    elif income > 0 and expenses / income > 0.80:
        risks.append({"label": "Elevated expense ratio", "detail": f"Expenses are {expenses / income * 100:.0f}% of income", "severity": "warning"})
        score -= 10

    subs = cat_totals.get("Subscriptions", 0)
    if income > 0 and subs / income > 0.10:
        risks.append({"label": "High subscription burden", "detail": f"Subscriptions are ₹{subs:,.0f} ({subs / income * 100:.1f}% of income)", "severity": "warning"})
        score -= 10

    if not any("emergency" in g.name.lower() for g in goals):
        risks.append({"label": "No emergency fund", "detail": "No emergency fund goal found. Aim for 3–6 months of expenses.", "severity": "warning"})
        score -= 10

    if prev_expenses > 0:
        mom_growth = ((expenses - prev_expenses) / prev_expenses) * 100
        if mom_growth > 20:
            risks.append({"label": "Spending spike", "detail": f"Expenses grew {mom_growth:.0f}% vs last month", "severity": "warning"})
            score -= 10

    for b in budgets:
        spent = cat_totals.get(b.category, 0)
        if spent > b.monthly_limit:
            risks.append({"label": f"{b.category} over budget", "detail": f"₹{spent - b.monthly_limit:,.0f} over the limit", "severity": "danger"})
            score -= 8

    for g in goals:
        remaining = g.target_amount - g.current_amount
        if g.monthly_contribution > 0 and remaining > 0 and g.deadline:
            from datetime import date
            months_to_deadline = max(0, (g.deadline.year - date.today().year) * 12 + (g.deadline.month - date.today().month))
            months_needed = remaining / g.monthly_contribution
            if months_needed > months_to_deadline:
                risks.append({"label": f"Goal delay: {g.name}", "detail": f"At current pace you'll miss the deadline by {months_needed - months_to_deadline:.0f} month(s)", "severity": "warning"})
                score -= 5

    score = max(0, min(100, score))
    level = "Low" if score >= 75 else "Medium" if score >= 45 else "High"

    recommendations = []
    for r in risks:
        if r["severity"] == "danger":
            recommendations.append(f"Urgent: address '{r['label']}' immediately.")
        else:
            recommendations.append(f"Consider: fix '{r['label']}' to improve financial health.")
    if not recommendations:
        recommendations.append("No major risks detected. Keep up the great financial habits!")

    return {"score": score, "level": level, "risks": risks, "recommendations": recommendations[:5]}
