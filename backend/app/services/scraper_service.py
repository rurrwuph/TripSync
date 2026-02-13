import argparse
import json
import sys
import requests
from datetime import datetime

def scrape_shohoz(origin, destination, date):
    """
    Scrapes bus trip details from Shohoz.com using their internal API.
    """
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
        formatted_date = dt.strftime("%d-%b-%Y")
    except ValueError:
        print(f"Invalid date format: {date}. Expected YYYY-MM-DD.", file=sys.stderr)
        return []

    base_url = "https://webapi.shohoz.com/v1.0/web"
    search_url = f"{base_url}/booking/bus/search-trips"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": f"https://www.shohoz.com/bus-tickets/booking/bus/search?fromcity={origin}&tocity={destination}&doj={formatted_date}&dor=",
        "Origin": "https://www.shohoz.com"
    }

    session = requests.Session()
    session.headers.update(headers)

    try:
        params = {
            "from_city": origin,
            "to_city": destination,
            "date_of_journey": formatted_date,
            "dor": "" 
        }
        print(f"Searching trips: {search_url} with params {params}", file=sys.stderr)
        
        response = session.get(search_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Navigate to trips list with fallback for nested structures
        # Structure observed: data -> trips -> list OR data -> data -> trips -> list
        
        response_data = data.get("data", {})
        
        # Check if 'trips' is directly here
        if "trips" in response_data:
             trips_list = response_data["trips"].get("list", [])
        # Check if nested in another 'data'
        elif "data" in response_data and "trips" in response_data["data"]:
             trips_list = response_data["data"]["trips"].get("list", [])
        else:
             # Fallback: search safely?
             trips_list = []
             print("Could not find 'trips' list in response structure.", file=sys.stderr)

        results = []
        for trip in trips_list:
            # Filter out 0 price trips
            price_str = str(trip.get("economy_class_fare", "0"))
            try:
                price_val = float(price_str.replace(",", ""))
            except ValueError:
                price_val = 0.0

            if price_val <= 0:
                continue

            # Estimate total seats based on bus type and availability
            bus_type = trip.get("bus_desc", "").lower()
            avail = int(trip.get("noOfSeatsAvailable", 0))
            
            if "sleeper" in bus_type or "double" in bus_type:
               # Sleepers often have 30 seats (3 columns, 10 rows)
               total_seats = max(30, avail + 2)
            else:
               # Standard buses are usually 4 columns. Round up to multiple of 4.
               raw_total = max(36, avail + 2)
               total_seats = ((raw_total + 3) // 4) * 4
               
            parsed_trip = {
                "operator": trip.get("company_name"),
                "type": trip.get("bus_desc"),
                "route": f"{trip.get('origin_city_name')} - {trip.get('destination_city_name')}",
                "departure_time": trip.get("departure_time"),
                "arrival_time": trip.get("arrival_time"),
                "price": trip.get("economy_class_fare"),
                "seats_available": trip.get("noOfSeatsAvailable"),
                "total_seats": total_seats,
                "trip_id": trip.get("trip_id")
            }
            results.append(parsed_trip)
            
        print(f"Found {len(results)} trips.", file=sys.stderr)
        return results

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape Shohoz Bus Tickets")
    parser.add_argument("--origin", required=True, help="Origin City")
    parser.add_argument("--destination", required=True, help="Destination City")
    parser.add_argument("--date", required=True, help="Date (YYYY-MM-DD)")
    
    args = parser.parse_args()
    
    data = scrape_shohoz(args.origin, args.destination, args.date)
    print(json.dumps(data, indent=2, ensure_ascii=False))
