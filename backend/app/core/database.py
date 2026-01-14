import os
import pathlib
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Robust env loading (same as main.py to ensuring standalone usage)
current_dir = pathlib.Path(__file__).parent.resolve()
# Up 3 levels: core -> app -> backend -> root, then src/stores
env_path = current_dir.parent.parent.parent / "src" / "stores" / "TripSync.env"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and (DATABASE_URL.startswith("'") or DATABASE_URL.startswith('"')):
    DATABASE_URL = DATABASE_URL[1:-1]

if not DATABASE_URL:
    print("WARNING: DATABASE_URL not found in env. DB operations will fail.")
    # Fallback to prevent immediate import crash, but connection will fail
    DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
