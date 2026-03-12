from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class MedicineBase(BaseModel):
    name: str
    dosage: str
    frequency: str
    times: List[str]
    start_date: str
    end_date: str
    end_date: str
    notes: Optional[str] = None
    status: str = "upcoming"
    inventory: int = 0
    dependent_name: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class Medicine(MedicineBase):
    id: str
    owner_id: int

    model_config = ConfigDict(from_attributes=True)

class LogBase(BaseModel):
    medicine_id: str
    medicine_name: str
    dosage: str
    scheduled_time: str
    date: str
    status: str
    taken_at: Optional[str] = None

class LogCreate(LogBase):
    id: str

class Log(LogBase):
    id: str
    owner_id: int

    model_config = ConfigDict(from_attributes=True)

class VitalLogBase(BaseModel):
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    blood_sugar: Optional[int] = None
    temperature: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    date: str
    time: str

class VitalLogCreate(VitalLogBase):
    pass

class VitalLog(VitalLogBase):
    id: str
    owner_id: int

    model_config = ConfigDict(from_attributes=True)

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    medicines: List[Medicine] = []
    logs: List[Log] = []

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
