from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.api.deps import get_db
from app.schemas import all_schemas as schemas
import app.models.all_models as models

router = APIRouter()

def get_or_create_trip(db: Session, trip_data: dict):
    # Support both 'operator' and 'bus_name'
    operator = trip_data.get('operator') or trip_data.get('bus_name', 'Unknown')
    bus_type = trip_data.get('type') or trip_data.get('bus_type', 'Standard')
    
    bus_identifier = f"{operator} - {bus_type}"
    bus = db.query(models.Bus).filter(models.Bus.bus_number == bus_identifier).first()
    
    if not bus:
        bus = models.Bus(
            bus_number=bus_identifier,
            total_seats=trip_data.get('total_seats', 36),
            type=bus_type
        )
        db.add(bus)
        db.commit()
        db.refresh(bus)

    try:
        date_str = trip_data.get('date') 
        # Support both 'departure_time' and 'time'
        time_str = trip_data.get('departure_time') or trip_data.get('time')
        
        if date_str and time_str:
             departure_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %I:%M %p")
        else:
             # If date/time missing, we cannot uniquely identify a trip safely.
             # Return existing or raise error? For now fallback but log.
             print(f"CRITICAL: Missing date/time in trip sync: {trip_data}")
             departure_dt = datetime.fromisoformat(date_str) if date_str else datetime.now()
    except Exception as e:
        print(f"Date parsing error: {e}")
        departure_dt = datetime.now()

    # Support both 'route' and explicit 'from'/'to'
    from_loc = trip_data.get('from') or trip_data.get('from_location')
    to_loc = trip_data.get('to') or trip_data.get('to_location')
    route_str = trip_data.get('route') or f"{from_loc}-{to_loc}"

    trip = db.query(models.Trip).filter(
        models.Trip.bus_id == bus.id,
        models.Trip.departure_time == departure_dt
    ).first()

    if not trip:
        trip = models.Trip(
            bus_id=bus.id,
            route=route_str,
            from_location=from_loc,
            to_location=to_loc,
            departure_time=departure_dt,
            base_fare=float(str(trip_data.get('price', 0)).replace(',', ''))
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)
    
    return trip

@router.post("/availability")
def get_availability(request: schemas.AvailabilityRequest, db: Session = Depends(get_db)):
    trip = get_or_create_trip(db, request.trip_details)
    booked_seats = db.query(models.Ticket.seat_number).filter(
        models.Ticket.trip_id == trip.id,
        models.Ticket.status == "booked"
    ).all()
    return [s[0] for s in booked_seats]

@router.post("/book", response_model=List[schemas.TicketOut])
def book_ticket(booking: schemas.BookingRequest, db: Session = Depends(get_db)):
    # 1. Get User
    user = db.query(models.User).filter(models.User.email == booking.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Get or Create Trip
    trip = get_or_create_trip(db, booking.trip_details)

    # 4. Create Tickets
    new_tickets = []
    for seat in booking.selected_seats:
        # Check if seat already booked
        existing_ticket = db.query(models.Ticket).filter(
            models.Ticket.trip_id == trip.id,
            models.Ticket.seat_number == seat
        ).first()
        
        if existing_ticket:
            raise HTTPException(status_code=400, detail=f"Seat {seat} already booked")

        ticket = models.Ticket(
            trip_id=trip.id,
            seat_number=seat,
            user_id=user.id,
            status="booked"
        )
        db.add(ticket)
        new_tickets.append(ticket)
    
    db.commit()
    for t in new_tickets:
        db.refresh(t)
        
    return new_tickets

@router.get("/", response_model=List[schemas.TicketOut])
def list_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tickets = db.query(models.Ticket).offset(skip).limit(limit).all()
    return tickets

@router.get("/user/{email}", response_model=List[schemas.TicketOut])
def get_user_tickets(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    tickets = db.query(models.Ticket).filter(models.Ticket.user_id == user.id).all()
    return tickets
