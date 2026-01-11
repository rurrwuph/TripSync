from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def test_create_bus():
    bus_number = f"BUS-{uuid.uuid4().hex[:6]}"
    payload = {
        "bus_number": bus_number,
        "total_seats": 40,
        "type": "AC"
    }
    
    response = client.post("/buses/", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("Bus Creation Successful!")
        print(f"Bus ID: {data.get('id')}")
        print(f"Bus Number: {data.get('bus_number')}")
        assert data["bus_number"] == bus_number
        assert data["total_seats"] == 40
        assert "id" in data
    else:
        print(f"Bus Creation Failed: {response.status_code}")
        print(response.json())
        exit(1)

if __name__ == "__main__":
    test_create_bus()
