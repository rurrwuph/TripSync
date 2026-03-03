from app.core.database import engine
from sqlalchemy import text

def migrate():
    print("Starting migration: Add payment_timestamp to bookings")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN payment_timestamp TIMESTAMP WITH TIME ZONE"))
            conn.commit()
            print("Successfully added payment_timestamp column.")
        except Exception as e:
            conn.rollback()
            if "already exists" in str(e).lower():
                print("Column payment_timestamp already exists.")
            else:
                print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
