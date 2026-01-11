from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def test_book_ticket():
    # 1. Register a user first to get a valid email
    random_email = f"booker_{uuid.uuid4().hex[:6]}@example.com"
    user_payload = {
        "full_name": "Booker User",
        "email": random_email,
        "password": "password123"
    }
    client.post("/users/register", json=user_payload)

    # 2. Prepare Booking Payload (simulating what frontend sends)
    booking_payload = {
        "user_email": random_email,
        "trip_details": {
            "operator": "Hanif Enterprise",
            "type": "AC Scania",
            "route": "Dhaka - Chittagong",
            "departure_time": "11:00 PM",
            "date": "2024-12-25",
            "price": "1500",
            "total_seats": 40
        },
        "selected_seats": ["A1", "A2"],
        "total_price": 3000
    }

    # 3. Call Booking Endpoint
    response = client.post("/tickets/book", json=booking_payload)
    
    if response.status_code == 200:
        data = response.json()
        print("Booking Successful!")
        print(f"Tickets Created: {len(data)}")
        print(f"First Ticket Seat: {data[0]['seat_number']}")
        
        assert len(data) == 2
        assert data[0]['seat_number'] in ["A1", "A2"]
        assert data[1]['seat_number'] in ["A1", "A2"]
    else:
        print(f"Booking Failed: {response.status_code}")
        print(response.json())
        exit(1)

if __name__ == "__main__":
    test_book_ticket()
