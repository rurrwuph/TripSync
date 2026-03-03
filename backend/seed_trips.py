import sys
import os
import pathlib
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session

# Add the backend directory to sys.path so we can import app modules
current_dir = pathlib.Path(__file__).parent.resolve()
sys.path.append(str(current_dir))

from app.core.database import SessionLocal, engine
import app.models.all_models as models
from app.services.scraper_service import scrape_shohoz
from app.services import trip_service

# Configuration for seeding
POPULAR_CITIES = [
    "Dhaka", "Chittagong", "Cox's Bazar", "Sylhet", "Rajshahi", 
    "Khulna", "Barisal", "Rangpur", "Bogra", "Jashore", "Mymensingh",
    "Comilla", "Feni", "Noakhali", "Lakshmipur", "Chandpur", "Brahmanbaria",
    "Habiganj", "Maulvibazar", "Sunamganj", "Narayanganj", "Gazipur",
    "Tangail", "Jamalpur", "Sherpur", "Netrokona", "Kishoreganj",
    "Manikganj", "Munshiganj", "Faridpur", "Gopalganj", "Madaripur",
    "Shariatpur", "Pabna", "Sirajganj", "Natore", "Kushtia", "Meherpur",
    "Chuadanga", "Jhenaidah", "Magura", "Satkhira", "Bagerhat", "Pirojpur",
    "Jhalokati", "Bhola", "Patuakhali", "Barguna", "Dinajpur", "Thakurgaon",
    "Panchagarh", "Kurigram", "Gaibandha", "Nilphamari", "Lalmonirhat",
    "Joypurhat", "Chapainawabganj", "Nawabganj", "Bandarban", "Khagrachhari",
    "Rangunia", "Anwara", "Patiya", "Lohagara", "Satkania", "Chakaria",
    "Teknaf", "Ukhia", "Ramgati", "Kamalnagar", "Sonaimuri", "Hatiya",
    "Sandwip", "Mirsharai", "Fatikchhari", "Raozan", "Rangamati", "Bandarban",
    "Khagrachhari", "Rangunia", "Anwara", "Patiya", "Lohagara", "Satkania",
    "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar", "Sonaimuri",
    "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan", "Rangamati",
    "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya", "Lohagara",
    "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati", "Bandarban", "Khagrachhari", "Rangunia", "Anwara", "Patiya",
    "Lohagara", "Satkania", "Chakaria", "Teknaf", "Ukhia", "Ramgati", "Kamalnagar",
    "Sonaimuri", "Hatiya", "Sandwip", "Mirsharai", "Fatikchhari", "Raozan",
    "Rangamati"
]

def clear_db(db: Session):
    print("Clearing existing trip-related data...")
    try:
        # Use raw SQL for faster deletion and to avoid FK constraints if any
        db.execute(text("DELETE FROM refunds"))
        db.execute(text("DELETE FROM tickets"))
        db.execute(text("DELETE FROM trips"))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning during clear: {e} (Attempting partial clear)")
        # Fallback for manual deletion if order fails
        db.query(models.Refund).delete()
        db.query(models.Ticket).delete()
        db.query(models.Trip).delete()
        db.commit()
    print("Existing data cleared.")

def get_or_create_bus_cached(db: Session, trip_data: dict, bus_cache: dict):
    operator = trip_data.get('operator') or trip_data.get('bus_name', 'Unknown')
    bus_type = trip_data.get('type') or trip_data.get('bus_type', 'Standard')
    total_seats = trip_data.get('total_seats', 36)
    bus_identifier = f"{operator} - {bus_type}"
    
    if bus_identifier in bus_cache:
        return bus_cache[bus_identifier]
        
    bus = db.query(models.Bus).filter(models.Bus.bus_number == bus_identifier).first()
    if not bus:
        bus = models.Bus(
            bus_number=bus_identifier,
            total_seats=total_seats,
            type=bus_type
        )
        db.add(bus)
        db.flush() # Get ID
        
    bus_cache[bus_identifier] = bus
    return bus

def seed_routes(db: Session):
    today = datetime.now()
    today_str = today.strftime("%Y-%m-%d")
    
    routes = []
    for city in POPULAR_CITIES:
        if city != "Dhaka":
            routes.append(("Dhaka", city))
            routes.append((city, "Dhaka"))
    
    print(f"Planning to seed {len(routes)} routes for the next 7 days.")
    
    total_trips_created = 0
    bus_cache = {}
    
    for origin, destination in routes:
        print(f"\nScraping {origin} -> {destination} for {today_str}...")
        try:
            scraped_trips = scrape_shohoz(origin, destination, today_str)
        except Exception as e:
            print(f"Scraper error for {origin}->{destination}: {e}")
            continue
            
        if not scraped_trips:
            print(f"No trips found for {origin} -> {destination}.")
            continue
            
        print(f"Found {len(scraped_trips)} base trips. Projecting over 7 days...")
        
        for base_trip in scraped_trips:
            # Pre-fetch/create bus for this base trip
            bus = get_or_create_bus_cached(db, base_trip, bus_cache)
            
            for day_offset in range(7):
                target_date = today + timedelta(days=day_offset)
                target_date_str = target_date.strftime("%Y-%m-%d")
                
                # Clone trip data and update date
                trip_data = base_trip.copy()
                trip_data['date'] = target_date_str
                
                departure_dt = trip_service.parse_trip_datetime(
                    target_date_str, 
                    trip_data.get('departure_time') or trip_data.get('time')
                )

                # Check if trip already exists to avoid duplicates in the same run
                existing_trip = db.query(models.Trip).filter(
                    models.Trip.bus_id == bus.id,
                    models.Trip.departure_time == departure_dt
                ).first()

                if not existing_trip:
                    new_trip = models.Trip(
                        bus_id=bus.id,
                        route=base_trip.get('route') or f"{origin}-{destination}",
                        from_location=origin,
                        to_location=destination,
                        departure_time=departure_dt,
                        base_fare=float(str(base_trip.get('price', 0)).replace(',', '')),
                        available_seats=int(base_trip.get('seats_available') or 36)
                    )
                    db.add(new_trip)
                    total_trips_created += 1
        
        # Commit per route
        db.commit()
        print(f"Finished routing: {origin} -> {destination}. Total trips created so far: {total_trips_created}")

def main():
    db = SessionLocal()
    try:
        clear_db(db)
        seed_routes(db)
        print("\n" + "="*30)
        print("SEEDING COMPLETED SUCCESSFULLY!")
        print(f"Trips created: {db.query(models.Trip).count()}")
        print("="*30)
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
