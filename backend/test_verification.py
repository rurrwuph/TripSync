import requests
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
USER_EMAIL = "system@tripsync.com" # Updated to a valid user in DB

def test_booking_lifecycle():
    print("--- Testing Booking Lifecycle ---")
    
    # 1. Get a trip (from seed data)
    future_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
    search_payload = {
        "origin": "Dhaka",
        "destination": "Chittagong",
        "date": future_date
    }
    search_res = requests.post(f"{BASE_URL}/api/search", json=search_payload)
    trips = search_res.json().get("trips", [])
    if not trips:
        print("No trips found. Please run seed_trips.py first.")
        return
    
    trip = trips[0]
    trip_id = trip["trip_id"]
    print(f"Found trip: {trip_id} ({trip['operator']})")

    # 2. Create a "Pay Later" booking
    book_payload = {
        "user_email": USER_EMAIL,
        "trip_details": trip,
        "selected_seats": ["B1", "B2"],
        "total_price": trip["price"] * 2
    }
    print("Creating 'Pay Later' booking for seats B1, B2...")
    book_res = requests.post(f"{BASE_URL}/tickets/book", json=book_payload)
    if book_res.status_code != 200:
        print(f"Booking failed: {book_res.text}")
        return
    
    booking = book_res.json()
    booking_id = booking["id"]
    print(f"Booking created: {booking_id}, Status: {booking['status']}")

    # 3. Verify seats are HELD
    overlay_payload = {"trip_details": trip}
    overlay_res = requests.post(f"{BASE_URL}/tickets/seat-overlay", json=overlay_payload)
    booked_seats = overlay_res.json().get("booked_seats", [])
    print(f"Booked/Held seats (Overlay): {booked_seats}")
    if "B1" in booked_seats and "B2" in booked_seats:
        print("SUCCESS: Seats B1, B2 are HELD.")
    else:
        print("FAILURE: Seats B1, B2 are NOT held.")

    # 4. Confirm Booking
    print(f"Confirming booking {booking_id}...")
    confirm_res = requests.post(f"{BASE_URL}/tickets/confirm/{booking_id}")
    if confirm_res.status_code == 200:
        print(f"Booking confirmed: {confirm_res.json()['status']}")
    else:
        print(f"Confirmation failed: {confirm_res.text}")

    # 5. Partial Refund
    ticket_ids = [t["id"] for t in confirm_res.json()["tickets"] if t["seat_number"] == "B1"]
    print(f"Requesting partial refund for seat B1 (Ticket ID: {ticket_ids[0]})...")
    refund_payload = {
        "booking_id": booking_id,
        "ticket_ids": ticket_ids,
        "cause": "Testing Partial Cancellation"
    }
    refund_res = requests.post(f"{BASE_URL}/refunds/partial", json=refund_payload)
    if refund_res.status_code == 200:
        refund = refund_res.json()
        print(f"Refund processed! Amount: {refund['amount']}, Status: {refund['status']}")
    else:
        print(f"Refund failed: {refund_res.text}")

    # 6. Verify seat A1 is RELEASED and A2 is still BOOKED
    overlay_res = requests.post(f"{BASE_URL}/tickets/seat-overlay", json=overlay_payload)
    booked_seats = overlay_res.json().get("booked_seats", [])
    print(f"Updated Booked seats: {booked_seats}")
    if "B1" not in booked_seats and "B2" in booked_seats:
        print("SUCCESS: Seat B1 released, B2 still held.")
    else:
        print("FAILURE: Seat status mismatch after refund.")

if __name__ == "__main__":
    test_booking_lifecycle()
