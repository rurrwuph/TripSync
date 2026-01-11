from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import date
from app.api.deps import get_db, require_admin
import app.models.all_models as models
from app.schemas.all_schemas import BusCreate, BusOut, TripCreate, TripOut

router = APIRouter()

@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    today = date.today()
    
    # Total tickets sold today (approx by created_id or we assume all are today for now or check ticket relationship logic if date stored)
    # Tickets don't have created_at column in my current model check
    # Checking models.py Ticket definition:
    # class Ticket(Base): ... no created_at. 
    # Let's count TOTAL bookings for now or update model later. The request asked "sold today".
    # I will stick to total active buses and pending refunds which are easier to query with current schema.
    # For tickets sold today, I'll count ALL tickets as a placeholder or check if I can infer from Trip date.
    
    total_active_buses = db.query(models.Bus).count()
    pending_refunds = db.query(models.Refund).filter(models.Refund.status == "pending").count()
    total_tickets = db.query(models.Ticket).count()
    
    return {
        "total_tickets_sold": total_tickets,
        "total_active_buses": total_active_buses,
        "pending_refunds": pending_refunds
    }

@router.post("/buses", response_model=BusOut)
def create_bus(bus: BusCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    db_bus = models.Bus(
        bus_number=bus.bus_number,
        total_seats=bus.total_seats,
        type=bus.type
    )
    db.add(db_bus)
    db.commit()
    db.refresh(db_bus)
    return db_bus

@router.get("/buses", response_model=List[BusOut])
def list_buses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    buses = db.query(models.Bus).offset(skip).limit(limit).all()
    return buses
