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
    from_location: Optional[str] = None
    to_location: Optional[str] = None
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
    refund_status: Optional[str] = None # New field
    class Config:
        from_attributes = True

# --- Refund Schemas ---
class RefundCreate(BaseModel):
    ticket_id: Optional[int] = None # For backward compatibility
    ticket_ids: Optional[List[int]] = None # New format
    seat_numbers: Optional[List[str]] = None # New format
    user_email: str
    amount: float
    cause: str

class RefundOut(BaseModel):
    id: int
    ticket_id: Optional[int] = None
    ticket_ids: Optional[str] = None
    seat_numbers: Optional[str] = None
    amount: float
    cause: str
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

class AvailabilityRequest(BaseModel):
    trip_details: dict
