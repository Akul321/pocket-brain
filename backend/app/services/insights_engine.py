from datetime import date, timedelta
from collections import defaultdict
from typing import List, Dict
from sqlalchemy.orm import Session
from ..models import Transaction, Budget, Goal, UserProfile


def get_current_month_str() -> str:
    today = date.today()
    return today.strftime("%Y-%m")


def get_month_transactions(db: Session, month_str: str) -> List[Transaction]:
    year, month = map(int, month_str.split("-"))
    return (
        db.query(Transaction)
        .filter(
            Transaction.date >= date(year, month, 1),
            Transaction.date
            < (
                date(year, month + 1, 1)
                if month < 12
                else date(year + 1, 1, 1)
            ),
        )
        .all()
    )


def get_prev_month_str(month_str: str) -> str:
    year, month = map(int, month_str.split("-"))
    if month == 1:
        return f"{year - 1}-12"
    return f"{year}-{month - 1:02d}"


def compute_summary(db: Session) -> dict:
    month = get_current_month_str()
    txns = get_month_transactions(db, month)
    income = sum(t.amount for t in txns if t.type == "income")
    expenses = sum(t.amount for t in txns if t.type == "expense")
    savings = income - expenses
    savings_rate = (savings / income * 100) if income > 0 else 0
    cash_left = savings

    category_totals: Dict[str, float] = defaultdict(float)
    for t in txns:
        if t.type == "expense":
            category_totals[t.category] += t.amount
    top_category = max(category_totals, key=category_totals.get) if category_totals else "N/A"

    risk_level = "Low"
    if savings_rate < 10:
        risk_level = "High"
    elif savings_rate < 20:
        risk_level = "Medium"

    return {
        "monthly_income": income,
        "monthly_expenses": expenses,
        "net_savings": savings,
        "savings_rate": round(savings_rate, 1),
        "cash_left": cash_left,
        "risk_level": risk_level,
        "top_category": top_category,
    }


def generate_insights(db: Session) -> List[dict]:
    insights = []
    month = get_current_month_str()
    prev_month = get_prev_month_str(month)

    curr_txns = get_month_transactions(db, month)
    prev_txns = get_month_transactions(db, prev_month)

    curr_income = sum(t.amount for t in curr_txns if t.type == "income")
    curr_expenses = sum(t.amount for t in curr_txns if t.type == "expense")
    curr_savings = curr_income - curr_expenses
    savings_rate = (curr_savings / curr_income * 100) if curr_income > 0 else 0

    curr_by_cat: Dict[str, float] = defaultdict(float)
    prev_by_cat: Dict[str, float] = defaultdict(float)
    for t in curr_txns:
        if t.type == "expense":
            curr_by_cat[t.category] += t.amount
    for t in prev_txns:
        if t.type == "expense":
            prev_by_cat[t.category] += t.amount

    # Savings rate health
    if savings_rate >= 20:
        insights.append({
            "text": f"Your savings rate is {savings_rate:.1f}% this month — excellent financial health!",
            "severity": "success",
            "insight_type": "savings_health",
        })
    elif savings_rate >= 10:
        insights.append({
            "text": f"Your savings rate is {savings_rate:.1f}%. Aim for 20%+ for strong financial health.",
            "severity": "warning",
            "insight_type": "savings_health",
        })
    else:
        insights.append({
            "text": f"Your savings rate is only {savings_rate:.1f}%. This is a risk — try to cut expenses.",
            "severity": "danger",
            "insight_type": "savings_health",
        })

    # Month-over-month category spikes
    for cat, curr_val in curr_by_cat.items():
        prev_val = prev_by_cat.get(cat, 0)
        if prev_val > 0:
            change_pct = ((curr_val - prev_val) / prev_val) * 100
            if change_pct >= 20:
                insights.append({
                    "text": f"{cat} spending increased by {change_pct:.0f}% compared to last month (₹{curr_val:,.0f} vs ₹{prev_val:,.0f}).",
                    "severity": "warning",
                    "insight_type": "category_spike",
                })

    # Subscription burden
    sub_total = curr_by_cat.get("Subscriptions", 0)
    if curr_income > 0 and sub_total / curr_income > 0.10:
        insights.append({
            "text": f"Subscriptions are {sub_total / curr_income * 100:.1f}% of your income (₹{sub_total:,.0f}). Consider auditing them.",
            "severity": "warning",
            "insight_type": "subscription_burden",
        })

    # Food delivery insight
    food_total = curr_by_cat.get("Food", 0)
    if food_total > 0 and curr_expenses > 0:
        food_pct = food_total / curr_expenses * 100
        if food_pct > 20:
            save_estimate = food_total * 0.20
            insights.append({
                "text": f"Food is {food_pct:.0f}% of expenses (₹{food_total:,.0f}). Cutting by 20% saves ₹{save_estimate:,.0f}/month.",
                "severity": "warning",
                "insight_type": "food_spending",
            })

    # Budget warnings
    budgets = db.query(Budget).filter(Budget.month == month).all()
    for b in budgets:
        spent = curr_by_cat.get(b.category, 0)
        pct = (spent / b.monthly_limit * 100) if b.monthly_limit > 0 else 0
        if pct > 100:
            insights.append({
                "text": f"{b.category} is ₹{spent - b.monthly_limit:,.0f} over budget ({pct:.0f}% used).",
                "severity": "danger",
                "insight_type": "budget_exceeded",
            })
        elif pct > 80:
            insights.append({
                "text": f"You've used {pct:.0f}% of your {b.category} budget. ₹{b.monthly_limit - spent:,.0f} remaining.",
                "severity": "warning",
                "insight_type": "budget_near_limit",
            })

    # Goal acceleration
    goals = db.query(Goal).all()
    for g in goals:
        remaining = g.target_amount - g.current_amount
        if g.monthly_contribution > 0 and remaining > 0:
            months_left = remaining / g.monthly_contribution
            boost = g.monthly_contribution * 0.20
            new_months = remaining / (g.monthly_contribution + boost)
            saved_months = months_left - new_months
            if saved_months >= 1:
                insights.append({
                    "text": f"Add ₹{boost:,.0f}/month to '{g.name}' and reach it {saved_months:.0f} month(s) earlier.",
                    "severity": "info",
                    "insight_type": "goal_acceleration",
                })

    # Emergency fund warning
    emergency_goals = [g for g in goals if "emergency" in g.name.lower()]
    if not emergency_goals:
        insights.append({
            "text": "No emergency fund goal found. Aim for 3–6 months of expenses as a safety net.",
            "severity": "warning",
            "insight_type": "emergency_fund",
        })

    return insights[:6]
