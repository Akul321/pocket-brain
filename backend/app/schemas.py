from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class UserProfileBase(BaseModel):
    name: str
    currency: str = "₹"
    monthly_income_target: float = 50000.0


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileOut(UserProfileBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    date: date
    description: str
    amount: float = Field(gt=0)
    type: str
    category: str
    notes: Optional[str] = ""


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None


class TransactionOut(TransactionBase):
    id: int
    ai_note: str = ""
    created_at: datetime

    class Config:
        from_attributes = True


class BudgetBase(BaseModel):
    category: str
    monthly_limit: float = Field(gt=0)
    month: str


class BudgetCreate(BudgetBase):
    pass


class BudgetOut(BudgetBase):
    id: int
    spent: float = 0.0
    remaining: float = 0.0
    percentage: float = 0.0
    status: str = "safe"
    created_at: datetime

    class Config:
        from_attributes = True


class GoalBase(BaseModel):
    name: str
    target_amount: float = Field(gt=0)
    current_amount: float = 0.0
    monthly_contribution: float = 0.0
    deadline: Optional[date] = None
    priority: str = "medium"


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    monthly_contribution: Optional[float] = None
    deadline: Optional[date] = None
    priority: Optional[str] = None


class GoalOut(GoalBase):
    id: int
    progress_pct: float = 0.0
    remaining_amount: float = 0.0
    estimated_months: Optional[int] = None
    ai_suggestion: str = ""
    created_at: datetime

    class Config:
        from_attributes = True


class InsightOut(BaseModel):
    text: str
    severity: str = "info"
    insight_type: str = ""


class CoachRequest(BaseModel):
    message: str


class CoachResponse(BaseModel):
    reply: str


class SimulateRequest(BaseModel):
    one_time_purchase: float = 0.0
    income_change: float = 0.0
    expense_change: float = 0.0
    category: Optional[str] = None
    category_reduction_pct: float = 0.0
    goal_contribution_change: float = 0.0


class SimulateResult(BaseModel):
    current_savings: float
    simulated_savings: float
    current_savings_rate: float
    simulated_savings_rate: float
    current_cash_left: float
    simulated_cash_left: float
    risk_change: str
    recommendation: str


class RiskOut(BaseModel):
    score: int
    level: str
    risks: List[dict]
    recommendations: List[str]


class SummaryOut(BaseModel):
    monthly_income: float
    monthly_expenses: float
    net_savings: float
    savings_rate: float
    cash_left: float
    risk_level: str
    top_category: str
    insights: List[InsightOut]
