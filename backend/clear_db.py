from app.core.database import engine, Base
import app.models.all_models as models
from sqlalchemy import text

def reset_db():
    print("Dropping existing tables...")
    with engine.connect() as conn:
        # Drop with CASCADE if supported or in order
        conn.execute(text("DROP TABLE IF EXISTS refunds CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS tickets CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS bookings CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS trips CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS buses CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
        conn.commit()
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Done!")

if __name__ == "__main__":
    reset_db()
