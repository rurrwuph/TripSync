from sqlalchemy import create_engine, text
import os
import pathlib
from dotenv import load_dotenv

current_dir = pathlib.Path(__file__).parent.resolve()
env_path = current_dir.parent / "src" / "stores" / "TripSync.env"
load_dotenv(env_path)
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and (DATABASE_URL.startswith("'") or DATABASE_URL.startswith('"')):
    DATABASE_URL = DATABASE_URL[1:-1]

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        print("Adding columns to 'trips' table...")
        try:
            conn.execute(text("ALTER TABLE trips ADD COLUMN from_location VARCHAR"))
            print("Added 'from_location'.")
        except Exception as e:
            print(f"Error adding from_location: {e}")

        try:
            conn.execute(text("ALTER TABLE trips ADD COLUMN to_location VARCHAR"))
            print("Added 'to_location'.")
        except Exception as e:
            print(f"Error adding to_location: {e}")

if __name__ == "__main__":
    migrate()
