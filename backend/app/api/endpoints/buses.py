from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.all_schemas import BusCreate, BusOut
import app.models.all_models as models

router = APIRouter()

@router.post("/", response_model=BusOut)
def create_bus(bus: BusCreate, db: Session = Depends(get_db)):
    db_bus = models.Bus(
        bus_number=bus.bus_number,
        total_seats=bus.total_seats,
        type=bus.type
    )
    db.add(db_bus)
    db.commit()
    db.refresh(db_bus)
    return db_bus

@router.get("/", response_model=List[BusOut])
def list_buses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    buses = db.query(models.Bus).offset(skip).limit(limit).all()
    return buses
