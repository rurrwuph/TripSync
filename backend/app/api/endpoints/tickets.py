from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.api.deps import get_db
from app.schemas import all_schemas as schemas
import app.models.all_models as models
# from app.services.mail_service import mail_service
from app.services import trip_service

router = APIRouter()

@router.post("/availability")
def get_availability(request: schemas.AvailabilityRequest, db: Session = Depends(get_db)):
    # Legacy: returns simple list
    return trip_service.get_seat_overlay(db, request.trip_details)

@router.post("/seat-overlay")
def seat_overlay(request: schemas.AvailabilityRequest, db: Session = Depends(get_db)):
    trip = trip_service.get_or_create_trip(db, request.trip_details)
    booked_seats = trip_service.get_seat_overlay(db, request.trip_details)
    return {
        "booked_seats": booked_seats,
        "total_seats": trip.bus.total_seats if trip.bus else 36,
        "operator": trip.bus.bus_number if trip.bus else "Unknown"
    }

@router.post("/book", response_model=List[schemas.TicketOut])
def book_ticket(booking: schemas.BookingRequest, db: Session = Depends(get_db)):
    # 1. Get User
    user = db.query(models.User).filter(models.User.email == booking.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Get or Create Trip
    trip = trip_service.get_or_create_trip(db, booking.trip_details)

    # 4. Create Tickets
    new_tickets = []
    for seat in booking.selected_seats:
        # Check if seat already booked
        existing_ticket = db.query(models.Ticket).filter(
            models.Ticket.trip_id == trip.id,
            models.Ticket.seat_number == seat,
            models.Ticket.status == "booked"
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
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        # Check if it's a unique constraint violation
        if "_trip_seat_uc" in str(e):
             raise HTTPException(status_code=400, detail="One or more selected seats have already been booked by another user.")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

    for t in new_tickets:
        db.refresh(t)
        
    # Confirmation email now handled by frontend via EmailJS
    # try:
    #     mail_service.send_booking_confirmation(
    #         user_email=booking.user_email,
    #         trip_details=booking.trip_details,
    #         seats=booking.selected_seats
    #     )
    # except Exception as e:
    #     print(f"Failed to send confirmation email: {e}")
        
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
    
    # Manually attach refund_status to avoid schema issues if relationship isn't eager
    for ticket in tickets:
        if ticket.refund:
            ticket.refund_status = ticket.refund.status
        else:
            # Finding if this ticket_id is inside any comma-separated ticket_ids string
            # We check for: exact match, starts with "ID,", ends with ",ID", or contains ",ID,"
            group_refund = db.query(models.Refund).filter(
                (models.Refund.ticket_ids == str(ticket.id)) |
                (models.Refund.ticket_ids.like(f"%,{ticket.id},%")) |
                (models.Refund.ticket_ids.like(f"{ticket.id},%")) |
                (models.Refund.ticket_ids.like(f"%,{ticket.id}"))
            ).first()
            if group_refund:
                ticket.refund_status = group_refund.status
            else:
                ticket.refund_status = None
                
    return tickets
