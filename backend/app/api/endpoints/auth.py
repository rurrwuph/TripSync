from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas import all_schemas as schemas
import app.models.all_models as models
from app.core.security import Hash, create_access_token
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Invalid credentials")
    
    if not Hash.verify(request.password, user.hashed_password):
        raise HTTPException(status_code=404, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role,
            "reward_points": user.reward_points or 0
        }
    }

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = Hash.bcrypt(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        phone=user.phone,
        role="passenger" # Default
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": new_user.email,
            "full_name": new_user.full_name,
            "phone": new_user.phone,
            "role": new_user.role,
            "reward_points": new_user.reward_points or 0
        }
    }
