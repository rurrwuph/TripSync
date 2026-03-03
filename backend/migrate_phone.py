"""Migration script to add phone column to users table."""
from app.core.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR;"))
        conn.commit()
    print("Migration complete: 'phone' column added to users table.")

if __name__ == "__main__":
    migrate()
