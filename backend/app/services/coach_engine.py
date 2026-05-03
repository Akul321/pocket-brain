from collections import defaultdict
from typing import List
from sqlalchemy.orm import Session
from ..models import Transaction, Budget, Goal
from ..schemas import ChatMessage
from .insights_engine import get_current_month_str, get_month_transactions
from .groq_service import query_groq
from .ollama_service import query_ollama_chat

_MAX_HISTORY = 8  # keep last 8 messages (4 exchanges) to stay within free-tier token limits


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


def _build_system_prompt(ctx: dict) -> str:
    top = ctx["top_categories"]
    top_text = ", ".join(f"{c}: ₹{v:,.0f}" for c, v in top[:5]) if top else "none recorded"

    goals = ctx["goals"]
    if goals:
        goal_lines = []
        for g in goals[:4]:
            remaining = g.target_amount - g.current_amount
            months_left = (remaining / g.monthly_contribution) if g.monthly_contribution > 0 else None
            eta = f"~{months_left:.0f} months" if months_left else "no contribution set"
            goal_lines.append(f"  • {g.name}: ₹{remaining:,.0f} left ({eta})")
        goals_text = "\n".join(goal_lines)
    else:
        goals_text = "  • No goals set yet"

    budgets = ctx["budgets"]
    cat_totals = ctx["cat_totals"]
    if budgets:
        budget_lines = []
        for b in budgets:
            spent = cat_totals.get(b.category, 0)
            pct = (spent / b.monthly_limit * 100) if b.monthly_limit > 0 else 0
            status = "OVER" if spent > b.monthly_limit else f"{pct:.0f}%"
            budget_lines.append(f"  • {b.category}: ₹{spent:,.0f} / ₹{b.monthly_limit:,.0f} ({status})")
        budget_text = "\n".join(budget_lines)
    else:
        budget_text = "  • No budgets set yet"

    return f"""You are a sharp, data-driven personal finance coach inside the Pocket Brain app.
Rules:
- Only use numbers from the snapshot below. Never make up figures.
- Keep every reply under 120 words. Be direct and give one clear action.
- If asked something unrelated to finance, politely redirect.
- Currency: ₹ (Indian Rupees)

FINANCIAL SNAPSHOT ({ctx['month']}):
  Income:       ₹{ctx['income']:,.0f}
  Expenses:     ₹{ctx['expenses']:,.0f}
  Net Savings:  ₹{ctx['savings']:,.0f}
  Savings Rate: {ctx['savings_rate']:.1f}%

TOP SPENDING CATEGORIES:
{top_text}

GOALS:
{goals_text}

BUDGET STATUS:
{budget_text}"""


def _keyword_reply(message: str, ctx: dict) -> str:
    msg = message.lower().strip()
    income = ctx["income"]
    expenses = ctx["expenses"]
    savings = ctx["savings"]
    savings_rate = ctx["savings_rate"]
    cat_totals = ctx["cat_totals"]
    top_cats = ctx["top_categories"]
    goals = ctx["goals"]

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
                "Your spending looks reasonable. To save more, try automating a monthly transfer "
                "to a goal right after receiving your income. Even ₹500 extra/month compounds significantly."
            )
        return (
            f"To save more this month, consider: {', '.join(tips)}. "
            f"Combined, that could improve your savings by ₹{(food * 0.2 + shopping * 0.25):,.0f}/month."
        )

    if any(w in msg for w in ["reduce", "reduce first", "cut first", "priority"]):
        if not top_cats:
            return "No expense data found. Add transactions to get personalized advice."
        recs = [f"{c} (₹{v:,.0f})" for c, v in top_cats[:3]]
        return (
            f"Focus on reducing these categories first: {', '.join(recs)}. "
            f"Start with the highest amount — small cuts there have the biggest impact."
        )

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

    if any(w in msg for w in ["risk", "danger", "unsafe", "problem", "issue"]):
        risks = []
        if savings_rate < 10:
            risks.append(f"very low savings rate ({savings_rate:.1f}%)")
        if income > 0 and cat_totals.get("Subscriptions", 0) / income > 0.10:
            risks.append("high subscription burden (>10% of income)")
        if expenses > income:
            risks.append("spending exceeds income this month")
        if not risks:
            return "No major financial risks detected this month. Keep it up!"
        return f"Your biggest financial risks: {', '.join(risks)}. Check the Risk Radar for a full analysis."

    if any(w in msg for w in ["income", "earn", "salary", "revenue"]):
        return (
            f"Your recorded income this month is ₹{income:,.0f}. "
            f"After ₹{expenses:,.0f} in expenses, you have ₹{savings:,.0f} left — a {savings_rate:.1f}% savings rate."
        )

    return (
        f"Based on this month's data — income ₹{income:,.0f}, expenses ₹{expenses:,.0f}, "
        f"savings ₹{savings:,.0f} ({savings_rate:.1f}% rate). "
        f"Try asking: 'Where am I wasting money?', 'How can I save more?', or 'What is my biggest risk?'"
    )


async def generate_coach_reply(message: str, history: List[ChatMessage], db: Session) -> str:
    ctx = build_financial_context(db)
    system_prompt = _build_system_prompt(ctx)

    recent = history[-_MAX_HISTORY:]
    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": m.role, "content": m.content} for m in recent]
    messages.append({"role": "user", "content": message})

    # Try Groq (free tier cloud)
    reply = await query_groq(messages)
    if reply:
        return reply

    # Try Ollama (local)
    reply = await query_ollama_chat(messages)
    if reply:
        return reply

    # Fall back to keyword matching
    return _keyword_reply(message, ctx)
