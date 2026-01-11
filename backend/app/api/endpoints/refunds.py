from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.all_schemas import RefundCreate, RefundOut
import app.models.all_models as models

router = APIRouter()

@router.post("/", response_model=RefundOut)
def request_refund(refund: RefundCreate, db: Session = Depends(get_db)):
    db_refund = models.Refund(
        ticket_id=refund.ticket_id,
        amount=refund.amount,
        status="pending"
    )
    db.add(db_refund)
    db.commit()
    db.refresh(db_refund)
    return db_refund
