from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class SlotBase(BaseModel):
    start_time: datetime
    end_time: datetime

class SlotCreate(SlotBase):
    pass

class SlotBooking(BaseModel):
    name: str
    email: EmailStr

class SlotResponse(SlotBase):
    id: int
    is_booked: bool
    booked_by_name: Optional[str] = None
    booked_by_email: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedSlotResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[SlotResponse]
