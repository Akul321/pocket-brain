from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import Transaction, User
from ..auth import get_current_user
from ..schemas import TransactionCreate, TransactionUpdate, TransactionOut
from ..services.categorizer import categorize, get_ai_note
from ..services.csv_service import parse_csv, export_csv
from fastapi.responses import StreamingResponse
import io

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=List[TransactionOut])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    sort_by: Optional[str] = "date",
    sort_dir: Optional[str] = "desc",
):
    q = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if category:
        q = q.filter(Transaction.category == category)
    if type:
        q = q.filter(Transaction.type == type)
    if search:
        q = q.filter(Transaction.description.ilike(f"%{search}%"))
    if start_date:
        q = q.filter(Transaction.date >= start_date)
    if end_date:
        q = q.filter(Transaction.date <= end_date)
    col = Transaction.amount if sort_by == "amount" else Transaction.date
    q = q.order_by(col.desc() if sort_dir == "desc" else col.asc())
    return q.all()


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.dict()
    data["category"] = data.get("category") or categorize(payload.description)
    data["ai_note"] = get_ai_note(payload.description, payload.amount, data["category"])
    data["user_id"] = current_user.id
    txn = Transaction(**data)
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@router.put("/{txn_id}", response_model=TransactionOut)
def update_transaction(
    txn_id: int,
    payload: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == current_user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(txn, field, value)
    if payload.description or payload.amount or payload.category:
        txn.ai_note = get_ai_note(txn.description, txn.amount, txn.category)
    db.commit()
    db.refresh(txn)
    return txn


@router.delete("/{txn_id}", status_code=204)
def delete_transaction(
    txn_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == current_user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(txn)
    db.commit()


@router.post("/import")
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    records = parse_csv(content)
    for r in records:
        r["user_id"] = current_user.id
        db.add(Transaction(**r))
    db.commit()
    return {"imported": len(records)}


@router.get("/export")
def export_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.date.desc()).all()
    csv_data = export_csv(txns)
    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=pocket_brain_transactions.csv"},
    )
