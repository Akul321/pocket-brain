from collections import defaultdict
from datetime import date
from typing import List
from sqlalchemy.orm import Session
from ..models import Transaction, Budget, Goal
from .insights_engine import get_current_month_str, get_month_transactions


def build_financial_context(db: Session) -> dict:
    month = get_current_month_str()
    txns = get_month_transactions(db, month)

    income = sum(t.amount for t in txns if t.type == "income")
    expenses = sum(t.amount for t in txns if t.type == "expense")
    savings = income - expenses
    savings_rate = (savings / income * 100) if income > 0 else 0

    cat_totals = defaultdict(float)
    for t in txns:
        if t.type == "expense":
            cat_totals[t.category] += t.amount

    top_categories = sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)
    goals = db.query(Goal).all()
    budgets = db.query(Budget).filter(Budget.month == month).all()

    return {
        "income": income,
        "expenses": expenses,
        "savings": savings,
        "savings_rate": savings_rate,
        "cat_totals": dict(cat_totals),
        "top_categories": top_categories,
        "goals": goals,
        "budgets": budgets,
        "month": month,
    }


def generate_coach_reply(message: str, db: Session) -> str:
    ctx = build_financial_context(db)
    msg = message.lower().strip()

    income = ctx["income"]
    expenses = ctx["expenses"]
    savings = ctx["savings"]
    savings_rate = ctx["savings_rate"]
    cat_totals = ctx["cat_totals"]
    top_cats = ctx["top_categories"]
    goals = ctx["goals"]

    # --- Waste / overspending ---
    if any(w in msg for w in ["wasting", "waste", "unnecessary", "avoidable", "cut"]):
        if not top_cats:
            return "I don't see any expense data for this month yet. Add some transactions first!"
        top_name, top_val = top_cats[0]
        second = f" and {top_cats[1][0]} (₹{top_cats[1][1]:,.0f})" if len(top_cats) > 1 else ""
        saving_est = top_val * 0.20
        return (
            f"Your highest spending categories are {top_name} (₹{top_val:,.0f}){second}. "
            f"Reducing {top_name} by just 20% would save ₹{saving_est:,.0f}/month. "
            f"Subscriptions and food delivery are usually the easiest to trim."
        )

    # --- Afford a purchase ---
    if any(w in msg for w in ["afford", "buy", "purchase", "can i get"]):
        if savings <= 0:
            return (
                f"Right now your savings are ₹{savings:,.0f}, which means you're running tight. "
                f"I'd recommend waiting until you have at least 1–2 months of expenses saved before a large purchase."
            )
        return (
            f"You have ₹{savings:,.0f} in net savings this month. "
            f"For any purchase, check that it doesn't drop your savings rate below 10%. "
            f"Your current savings rate is {savings_rate:.1f}%. Use the What-If Simulator to model the impact."
        )

    # --- Save more ---
    if any(w in msg for w in ["save more", "saving more", "increase savings", "how to save"]):
        food = cat_totals.get("Food", 0)
        shopping = cat_totals.get("Shopping", 0)
        subs = cat_totals.get("Subscriptions", 0)
        tips = []
        if food > 3000:
            tips.append(f"reduce food delivery by ₹{food * 0.2:,.0f}")
        if shopping > 2000:
            tips.append(f"cut shopping by ₹{shopping * 0.25:,.0f}")
        if subs > 1000:
            tips.append(f"audit subscriptions (currently ₹{subs:,.0f}/month)")
        if not tips:
            return (
                f"Your spending looks reasonable. To save more, try automating a monthly transfer "
                f"to a goal right after receiving your income. Even ₹500 extra/month compounds significantly."
            )
        return (
            f"To save more this month, consider: {', '.join(tips)}. "
            f"Combined, that could improve your savings by ₹{(food * 0.2 + shopping * 0.25):,.0f}/month."
        )

    # --- What to reduce ---
    if any(w in msg for w in ["reduce", "reduce first", "cut first", "priority"]):
        if not top_cats:
            return "No expense data found. Add transactions to get personalized advice."
        recs = [f"{c} (₹{v:,.0f})" for c, v in top_cats[:3]]
        return (
            f"Focus on reducing these categories first: {', '.join(recs)}. "
            f"Start with the highest amount — small cuts there have the biggest impact."
        )

    # --- Budget realistic ---
    if any(w in msg for w in ["budget", "realistic", "on track", "budget check"]):
        budgets = ctx["budgets"]
        if not budgets:
            return "You haven't set any budgets yet. Head to the Budget Planner to set limits per category."
        over = []
        for b in budgets:
            spent = cat_totals.get(b.category, 0)
            if spent > b.monthly_limit:
                over.append(f"{b.category} (over by ₹{spent - b.monthly_limit:,.0f})")
        if over:
            return f"These categories are over budget: {', '.join(over)}. Adjust spending or revise your limits."
        return "You're within budget for all tracked categories this month. Great discipline!"

    # --- Goal timeline ---
    if any(w in msg for w in ["goal", "goals", "target", "when will i", "how long"]):
        if not goals:
            return "You haven't set any goals yet. Go to the Goals page to add them."
        replies = []
        for g in goals[:3]:
            remaining = g.target_amount - g.current_amount
            if g.monthly_contribution > 0:
                months = remaining / g.monthly_contribution
                replies.append(f"'{g.name}': ₹{remaining:,.0f} left, ~{months:.0f} months at current pace")
            else:
                replies.append(f"'{g.name}': ₹{remaining:,.0f} remaining (no monthly contribution set)")
        return "Goal progress:\n" + "\n".join(replies)

    # --- Biggest risk ---
    if any(w in msg for w in ["risk", "danger", "unsafe", "problem", "issue"]):
        risks = []
        if savings_rate < 10:
            risks.append(f"very low savings rate ({savings_rate:.1f}%)")
        if cat_totals.get("Subscriptions", 0) / income > 0.10 if income > 0 else False:
            risks.append("high subscription burden (>10% of income)")
        if expenses > income:
            risks.append("spending exceeds income this month")
        if not risks:
            return "No major financial risks detected this month. Keep it up!"
        return f"Your biggest financial risks: {', '.join(risks)}. Check the Risk Radar for a full analysis."

    # --- Income ---
    if any(w in msg for w in ["income", "earn", "salary", "revenue"]):
        return (
            f"Your recorded income this month is ₹{income:,.0f}. "
            f"After ₹{expenses:,.0f} in expenses, you have ₹{savings:,.0f} left — a {savings_rate:.1f}% savings rate."
        )

    # --- Default fallback ---
    return (
        f"Based on this month's data — income ₹{income:,.0f}, expenses ₹{expenses:,.0f}, "
        f"savings ₹{savings:,.0f} ({savings_rate:.1f}% rate). "
        f"Try asking: 'Where am I wasting money?', 'How can I save more?', or 'What is my biggest risk?'"
    )
