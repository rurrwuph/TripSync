import random
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import app.models.all_models as models

# --- Helper Functions ---

def parse_trip_datetime(date_str, time_str):
    try:
        # Pre-process time_str (Shohoz sometimes has extra spaces or weird chars)
        time_str = str(time_str).strip().upper()
        
        # If it's already a full datetime from scraper (unlikely but possible)
        if " " in time_str and len(time_str) > 10:
             try: return datetime.fromisoformat(time_str)
             except: pass

        if date_str and time_str:
             # Try standard formats: "10:30 PM", "23:55:00", "23:55"
             for fmt in ("%I:%M %p", "%H:%M:%S", "%H:%M", "%I:%M%p"):
                 try:
                     parsed_time = datetime.strptime(time_str, fmt).time()
                     parsed_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                     return datetime.combine(parsed_date, parsed_time)
                 except ValueError:
                     continue
        
        # Fallback to just the date if time fails
        if date_str:
            return datetime.strptime(date_str, "%Y-%m-%d")
            
        return datetime.now()
    except Exception as e:
        print(f"CRITICAL PARSE ERROR: date={date_str}, time={time_str} | {e}")
        return datetime.now()

def get_all_possible_seats(total_seats: int):
    seat_letters = ['A', 'B', 'C', 'D']
    all_seats = []
    rows = (total_seats + 3) // 4
    for r in range(1, rows + 1):
        for c in range(4):
            if len(all_seats) < total_seats:
                all_seats.append(f"{seat_letters[c]}{r}")
    return all_seats

def get_mock_booked_seats(trip_id: int, total_seats: int, real_booked: list, mock_count: int):
    """
    Generates deterministic mock bookings using trip_id as seed.
    """
    rnd = random.Random(trip_id)
    all_possible = get_all_possible_seats(total_seats)
    
    available_pool = [s for s in all_possible if s not in real_booked]
    if not available_pool:
        return []
        
    mock_booked = rnd.sample(available_pool, min(mock_count, len(available_pool)))
    return mock_booked


# --- Core Service Functions ---

def get_or_create_trip(db: Session, trip_data: dict, commit: bool = True):
    """
    Finds or creates a single trip/bus. 
    Prioritizes lookup by ID if provided in trip_data.
    """
    # 0. Check by ID first (High Reliability)
    trip_id = trip_data.get('id') or trip_data.get('trip_id')
    if trip_id:
        try:
            # Handle string IDs if passed from JS
            res_id = int(trip_id)
            trip = db.query(models.Trip).filter(models.Trip.id == res_id).first()
            if trip:
                return trip
        except (ValueError, TypeError):
            pass

    # 1. Fallback to lookup by bus + departure time
    operator = trip_data.get('operator') or trip_data.get('bus_name', 'Unknown')
    bus_type = trip_data.get('type') or trip_data.get('bus_type', 'Standard')
    total_seats = trip_data.get('total_seats', 36)
    
    bus_identifier = f"{operator} - {bus_type}"
    bus = db.query(models.Bus).filter(models.Bus.bus_number == bus_identifier).first()
    
    if not bus:
        bus = models.Bus(
            bus_number=bus_identifier,
            total_seats=total_seats,
            type=bus_type
        )
        db.add(bus)
        if commit:
            db.commit()
            db.refresh(bus)
    elif bus and bus.total_seats != total_seats and total_seats != 36:
        bus.total_seats = total_seats
        if commit:
            db.commit()
            db.refresh(bus)

    departure_dt = parse_trip_datetime(
        trip_data.get('date'), 
        trip_data.get('departure_time') or trip_data.get('time')
    )

    from_loc = trip_data.get('from') or trip_data.get('from_location')
    to_loc = trip_data.get('to') or trip_data.get('to_location')
    route_str = trip_data.get('route') or f"{from_loc}-{to_loc}"

    trip = db.query(models.Trip).filter(
        models.Trip.bus_id == bus.id if (bus and bus.id) else False,
        models.Trip.departure_time == departure_dt
    ).first()

    if not trip:
        trip = models.Trip(
            bus_id=bus.id if (bus and bus.id) else None,
            route=route_str,
            from_location=from_loc,
            to_location=to_loc,
            departure_time=departure_dt,
            base_fare=float(str(trip_data.get('price', 0)).replace(',', ''))
        )
        db.add(trip)
        if commit:
            db.commit()
            db.refresh(trip)
    
    return trip


def get_seat_overlay(db: Session, trip_details: dict):
    """
    Returns union of real and mock booked seat numbers.
    Consistent with the availability shown in search results.
    """
    trip = get_or_create_trip(db, trip_details)
    db.refresh(trip)
    
    total_cap = trip.bus.total_seats if (trip.bus and trip.bus.total_seats) else 36
    # Robust Lookup: Check for both possible field names from search
    scraper_avail = int(trip_details.get('available_seats') or trip_details.get('seats_available') or 36)
    
    # shohoz_booked_count represents the total external bookings
    shohoz_booked_count = max(0, total_cap - scraper_avail)
    if shohoz_booked_count == 0:
        rnd = random.Random(trip.id)
        shohoz_booked_count = rnd.randint(2, 4)
        
    real_booked_objs = db.query(models.Ticket.seat_number).filter(
        models.Ticket.trip_id == trip.id,
        models.Ticket.status == "booked"
    ).all()
    real_booked = [s[0] for s in real_booked_objs]
    
    # We want additive logic: Mock (Shohoz) + Real (Local)
    # So if Shohoz says 4 booked, we freeze 4 mock seats.
    # If user books 1 real seat, total booked = 5.
    effective_mock_count = max(0, shohoz_booked_count)
    
    # Ensure we don't return more mock seats than physically possible
    # (Total Cap - Real Booked) is the max room left for mocks
    max_possible_mocks = max(0, total_cap - len(real_booked))
    effective_mock_count = min(effective_mock_count, max_possible_mocks)
    
    mock_booked = get_mock_booked_seats(trip.id, total_cap, real_booked, effective_mock_count)
    return list(set(real_booked + mock_booked))


def enrich_trips_with_availability(db: Session, trips: list):
    """
    High-Performance Batch Optimization:
    Syncs buses and trips in bulk to avoid N+1 query problem.
    """
    if not trips:
        return []

    # 1. Prepare data structures
    bus_map = {} # Key: "Operator - Type", Value: Bus Object
    trip_map = {} # Key: (bus_id, departure_time), Value: Trip Object
    
    # 2. Identify unique buses
    unique_buses = {}
    for t in trips:
        op = t.get('operator') or t.get('bus_name', 'Unknown')
        bt = t.get('type') or t.get('bus_type', 'Standard')
        identifier = f"{op} - {bt}"
        total_seats = t.get('total_seats', 36)
        if identifier not in unique_buses:
            unique_buses[identifier] = {"total_seats": total_seats, "type": bt}
    
    # 3. Batch Fetch Existing Buses
    existing_buses = db.query(models.Bus).filter(
        models.Bus.bus_number.in_(unique_buses.keys())
    ).all()
    
    for b in existing_buses:
        bus_map[b.bus_number] = b
        # Update seat count if changed (in memory only for now, could recurse if needed)
        # For speed, we assume DB capacity is reasonably up to date or we trust scraper for this session
    
    # 4. Create Missing Buses
    new_buses = []
    for identifier, data in unique_buses.items():
        if identifier not in bus_map:
            new_bus = models.Bus(
                bus_number=identifier,
                total_seats=data['total_seats'],
                type=data['type']
            )
            new_buses.append(new_bus)
            bus_map[identifier] = new_bus # Pre-add to map (will need ID after flush)
    
    if new_buses:
        db.add_all(new_buses)
        db.flush() # Get IDs
        
        # Re-map ensures we have IDs
        for b in new_buses:
             bus_map[b.bus_number] = b

    # 5. Prepare Trips for Bulk Check
    # We need to map each scraper trip to its bus_id
    trips_to_sync = []
    
    for t in trips:
        op = t.get('operator') or t.get('bus_name', 'Unknown')
        bt = t.get('type') or t.get('bus_type', 'Standard')
        identifier = f"{op} - {bt}"
        bus = bus_map.get(identifier)
        
        dep_dt = parse_trip_datetime(
             t.get('date'), 
             t.get('departure_time') or t.get('time')
        )
        
        trips_to_sync.append({
            "scraper_data": t,
            "bus_id": bus.id,
            "departure_time": dep_dt,
            "key": (bus.id, dep_dt)
        })

    # 6. Batch Fetch Existing Trips
    # Using a composite logic: filter trips where bus_id IN (...) AND departure_time IN (...)
    # This might return false positives (cross product), but we filter in python.
    # A stricter way is tuple comparison but iterating is often fine for small batches (50-100).
    
    relevant_bus_ids = {x['bus_id'] for x in trips_to_sync}
    relevant_times = {x['departure_time'] for x in trips_to_sync}
    
    potential_trips = db.query(models.Trip).filter(
        models.Trip.bus_id.in_(relevant_bus_ids),
        models.Trip.departure_time.in_(relevant_times)
    ).all()

    for pt in potential_trips:
        trip_map[(pt.bus_id, pt.departure_time)] = pt

    # 7. Create Missing Trips
    new_trips_objects = []
    for item in trips_to_sync:
        key = item['key']
        if key not in trip_map:
            t = item['scraper_data']
            from_loc = t.get('from') or t.get('from_location')
            to_loc = t.get('to') or t.get('to_location')
            route = t.get('route') or f"{from_loc}-{to_loc}"
            price = float(str(t.get('price', 0)).replace(',', ''))
            
            new_trip = models.Trip(
                bus_id=item['bus_id'],
                route=route,
                from_location=from_loc,
                to_location=to_loc,
                departure_time=item['departure_time'],
                base_fare=price
            )
            new_trips_objects.append(new_trip)
            trip_map[key] = new_trip # Optimistic add

    if new_trips_objects:
        db.add_all(new_trips_objects)
        db.flush()

    # 8. Batch Ticket Counts
    # We need booking counts for all these trip IDs
    all_trip_ids = [t.id for t in trip_map.values()]
    
    # Query: SELECT trip_id, COUNT(*) FROM tickets WHERE status='booked' AND trip_id IN (...) GROUP BY trip_id
    booking_counts = {}
    if all_trip_ids:
        rows = db.query(
            models.Ticket.trip_id, 
            func.count(models.Ticket.id)
        ).filter(
            models.Ticket.trip_id.in_(all_trip_ids),
            models.Ticket.status == "booked"
        ).group_by(models.Ticket.trip_id).all()
        
        for trip_id, count in rows:
            booking_counts[trip_id] = count

    # 9. Final Enrichment Calculation
    for item in trips_to_sync:
        trip_obj = trip_map.get(item['key'])
        if not trip_obj: continue
        
        t_data = item['scraper_data']
        
        # Safely get bus capacity (use object or map)
        total_capacity = bus_map[trip_obj.bus.bus_number].total_seats if trip_obj.bus else (trip_obj.bus.total_seats if trip_obj.bus else 36)
        # Use scraper capacity if available in mapping
        
        scraper_avail = int(t_data.get('seats_available', 0))
        
        # Base occupancy
        shohoz_booked = max(0, total_capacity - scraper_avail)
        if shohoz_booked == 0:
            rnd = random.Random(trip_obj.id)
            shohoz_booked = rnd.randint(2, 4)
            
        real_booked_count = booking_counts.get(trip_obj.id, 0)
        
        # Additive Logic: Available = Total - (Shohoz + Real)
        available = max(0, total_capacity - shohoz_booked - real_booked_count)
        
        t_data.update({
            "id": trip_obj.id,
            "available_seats": available,
            "seats_available": available,
            "total_seats": total_capacity,
            "seats": available
        })

    db.commit()
    return trips
