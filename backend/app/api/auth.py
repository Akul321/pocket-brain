from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import User, UserProfile
from ..auth import hash_password, verify_password, create_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    currency: str = "₹"
    monthly_income_target: float = 50000.0


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    user_id: int


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    user = User(email=payload.email.lower(), hashed_password=hash_password(payload.password))
    db.add(user)
    db.flush()
    profile = UserProfile(
        user_id=user.id,
        name=payload.name,
        currency=payload.currency,
        monthly_income_target=payload.monthly_income_target,
    )
    db.add(profile)
    db.commit()
    return TokenResponse(access_token=create_token(user.id), name=payload.name, user_id=user.id)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    name = profile.name if profile else user.email
    return TokenResponse(access_token=create_token(user.id), name=name, user_id=user.id)
