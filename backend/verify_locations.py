from app.api.endpoints.tickets import get_or_create_trip
from app.core.database import SessionLocal
from app.models.all_models import Trip

def verify():
    db = SessionLocal()
    try:
        # Mock trip data including 'from' and 'to'
        trip_data = {
            "operator": "Verification Operator",
            "type": "Verification Type",
            "from": "Dhaka",
            "to": "Chittagong",
            "date": "2026-02-01",
            "departure_time": "10:00 AM",
            "route": "Dhaka-Chittagong",
            "price": "1000",
            "total_seats": 36
        }
        
        print("Creating/Getting trip...")
        trip = get_or_create_trip(db, trip_data)
        
        print(f"Trip ID: {trip.id}")
        print(f"From Location (DB): {trip.from_location}")
        print(f"To Location (DB): {trip.to_location}")
        
        if trip.from_location == "Dhaka" and trip.to_location == "Chittagong":
            print("\nSUCCESS: Trip locations correctly stored!")
        else:
            print("\nFAILURE: Trip locations mismatch.")
            
    finally:
        db.close()

if __name__ == "__main__":
    verify()
