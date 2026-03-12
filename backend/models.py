from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    phone = Column(String)
    avatar = Column(String, nullable=True)

    medicines = relationship("Medicine", back_populates="owner")
    logs = relationship("Log", back_populates="owner")

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    dosage = Column(String)
    frequency = Column(String)
    times = Column(JSON)  # Storing list of times as JSON
    start_date = Column(String)
    end_date = Column(String)
    notes = Column(String, nullable=True)
    status = Column(String) # upcoming, taken, missed (current status)
    inventory = Column(Integer, default=0) # Pills remaining
    dependent_name = Column(String, nullable=True) # Who this is for, null implies Self
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="medicines")

class Log(Base):
    __tablename__ = "logs"

    id = Column(String, primary_key=True, index=True)
    medicine_id = Column(String)
    medicine_name = Column(String)
    dosage = Column(String)
    scheduled_time = Column(String)
    date = Column(String)
    status = Column(String) # taken, missed, snoozed
    taken_at = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="logs")

class VitalLog(Base):
    __tablename__ = "vital_logs"

    id = Column(String, primary_key=True, index=True)
    blood_pressure = Column(String, nullable=True) # e.g., "120/80"
    heart_rate = Column(Integer, nullable=True) # e.g., 72
    blood_sugar = Column(Integer, nullable=True) # e.g., 100
    temperature = Column(String, nullable=True) # e.g., "98.6"
    symptoms = Column(String, nullable=True) # comma separated
    notes = Column(String, nullable=True)
    date = Column(String) # YYYY-MM-DD
    time = Column(String) # HH:MM
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User")
