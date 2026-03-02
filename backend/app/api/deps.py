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
from fastapi.security import OAuth2PasswordBearer
from app.core.security import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_admin(user: models.User = Depends(get_current_user)):
    if user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user
