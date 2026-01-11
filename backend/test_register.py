from fastapi.testclient import TestClient
from main import app
import uuid

client = TestClient(app)

def test_register_user():
    # Use a random email to avoid collision on repeated runs
    random_email = f"test_{uuid.uuid4()}@example.com"
    payload = {
        "full_name": "Test User",
        "email": random_email,
        "password": "securepassword123"
    }
    
    response = client.post("/users/register", json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("Registration Successful!")
        print(f"User ID: {data.get('id')}")
        print(f"Email: {data.get('email')}")
        assert data["email"] == random_email
        assert "id" in data
    else:
        print(f"Registration Failed: {response.status_code}")
        print(response.json())
        exit(1)

if __name__ == "__main__":
    test_register_user()
