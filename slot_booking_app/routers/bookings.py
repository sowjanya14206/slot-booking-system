from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from slot_booking_app import schemas
from slot_booking_app.database import get_db
from slot_booking_app.services import slot_service

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)

@router.get("/", response_model=List[schemas.SlotResponse])
def read_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return slot_service.get_booked_slots(db, skip, limit)
