from app.core.database import engine
from sqlalchemy import text
import sys
import os
import pathlib

# Add the backend directory to sys.path
current_dir = pathlib.Path(__file__).parent.resolve()
sys.path.append(str(current_dir))

def migrate():
    print("Starting migration: Adding available_seats to trips table...")
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE trips ADD COLUMN IF NOT EXISTS available_seats INTEGER DEFAULT 36"))
            conn.commit()
        print("Migration successful! Column 'available_seats' added to 'trips' table.")
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
