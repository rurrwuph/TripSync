"""Migration: Add reward_points column to users table."""
import pathlib
from dotenv import load_dotenv
import os

current_dir = pathlib.Path(__file__).parent.resolve()
env_path = current_dir.parent / "src" / "stores" / "TripSync.env"
load_dotenv(env_path)

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and (DATABASE_URL.startswith("'") or DATABASE_URL.startswith('"')):
    DATABASE_URL = DATABASE_URL[1:-1]

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN reward_points INTEGER DEFAULT 0"))
        conn.commit()
        print("✓ Added reward_points column to users table")
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
            print("✓ reward_points column already exists")
        else:
            print(f"Error: {e}")
