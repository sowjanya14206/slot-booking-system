from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
import schemas
from database import get_db
from services import slot_service

router = APIRouter(
    prefix="/slots",
    tags=["Slots"]
)

@router.post("/", response_model=schemas.SlotResponse, status_code=status.HTTP_201_CREATED)
def create_slot(slot: schemas.SlotCreate, db: Session = Depends(get_db)):
    return slot_service.create_slot(db, slot)

@router.get("/", response_model=List[schemas.SlotResponse])
def read_slots(skip: int = 0, limit: int = 10, available: bool = None, db: Session = Depends(get_db)):
    return slot_service.get_slots(db, skip, limit, available)

@router.post("/{slot_id}/book", response_model=schemas.SlotResponse)
def book_slot(slot_id: int, booking: schemas.SlotBooking, db: Session = Depends(get_db)):
    return slot_service.book_slot(db, slot_id, booking)
