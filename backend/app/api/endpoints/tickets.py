from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.api.deps import get_db
from app.schemas.all_schemas import TicketCreate, TicketOut, BookingRequest
import app.models.all_models as models

router = APIRouter()

@router.post("/book", response_model=List[TicketOut])
def book_ticket(booking: BookingRequest, db: Session = Depends(get_db)):
    # 1. Get User
    user = db.query(models.User).filter(models.User.email == booking.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    trip_data = booking.trip_details
    
    # 2. Get or Create Bus (Simple logic: based on bus number if available, else create pseudo-bus based on operator+type)
    # Since scraped data might not have a consistent "bus_number", we will generate one or try to find a matching one.
    # For this implementation, let's assume 'operator' + 'type' + 'seats' defines a 'Bus Type' basically.
    # But to be robust for unique bus tracking, we'll try to find a bus assigned to this route/time or create a new one.
    # Simplified approach: Check if a bus exists with this "operator - type".
    
    bus_identifier = f"{trip_data.get('operator', 'Unknown')} - {trip_data.get('type', 'Standard')}"
    bus = db.query(models.Bus).filter(models.Bus.bus_number == bus_identifier).first()
    
    if not bus:
        bus = models.Bus(
            bus_number=bus_identifier,
            total_seats=trip_data.get('total_seats', 36),
            type=trip_data.get('type', 'Standard')
        )
        db.add(bus)
        db.commit()
        db.refresh(bus)

    # 3. Get or Create Trip
    # We identify a trip by Bus + Route + Departure Time
    
    try:
        # Data format from scraper: "11:15 PM" -> Need to combine with Date if possible, or just store string for now if model allows
        # Model expects DateTime for departure_time. Scraper passes time string. 
        # BookingRequest trip_details should ideally contain the full datetime or date + time.
        # Let's assume trip_details has 'date' (YYYY-MM-DD) and 'departure_time' (HH:MM AM/PM)
        
        date_str = trip_data.get('date') # Needs to be passed from frontend
        time_str = trip_data.get('departure_time')
        
        if date_str and time_str:
             departure_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %I:%M %p")
        else:
             # Fallback if parsing fails or data missing (should safeguard against this)
             departure_dt = datetime.now() 

    except Exception as e:
        print(f"Date parsing error: {e}")
        departure_dt = datetime.now()

    route_str = trip_data.get('route', 'Unknown Route')

    trip = db.query(models.Trip).filter(
        models.Trip.bus_id == bus.id,
        models.Trip.route == route_str,
        models.Trip.departure_time == departure_dt
    ).first()

    if not trip:
        trip = models.Trip(
            bus_id=bus.id,
            route=route_str,
            departure_time=departure_dt,
            base_fare=float(str(trip_data.get('price', 0)).replace(',', ''))
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)

    # 4. Create Tickets
    new_tickets = []
    for seat in booking.selected_seats:
        # Check if seat already booked
        existing_ticket = db.query(models.Ticket).filter(
            models.Ticket.trip_id == trip.id,
            models.Ticket.seat_number == seat
        ).first()
        
        if existing_ticket:
            # Skip or error? Let's error to be safe.
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

@router.get("/", response_model=List[TicketOut])
def list_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tickets = db.query(models.Ticket).offset(skip).limit(limit).all()
    return tickets

@router.get("/user/{email}", response_model=List[TicketOut])
def get_user_tickets(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    tickets = db.query(models.Ticket).filter(models.Ticket.user_id == user.id).all()
    return tickets
