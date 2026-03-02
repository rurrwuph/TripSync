from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.schemas.all_schemas import UserCreate, UserOut, UserUpdate
import app.models.all_models as models
from app.core.security import Hash

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = Hash.bcrypt(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.get("/me")
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    """Get current user's profile including reward points."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "reward_points": current_user.reward_points or 0,
        "discount_eligible": (current_user.reward_points or 0) >= 10000,
        "discount_percent": 2 if (current_user.reward_points or 0) >= 10000 else 0
    }

@router.put("/me")
def update_current_user_profile(update: UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Update current user's profile (name and phone)."""
    if update.full_name is not None:
        current_user.full_name = update.full_name
    if update.phone is not None:
        current_user.phone = update.phone
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "reward_points": current_user.reward_points or 0,
        "message": "Profile updated successfully"
    }

@router.post("/me/use-points")
def use_points_discount(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Deduct 10,000 points for a 2% discount. Returns discount info."""
    if (current_user.reward_points or 0) < 10000:
        raise HTTPException(status_code=400, detail="Not enough points. Need 10,000 points for 2% discount.")
    
    current_user.reward_points -= 10000
    db.commit()
    db.refresh(current_user)
    
    return {
        "discount_percent": 2,
        "points_deducted": 10000,
        "remaining_points": current_user.reward_points,
        "message": "2% discount applied! 10,000 points deducted."
    }
