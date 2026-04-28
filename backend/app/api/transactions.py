from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import Transaction
from ..schemas import TransactionCreate, TransactionUpdate, TransactionOut
from ..services.categorizer import categorize, get_ai_note
from ..services.csv_service import parse_csv, export_csv
from fastapi.responses import StreamingResponse
import io

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=List[TransactionOut])
def list_transactions(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    sort_by: Optional[str] = "date",
    sort_dir: Optional[str] = "desc",
):
    q = db.query(Transaction)
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
    if sort_by == "amount":
        col = Transaction.amount
    else:
        col = Transaction.date
    q = q.order_by(col.desc() if sort_dir == "desc" else col.asc())
    return q.all()


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    category = payload.category or categorize(payload.description)
    ai_note = get_ai_note(payload.description, payload.amount, category)
    txn = Transaction(**payload.dict(), category=category, ai_note=ai_note)
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@router.put("/{txn_id}", response_model=TransactionOut)
def update_transaction(txn_id: int, payload: TransactionUpdate, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
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
def delete_transaction(txn_id: int, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(txn)
    db.commit()


@router.post("/import")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    records = parse_csv(content)
    created = 0
    for r in records:
        txn = Transaction(**r)
        db.add(txn)
        created += 1
    db.commit()
    return {"imported": created}


@router.get("/export")
def export_transactions(db: Session = Depends(get_db)):
    txns = db.query(Transaction).order_by(Transaction.date.desc()).all()
    csv_data = export_csv(txns)
    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=pocket_brain_transactions.csv"},
    )
