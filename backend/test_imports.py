import sys
import os

# Add backend directory to path so we can import 'app'
sys.path.append(os.getcwd())

try:
    from app.main import app
    from app.models.all_models import User, Bus, Trip, Ticket, Refund
    from app.schemas.all_schemas import UserCreate
    print("Imports successful!")
except ImportError as e:
    print(f"Import failed: {e}")
    sys.exit(1)
except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
