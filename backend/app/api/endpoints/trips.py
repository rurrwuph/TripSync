from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.all_schemas import TripCreate, TripOut
import app.models.all_models as models

router = APIRouter()

@router.post("/", response_model=TripOut)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    db_trip = models.Trip(
        bus_id=trip.bus_id,
        route=trip.route,
        departure_time=trip.departure_time,
        base_fare=trip.base_fare
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.get("/", response_model=List[TripOut])
def list_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    trips = db.query(models.Trip).offset(skip).limit(limit).all()
    return trips
