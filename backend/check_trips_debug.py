from app.core.database import SessionLocal
import app.models.all_models as models
from sqlalchemy import func
import sys
import os
import pathlib

# Add the backend directory to sys.path
current_dir = pathlib.Path(__file__).parent.resolve()
sys.path.append(str(current_dir))

def check_trips():
    db = SessionLocal()
    try:
        results = db.query(
            func.date(models.Trip.departure_time).label('date'),
            func.count(models.Trip.id).label('count')
        ).group_by(func.date(models.Trip.departure_time)).order_by('date').all()
        
        print("Trip distribution by date:")
        for r in results:
            print(f"{r.date}: {r.count} trips")
            
        # Check a specific route
        sample_trips = db.query(models.Trip).limit(10).all()
        print("\nSample Trips (first 10):")
        for t in sample_trips:
            print(f"ID: {t.id} | {t.from_location} -> {t.to_location} | {t.departure_time}")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_trips()
