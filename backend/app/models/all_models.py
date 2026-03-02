from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="customer")  # 'customer', 'admin', 'manager'
    reward_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tickets = relationship("Ticket", back_populates="user")
    bookings = relationship("Booking", back_populates="user")

class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String, unique=True, index=True)
    total_seats = Column(Integer)
    type = Column(String)  # e.g., 'AC', 'Non-AC', 'Sleeper'

    trips = relationship("Trip", back_populates="bus")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"))
    route = Column(String) # e.g. "Dhaka-Chittagong"
    from_location = Column(String)
    to_location = Column(String)
    departure_time = Column(DateTime)
    base_fare = Column(Float)
    available_seats = Column(Integer, default=36) # Added to persist scraper/seed data

    bus = relationship("Bus", back_populates="trips")
    tickets = relationship("Ticket", back_populates="trip")
    bookings = relationship("Booking", back_populates="trip")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    trip_id = Column(Integer, ForeignKey("trips.id"))
    status = Column(String, default="PENDING_PAYMENT") # PENDING_PAYMENT, CONFIRMED, PARTIALLY_CANCELLED, CANCELLED
    total_price = Column(Float)
    expires_at = Column(DateTime(timezone=True)) # UTC
    payment_timestamp = Column(DateTime(timezone=True)) # New field
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="bookings")
    trip = relationship("Trip", back_populates="bookings")
    tickets = relationship("Ticket", back_populates="booking")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    trip_id = Column(Integer, ForeignKey("trips.id"))
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True) # Optional for backward compatibility
    seat_number = Column(String)
    status = Column(String, default="HELD") # HELD, BOOKED, RELEASED
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="tickets")
    trip = relationship("Trip", back_populates="tickets")
    booking = relationship("Booking", back_populates="tickets")
    refund = relationship("Refund", uselist=False, back_populates="ticket")

    __table_args__ = (UniqueConstraint('trip_id', 'seat_number', name='_trip_seat_uc'),)

class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), unique=True, nullable=True) # Keep for backward compatibility/single
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True) # New
    ticket_ids = Column(String, nullable=True) # Comma-separated IDs: "1,2,3"
    seat_numbers = Column(String, nullable=True) # Comma-separated seats: "A1,A2"
    amount = Column(Float)
    cause = Column(String, nullable=True)
    refund_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="pending") # pending, approved, rejected

    ticket = relationship("Ticket", back_populates="refund")
    booking = relationship("Booking")
