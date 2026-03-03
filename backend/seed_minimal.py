from app.core.database import SessionLocal
import app.models.all_models as models
from datetime import datetime, timedelta
from sqlalchemy import func

def seed_minimal():
    db = SessionLocal()
    try:
        # Create User
        user = db.query(models.User).filter(models.User.email == "system@tripsync.com").first()
        if not user:
            user = models.User(
                full_name="System Admin",
                email="system@tripsync.com",
                hashed_password="hashed_password", # Not used for logic tests
                role="admin"
            )
            db.add(user)
        
        # Create Bus
        bus = db.query(models.Bus).filter(models.Bus.bus_number == "Royal Maitri Service - AC").first()
        if not bus:
            bus = models.Bus(
                bus_number="Royal Maitri Service - AC",
                total_seats=36,
                type="AC"
            )
            db.add(bus)
            db.flush()
        
        # Create Trip
        departure_str = "2026-03-10"
        departure = datetime.strptime(departure_str, "%Y-%m-%d")
        
        trip = db.query(models.Trip).filter(
            models.Trip.bus_id == bus.id,
            models.Trip.route == "Dhaka-Chittagong",
            func.date(models.Trip.departure_time) == departure.date()
        ).first()
        
        if not trip:
            trip = models.Trip(
                bus_id=bus.id,
                route="Dhaka-Chittagong",
                from_location="Dhaka",
                to_location="Chittagong",
                departure_time=departure,
                base_fare=1200.0,
                available_seats=36
            )
            db.add(trip)
        db.commit()
        print(f"Minimal seed complete. Trip ID: {trip.id}")
    except Exception as e:
        print(f"Seed Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_minimal()
