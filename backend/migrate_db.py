from sqlalchemy import create_engine, text
import os
import pathlib
from dotenv import load_dotenv

# Load env manually to ensure we have the correct URL
current_dir = pathlib.Path(__file__).parent.resolve()
env_path = current_dir.parent / "src" / "stores" / "TripSync.env"
load_dotenv(env_path)
DATABASE_URL = os.getenv("DATABASE_URL")

# Strip quotes if present
if DATABASE_URL and (DATABASE_URL.startswith("'") or DATABASE_URL.startswith('"')):
    DATABASE_URL = DATABASE_URL[1:-1]

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        print("Starting migrations...")
        
        # Add created_at to tickets
        try:
            conn.execute(text("ALTER TABLE tickets ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"))
            print("Added 'created_at' to 'tickets'.")
        except Exception as e:
            print(f"Tickets created_at: {e}")

        # Add created_at to users
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"))
            print("Added 'created_at' to 'users'.")
        except Exception as e:
            print(f"Users created_at: {e}")

        # Add role to users
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'customer'"))
            print("Added 'role' to 'users'.")
        except Exception as e:
            print(f"Users role: {e}")

if __name__ == "__main__":
    migrate()
