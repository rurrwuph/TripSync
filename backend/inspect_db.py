from app.core.database import SessionLocal
from app.models.all_models import Ticket
from sqlalchemy import text

def inspect_db():
    db = SessionLocal()
    try:
        # 1. Total count
        count = db.query(Ticket).count()
        print(f"Total Tickets in DB: {count}")
        
        # 2. Sample data with created_at
        tickets = db.query(Ticket).limit(10).all()
        for t in tickets:
            print(f"Ticket ID: {t.id}, Created At: {t.created_at}, Status: {t.status}")
            
        # 3. Check if table existed before and if data is lost
        # (Though usually count 0 means no data)
    finally:
        db.close()

if __name__ == "__main__":
    inspect_db()
