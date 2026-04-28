from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, Date
from sqlalchemy.sql import func
import enum
from .database import Base


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Akul")
    currency = Column(String, default="₹")
    monthly_income_target = Column(Float, default=50000.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    notes = Column(Text, default="")
    ai_note = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    monthly_limit = Column(Float, nullable=False)
    month = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    monthly_contribution = Column(Float, default=0.0)
    deadline = Column(Date, nullable=True)
    priority = Column(String, default="medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InsightCache(Base):
    __tablename__ = "insight_cache"
    id = Column(Integer, primary_key=True, index=True)
    insight_type = Column(String)
    text = Column(Text)
    severity = Column(String, default="info")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
