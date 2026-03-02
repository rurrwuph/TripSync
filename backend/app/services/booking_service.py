import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
import app.models.all_models as models
from typing import List, Optional
from app.services.email_service import send_partial_cancellation_email

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# UTC+6 Offset
DHAKA_TZ = timezone(timedelta(hours=6))

def get_utc_now():
    return datetime.now(timezone.utc)

def get_dhaka_now():
    return datetime.now(DHAKA_TZ)

def expire_bookings(db: Session):
    """
    Finds PENDING_PAYMENT bookings that have expired and releases their seats.
    """
    now = get_utc_now()
    expired_bookings = db.query(models.Booking).filter(
        models.Booking.status == "PENDING_PAYMENT",
        models.Booking.expires_at <= now
    ).all()

    for booking in expired_bookings:
        logger.info(f"Expiring booking {booking.id} due to timeout.")
        booking.status = "CANCELLED"
        for ticket in booking.tickets:
            if ticket.status == "HELD":
                ticket.status = "RELEASED"
    
    if expired_bookings:
        db.commit()

def calculate_refund_amount(departure_time: datetime, total_paid: float) -> dict:
    """
    Standardized Refund Engine:
    48h+: 90% | 24-48h: 75% | 12-24h: 50% | <12h: 0%
    If < 6h: REJECTED_POLICY
    """
    # Ensure departure_time is timezone-aware (assume UTC if not specified)
    if departure_time.tzinfo is None:
        departure_time = departure_time.replace(tzinfo=timezone.utc)
    
    now = get_utc_now()
    time_diff = departure_time - now
    hours_diff = time_diff.total_seconds() / 3600

    logger.info(f"Refund calculation: {hours_diff:.2f} hours before departure.")

    if hours_diff < 6:
        return {"amount": 0.0, "status": "REJECTED_POLICY", "percent": 0}
    elif hours_diff < 12:
        return {"amount": 0.0, "status": "REJECTED_POLICY", "percent": 0}
    elif hours_diff < 24:
        return {"amount": total_paid * 0.50, "status": "COMPLETED", "percent": 50}
    elif hours_diff < 48:
        return {"amount": total_paid * 0.75, "status": "COMPLETED", "percent": 75}
    else:
        return {"amount": total_paid * 0.90, "status": "COMPLETED", "percent": 90}

def process_partial_refund(db: Session, booking_id: int, ticket_ids: List[int], cause: str):
    """
    Processes a partial refund for specific tickets within a booking.
    Atomically updates ticket status, calculates refund, deducts points, and sends email.
    """
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status not in ["CONFIRMED", "PARTIALLY_CANCELLED"]:
        raise HTTPException(status_code=400, detail="Booking is not in a refundable state")

    tickets_to_refund = [t for t in booking.tickets if t.id in ticket_ids and t.status == "BOOKED"]
    
    if not tickets_to_refund:
        raise HTTPException(status_code=400, detail="No eligible tickets found for refund")

    # Calculate price per seat (simplified: total_price / total_tickets)
    price_per_seat = booking.total_price / len(booking.tickets)
    amount_to_refund_base = price_per_seat * len(tickets_to_refund)
    
    # Use standardized engine
    refund_details = calculate_refund_amount(booking.trip.departure_time, amount_to_refund_base)
    
    if refund_details["status"] == "REJECTED_POLICY":
         pass

    # Transactional update
    try:
        # 1. Update Tickets
        cancelled_seat_numbers = []
        for ticket in tickets_to_refund:
            ticket.status = "RELEASED"
            cancelled_seat_numbers.append(ticket.seat_number)
            logger.info(f"Seat {ticket.seat_number} released for booking {booking.id}")

        # 2. Update Booking Status
        remaining_booked = [t for t in booking.tickets if t.status == "BOOKED"]
        if not remaining_booked:
            booking.status = "CANCELLED"
        else:
            booking.status = "PARTIALLY_CANCELLED"

        # 3. Create Refund Record
        refund_record = models.Refund(
            booking_id=booking.id,
            ticket_ids=",".join(map(str, ticket_ids)),
            seat_numbers=",".join([t.seat_number for t in tickets_to_refund]),
            amount=refund_details["amount"],
            cause=cause,
            status=refund_details["status"]
        )
        db.add(refund_record)

        # Update booking total price to reflect net amount paid
        if refund_details["amount"] > 0:
            booking.total_price = max(0.0, float(booking.total_price) - float(refund_details["amount"]))
            logger.info(f"Updated booking {booking.id} total_price to {booking.total_price} after refund.")
        
        # 4. Deduct reward points (1000 per cancelled seat)
        user = db.query(models.User).filter(models.User.id == booking.user_id).first()
        if user:
            points_to_deduct = 1000 * len(tickets_to_refund)
            user.reward_points = max(0, (user.reward_points or 0) - points_to_deduct)
            logger.info(f"Deducted {points_to_deduct} points from user {user.email}. New balance: {user.reward_points}")

        # Mock payment gateway API call
        logger.info(f"Mocking Refund API Call: Refunding {refund_details['amount']} to user for {len(tickets_to_refund)} seats.")
        
        db.commit()

        # 5. Send partial cancellation email (after commit)
        if user:
            remaining_seat_numbers = [t.seat_number for t in booking.tickets if t.status == "BOOKED"]
            departure_str = booking.trip.departure_time.strftime("%Y-%m-%d %H:%M") if booking.trip.departure_time else "N/A"
            try:
                send_partial_cancellation_email(
                    user_email=user.email,
                    user_name=user.full_name or "Valued Customer",
                    route=booking.trip.route or "N/A",
                    departure_time=departure_str,
                    cancelled_seats=cancelled_seat_numbers,
                    remaining_seats=remaining_seat_numbers,
                    refund_amount=refund_details["amount"],
                    refund_status=refund_details["status"]
                )
            except Exception as email_err:
                logger.error(f"Failed to send cancellation email: {email_err}")

        return refund_record
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to process partial refund: {e}")
        raise HTTPException(status_code=500, detail="Refund processing failed. Seats were NOT released.")
