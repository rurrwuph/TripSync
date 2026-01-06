import requests
import json
from datetime import datetime

def inspect_trip():
    origin = "Dhaka"
    destination = "Rajshahi"
    date = datetime.now().strftime("%d-%b-%Y")
    
    search_url = "https://webapi.shohoz.com/v1.0/web/booking/bus/search-trips"
    params = {
        "from_city": origin,
        "to_city": destination,
        "date_of_journey": date,
        "dor": "" 
    }
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.shohoz.com/"
    }
    
    print(f"Searching...")
    try:
        resp = requests.get(search_url, params=params, headers=headers)
        data = resp.json()
        trips = data.get("data", {}).get("trips", {}).get("list", [])
        if trips:
            trip = trips[0]
            # Print all keys potentially related to seats
            print("Keys:", trip.keys())
            print("JSON:", json.dumps(trip, indent=2))
        else:
            print("No trips found.")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    inspect_trip()
