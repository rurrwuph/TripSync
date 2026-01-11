from app.core.database import SessionLocal
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
import app.models.all_models as models # Import models to query user

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Mock Authentication for now - In production, verify JWT token
# We will use 'user_email' header for simplicity if no full auth system
def get_current_user(user_email: str = Header(None), db: Session = Depends(get_db)):
    if not user_email:
        # For testing, return a mock admin if needed or raise error
        # return None
        raise HTTPException(status_code=401, detail="Authentication required (Header 'user-email')")
    
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_admin(user: models.User = Depends(get_current_user)):
    if user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user
