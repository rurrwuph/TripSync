from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text, cast, Date, or_
from typing import List, Dict, Optional
from datetime import date, datetime, timedelta, timezone
from pydantic import BaseModel
from app.api.deps import get_db, require_admin
import app.models.all_models as models
from app.schemas.all_schemas import TripOut

router = APIRouter()

# --- Pydantic Models for Admin ---
class TripUpdate(BaseModel):
    departure_time: Optional[datetime] = None

class MonitoringSummary(BaseModel):
    total_bookings: int
    total_revenue_today: float
    total_refunds_today: float
    net_revenue_today: float
    total_revenue_month: float
    total_refunds_amount: float
    net_revenue_month: float
    pending_refunds: int

class RouteProfitability(BaseModel):
    route: str
    total_bookings: int
    total_revenue: float
    total_refunds: float
    net_revenue: float

# ===================== MONITORING =====================

@router.get("/monitoring/summary")
def get_monitoring_summary(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    # Use UTC+6 (Dhaka timezone) for consistent date comparison
    DHAKA_TZ = timezone(timedelta(hours=6))
    today = datetime.now(DHAKA_TZ).date()
    first_of_month = today.replace(day=1)

    # Total confirmed bookings
    total_bookings = db.query(models.Booking).filter(
        models.Booking.status.in_(["CONFIRMED", "PARTIALLY_CANCELLED"])
    ).count()

    # Net revenue today (sum of CURRENT booking totals)
    revenue_today_net = db.query(func.coalesce(func.sum(models.Booking.total_price), 0)).filter(
        models.Booking.payment_timestamp.isnot(None),
        models.Booking.status.in_(["CONFIRMED", "PARTIALLY_CANCELLED", "CANCELLED"]),
        cast(models.Booking.payment_timestamp, Date) == today
    ).scalar()

    # Refunds today
    refunds_today = db.query(func.coalesce(func.sum(models.Refund.amount), 0)).filter(
        models.Refund.status.in_(["approved", "pending", "COMPLETED"]),
        cast(models.Refund.refund_date, Date) == today
    ).scalar()

    # Net revenue this month (sum of CURRENT booking totals)
    net_revenue_month = db.query(func.coalesce(func.sum(models.Booking.total_price), 0)).filter(
        models.Booking.payment_timestamp.isnot(None),
        models.Booking.status.in_(["CONFIRMED", "PARTIALLY_CANCELLED", "CANCELLED"]),
        cast(models.Booking.payment_timestamp, Date) >= first_of_month
    ).scalar()

    # Total refunds amount THIS month (approved/pending/completed)
    refunds_month = db.query(func.coalesce(func.sum(models.Refund.amount), 0)).filter(
        models.Refund.status.in_(["approved", "pending", "COMPLETED"]),
        cast(models.Refund.refund_date, Date) >= first_of_month
    ).scalar()

    # Calculate Gross from Net + Refunds
    gross_revenue_today = float(revenue_today_net) + float(refunds_today)
    gross_revenue_month = float(net_revenue_month) + float(refunds_month)

    # Pending refund count
    pending_refunds = db.query(models.Refund).filter(models.Refund.status == "pending").count()

    return {
        "total_bookings": total_bookings,
        "total_revenue_today": gross_revenue_today,
        "total_refunds_today": float(refunds_today),
        "net_revenue_today": float(revenue_today_net),
        "total_revenue_month": gross_revenue_month,
        "total_refunds_amount": float(refunds_month),
        "net_revenue_month": float(net_revenue_month),
        "pending_refunds": pending_refunds
    }

@router.get("/monitoring/routes")
def get_route_profitability(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    # Join bookings with trips to get route-based revenue
    results = db.query(
        models.Trip.route,
        func.count(models.Booking.id).label("total_bookings"),
        func.coalesce(func.sum(models.Booking.total_price), 0).label("total_revenue")
    ).join(
        models.Trip, models.Booking.trip_id == models.Trip.id
    ).filter(
        models.Booking.payment_timestamp.isnot(None),
        models.Booking.status.in_(["CONFIRMED", "PARTIALLY_CANCELLED", "CANCELLED"])
    ).group_by(models.Trip.route).all()

    route_data = []
    for row in results:
        # Get refunds for this route's bookings
        route_refunds = db.query(func.coalesce(func.sum(models.Refund.amount), 0)).join(
            models.Booking, models.Refund.booking_id == models.Booking.id
        ).join(
            models.Trip, models.Booking.trip_id == models.Trip.id
        ).filter(
            models.Trip.route == row.route,
            models.Refund.status.in_(["approved", "pending", "COMPLETED"])
        ).scalar()

        # For route profitability, we want to show net as current total_price
        # Gross = total_price + refunds
        route_net = float(row.total_revenue)
        route_gross = route_net + float(route_refunds)

        route_data.append({
            "route": row.route,
            "total_bookings": row.total_bookings,
            "total_revenue": route_gross,
            "total_refunds": float(route_refunds),
            "net_revenue": route_net
        })

    return route_data

@router.get("/monitoring/past-trips")
def get_past_trips(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    past_trips = db.query(models.Trip).filter(
        models.Trip.departure_time < func.now()
    ).order_by(models.Trip.departure_time.desc()).limit(50).all()

    results = []
    for trip in past_trips:
        booking_count = db.query(models.Booking).filter(
            models.Booking.trip_id == trip.id,
            models.Booking.status.in_(["CONFIRMED", "PARTIALLY_CANCELLED"])
        ).count()
        revenue = db.query(func.coalesce(func.sum(models.Booking.total_price), 0)).filter(
            models.Booking.trip_id == trip.id,
            models.Booking.status.in_(["CONFIRMED", "PARTIALLY_CANCELLED"])
        ).scalar()

        results.append({
            "id": trip.id,
            "route": trip.route,
            "from_location": trip.from_location,
            "to_location": trip.to_location,
            "departure_time": trip.departure_time.isoformat() if trip.departure_time else None,
            "bus_number": trip.bus.bus_number if trip.bus else "N/A",
            "bookings": booking_count,
            "revenue": float(revenue)
        })

    return results

# ===================== TRIP MANAGEMENT =====================

@router.get("/trips")
def list_all_trips(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    # Sort by departure_time ASCENDING (upcoming first)
    trips = db.query(models.Trip).order_by(models.Trip.departure_time.asc()).all()
    results = []
    for trip in trips:
        booking_count = db.query(models.Booking).filter(
            models.Booking.trip_id == trip.id,
            models.Booking.status.in_(["CONFIRMED", "PARTIALLY_CANCELLED", "PENDING_PAYMENT"])
        ).count()
        results.append({
            "id": trip.id,
            "route": trip.route,
            "from_location": trip.from_location,
            "to_location": trip.to_location,
            "departure_time": trip.departure_time.isoformat() if trip.departure_time else None,
            "bus_number": trip.bus.bus_number if trip.bus else "N/A",
            "base_fare": trip.base_fare,
            "available_seats": trip.available_seats,
            "active_bookings": booking_count
        })
    return results

@router.put("/trips/{trip_id}")
def update_trip(trip_id: int, update: TripUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    from app.services.email_service import send_trip_update_email

    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    old_departure = trip.departure_time

    if update.departure_time:
        trip.departure_time = update.departure_time

    db.commit()
    db.refresh(trip)

    # Collect affected passengers and send email notifications
    affected_bookings = db.query(models.Booking).filter(
        models.Booking.trip_id == trip_id,
        models.Booking.status.in_(["CONFIRMED", "PARTIALLY_CANCELLED"])
    ).all()

    affected_users = []
    for booking in affected_bookings:
        user = db.query(models.User).filter(models.User.id == booking.user_id).first()
        if user and user.email not in [u["email"] for u in affected_users]:
            affected_users.append({"email": user.email, "name": user.full_name or "Valued Customer"})

    # Send email to each affected user
    old_dep_str = old_departure.strftime("%Y-%m-%d %H:%M") if old_departure else "N/A"
    new_dep_str = trip.departure_time.strftime("%Y-%m-%d %H:%M") if trip.departure_time else "N/A"
    for u in affected_users:
        try:
            send_trip_update_email(
                user_email=u["email"],
                user_name=u["name"],
                route=trip.route or "N/A",
                change_type="updated",
                old_departure=old_dep_str,
                new_departure=new_dep_str
            )
        except Exception as e:
            print(f"Failed to send trip update email to {u['email']}: {e}")

    return {
        "message": "Trip updated successfully",
        "trip_id": trip.id,
        "old_departure": old_departure.isoformat() if old_departure else None,
        "new_departure": trip.departure_time.isoformat() if trip.departure_time else None,
        "affected_passengers": [u["email"] for u in affected_users]
    }

@router.delete("/trips/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    from app.services.email_service import send_trip_update_email

    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Check for active bookings
    active_bookings = db.query(models.Booking).filter(
        models.Booking.trip_id == trip_id,
        models.Booking.status.in_(["CONFIRMED", "PENDING_PAYMENT"])
    ).all()

    if len(active_bookings) > 0:
        # Send cancellation email to affected users before failing
        for booking in active_bookings:
            user = db.query(models.User).filter(models.User.id == booking.user_id).first()
            if user:
                try:
                    send_trip_update_email(
                        user_email=user.email,
                        user_name=user.full_name or "Valued Customer",
                        route=trip.route or "N/A",
                        change_type="deleted"
                    )
                except Exception as e:
                    print(f"Failed to send trip delete email to {user.email}: {e}")

        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete trip with {len(active_bookings)} active bookings. Cancel bookings first. Affected users have been notified."
        )

    # Delete related records (orphaned tickets, cancelled bookings)
    db.query(models.Ticket).filter(models.Ticket.trip_id == trip_id).delete(synchronize_session=False)
    db.query(models.Booking).filter(models.Booking.trip_id == trip_id).delete(synchronize_session=False)
    db.delete(trip)
    db.commit()

    return {"message": f"Trip {trip_id} deleted successfully"}

# ===================== USERS =====================

@router.get("/users")
def list_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    """Return all registered users for the admin Users tab."""
    users = db.query(models.User).order_by(models.User.id.asc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name or "—",
            "phone": u.phone or "—",
            "role": u.role,
            "reward_points": u.reward_points or 0
        }
        for u in users
    ]

# ===================== REFUNDS (kept from old admin) =====================

@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    """Legacy endpoint - redirects to monitoring/summary."""
    today = date.today()
    total_bookings = db.query(models.Booking).filter(
        models.Booking.status.in_(["CONFIRMED", "PARTIALLY_CANCELLED"])
    ).count()
    pending_refunds = db.query(models.Refund).filter(models.Refund.status == "pending").count()
    total_tickets = db.query(models.Ticket).filter(models.Ticket.status == "BOOKED").count()

    return {
        "total_tickets_sold": total_tickets,
        "total_active_buses": db.query(models.Bus).count(),
        "pending_refunds": pending_refunds,
        "total_bookings": total_bookings
    }
