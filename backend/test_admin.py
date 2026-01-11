from fastapi.testclient import TestClient
from main import app
from app.core.database import SessionLocal
import app.models.all_models as models
import uuid

client = TestClient(app)

def test_admin_features():
    db = SessionLocal()
    
    # 1. Create a regular user
    random_email = f"admin_test_{uuid.uuid4().hex[:6]}@example.com"
    user_payload = {
        "full_name": "Potential Admin",
        "email": random_email,
        "password": "password123"
    }
    # Create via API (default role = customer)
    client.post("/users/register", json=user_payload)
    
    # Verify user exists and is customer
    user = db.query(models.User).filter(models.User.email == random_email).first()
    assert user is not None
    assert user.role == "customer"
    
    # 2. Try to access Admin API as customer
    headers = {"user-email": random_email}
    response = client.get("/admin/dashboard/summary", headers=headers)
    
    if response.status_code == 403:
        print("PASS: Access Denied for customer")
    else:
        print(f"FAIL: Customer accessed admin API! Status: {response.status_code}")
        exit(1)

    # 3. Manually promote user to Admin
    user.role = "admin"
    db.commit()
    print("Promoted user to admin manually")

    # 4. Try to access Admin API as Admin
    response = client.get("/admin/dashboard/summary", headers=headers)
    if response.status_code == 200:
        print("PASS: Access Granted for Admin")
        data = response.json()
        print("Dashboard Summary:", data)
    else:
        print(f"FAIL: Admin denied access! Status: {response.status_code}")
        exit(1)

    # 5. Add a Bus as Admin
    bus_payload = {
        "bus_number": f"BUS-ADMIN-{uuid.uuid4().hex[:4]}",
        "total_seats": 50,
        "type": "Sleeper"
    }
    res_bus = client.post("/admin/buses", json=bus_payload, headers=headers)
    if res_bus.status_code == 200:
        print("PASS: Admin created bus")
        print("Bus:", res_bus.json())
    else:
        print(f"FAIL: Admin could not create bus. Status: {res_bus.status_code}")
        exit(1)

    db.close()

if __name__ == "__main__":
    test_admin_features()
