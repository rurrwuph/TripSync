from sqlalchemy import create_engine, inspect, text
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

def check():
    inspector = inspect(engine)
    print("Tables:", inspector.get_table_names())
    
    if "tickets" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("tickets")]
        print("Columns in 'tickets':", columns)
        
        with engine.connect() as conn:
            count = conn.execute(text("SELECT COUNT(*) FROM tickets")).scalar()
            print(f"Total rows in 'tickets': {count}")
            
            if count > 0:
                rows = conn.execute(text("SELECT * FROM tickets LIMIT 5")).fetchall()
                print("Sample rows:", rows)
    else:
        print("Table 'tickets' NOT FOUND!")

if __name__ == "__main__":
    check()
