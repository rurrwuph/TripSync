from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from app.api.deps import get_db
from app.schemas import all_schemas as schemas
import app.models.all_models as models
# from app.services.mail_service import mail_service
from app.services import trip_service, booking_service
from fastapi import BackgroundTasks
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/availability")
def get_availability(request: schemas.AvailabilityRequest, db: Session = Depends(get_db)):
    # Legacy: returns simple list
    return trip_service.get_seat_overlay(db, request.trip_details)

@router.post("/seat-overlay")
def seat_overlay(request: schemas.AvailabilityRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Proactively expire old holds before showing overlay
    booking_service.expire_bookings(db)
    
    trip = trip_service.get_or_create_trip(db, request.trip_details)
    booked_seats = trip_service.get_seat_overlay(db, request.trip_details)
    return {
        "booked_seats": booked_seats,
        "total_seats": trip.bus.total_seats if trip.bus else 36,
        "operator": trip.bus.bus_number if trip.bus else "Unknown"
    }

@router.post("/book", response_model=schemas.BookingOut)
def book_ticket(booking_req: schemas.BookingRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Use current_user instead of looking up by email
    user = current_user

    # 2. Get or Create Trip
    trip = trip_service.get_or_create_trip(db, booking_req.trip_details)

    # 3. Create Booking Record (Status: PENDING_PAYMENT)
    new_booking = models.Booking(
        user_id=user.id,
        trip_id=trip.id,
        status="PENDING_PAYMENT",
        total_price=booking_req.total_price,
        expires_at=booking_service.get_utc_now() + timedelta(seconds=120)
    )
    db.add(new_booking)
    db.flush() # Get booking ID

    # 4. Create or Update Tickets
    new_tickets = []
    for seat in booking_req.selected_seats:
        # Check for ANY existing ticket for this seat/trip
        existing_any = db.query(models.Ticket).filter(
            models.Ticket.trip_id == trip.id,
            models.Ticket.seat_number == seat
        ).first()
        
        if existing_any:
            if existing_any.status in ["HELD", "BOOKED"]:
                 raise HTTPException(status_code=400, detail=f"Seat {seat} is currently taken.")
            
            # Recycle existing record (RELEASED or others)
            existing_any.status = "HELD"
            existing_any.user_id = user.id
            existing_any.booking_id = new_booking.id
            existing_any.created_at = func.now()
            new_tickets.append(existing_any)
        else:
            ticket = models.Ticket(
                trip_id=trip.id,
                seat_number=seat,
                user_id=user.id,
                booking_id=new_booking.id,
                status="HELD"
            )
            db.add(ticket)
            new_tickets.append(ticket)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        if "_trip_seat_uc" in str(e):
             raise HTTPException(status_code=400, detail="One or more selected seats have already been taken.")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    db.refresh(new_booking)
    
    # Optional: Schedule a background task to check expiration (in addition to lazy check in overlay)
    # background_tasks.add_task(booking_service.expire_bookings, db) 
    # Actually background tasks in FastAPI share the same session context if not careful.
    # We'll stick to lazy check and potentially a cron-like trigger if needed.

    return new_booking

@router.post("/confirm/{booking_id}", response_model=schemas.BookingOut)
def confirm_booking(booking_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != "PENDING_PAYMENT":
        raise HTTPException(status_code=400, detail="Booking is not in pending status")
        
    if booking.expires_at < booking_service.get_utc_now():
        booking.status = "CANCELLED"
        for t in booking.tickets:
            t.status = "RELEASED"
        db.commit()
        raise HTTPException(status_code=400, detail="Booking has expired")

    booking.status = "CONFIRMED"
    booking.payment_timestamp = func.now()
    for t in booking.tickets:
        t.status = "BOOKED"

    # Award reward points: 1000 per seat booked
    user = db.query(models.User).filter(models.User.id == booking.user_id).first()
    if user:
        seats_count = len(booking.tickets)
        points_earned = 1000 * seats_count
        user.reward_points = (user.reward_points or 0) + points_earned
        
    db.commit()
    db.refresh(booking)
    return booking

@router.get("/", response_model=List[schemas.TicketOut])
def list_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tickets = db.query(models.Ticket).offset(skip).limit(limit).all()
    return tickets

@router.get("/user/{email}", response_model=List[schemas.BookingOut])
def get_user_bookings(email: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify the email matches the current user OR user is admin
    if current_user.email != email and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these bookings")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Proactively expire stale holdings before returning list
    booking_service.expire_bookings(db)
        
    bookings = db.query(models.Booking).filter(models.Booking.user_id == user.id).order_by(models.Booking.created_at.desc()).all()
    
    # For each booking, ensure tickets have refund_status if any
    for b in bookings:
        for ticket in b.tickets:
            if ticket.refund:
                ticket.refund_status = ticket.refund.status
            else:
                 ticket.refund_status = None
                
    return bookings
