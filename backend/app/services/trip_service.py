from sqlalchemy.orm import Session
from datetime import datetime
import app.models.all_models as models

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

def get_seat_overlay(db: Session, trip_details: dict):
    """
    Ensures trip exists and returns a list of booked seat numbers.
    """
    trip = get_or_create_trip(db, trip_details)
    booked_seats = db.query(models.Ticket.seat_number).filter(
        models.Ticket.trip_id == trip.id,
        models.Ticket.status == "booked"
    ).all()
    return [s[0] for s in booked_seats]
