from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: EmailStr
    role: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# --- Bus Schemas ---
class BusBase(BaseModel):
    bus_number: str
    total_seats: int
    type: str

class BusCreate(BusBase):
    pass

class BusOut(BusBase):
    id: int
    class Config:
        from_attributes = True

# --- Trip Schemas ---
class TripBase(BaseModel):
    bus_id: int
    route: str
    departure_time: datetime
    base_fare: float

class TripCreate(TripBase):
    pass

class TripOut(TripBase):
    id: int
    bus: Optional[BusOut] = None
    class Config:
        from_attributes = True

# --- Ticket Schemas ---
class TicketBase(BaseModel):
    trip_id: int
    seat_number: str

class TicketCreate(TicketBase):
    pass

class TicketOut(TicketBase):
    id: int
    user_id: int
    status: str
    trip: Optional[TripOut] = None
    class Config:
        from_attributes = True

# --- Refund Schemas ---
class RefundCreate(BaseModel):
    ticket_id: int
    amount: float

class RefundOut(RefundCreate):
    id: int
    refund_date: datetime
    status: str
    class Config:
        from_attributes = True

# --- Booking Schemas ---
class BookingRequest(BaseModel):
    user_email: EmailStr
    trip_details: dict  # Contains scraped trip info
    selected_seats: List[str]
    total_price: float
