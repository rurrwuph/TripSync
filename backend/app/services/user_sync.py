import json
import pathlib
from sqlalchemy.orm import Session
from app.models.all_models import User
from app.core.security import Hash
from app.core.database import SessionLocal

def sync_users_from_json():
    """
    Reads src/assets/accounts.json and ensures users/admins exist in the DB.
    Does NOT overwrite existing users to preserve user data.
    """
    print("\n--- Starting User Sync from JSON ---")
    
    # Resolve path to src/assets/accounts.json
    # current file: backend/app/services/user_sync.py
    # target:       src/assets/accounts.json
    # Path: ../../../src/assets/accounts.json
    
    current_dir = pathlib.Path(__file__).parent.resolve()
    json_path = current_dir.parent.parent.parent / "src" / "assets" / "accounts.json"
    
    if not json_path.exists():
        print(f"WARNING: accounts.json not found at {json_path}. Skipping sync.")
        return

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        db = SessionLocal()
        
        # Process Admins
        admins = data.get("admins", [])
        for admin_data in admins:
            email = admin_data.get("email")
            if not email:
                continue
                
            existing_user = db.query(User).filter(User.email == email).first()
            if not existing_user:
                print(f"Creating NEW ADMIN: {email}")
                new_admin = User(
                    email=email,
                    hashed_password=Hash.bcrypt(admin_data.get("password", "admin123")),
                    full_name=admin_data.get("fullname", "Admin"),
                    role="admin"
                )
                db.add(new_admin)
            else:
                print(f"Admin already exists: {email} (Skipping)")

        # Process Regular Users
        users = data.get("users", [])
        for user_data in users:
            email = user_data.get("email")
            if not email:
                continue
                
            existing_user = db.query(User).filter(User.email == email).first()
            if not existing_user:
                print(f"Creating NEW USER: {email}")
                new_user = User(
                    email=email,
                    hashed_password=Hash.bcrypt(user_data.get("password", "123456")),
                    full_name=user_data.get("fullname", "User"),
                    role="customer"
                )
                db.add(new_user)
            else:
                # Optional: could update info if needed, but safer to skip
                print(f"User already exists: {email} (Skipping)")

        db.commit()
        db.close()
        print("--- User Sync Completed ---\n")
        
    except Exception as e:
        print(f"ERROR during user sync: {e}")
