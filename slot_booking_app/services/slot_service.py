from sqlalchemy.orm import Session
from fastapi import HTTPException
from slot_booking_app import models, schemas

def get_slots(db: Session, skip: int = 0, limit: int = 10, available: bool = None):
    query = db.query(models.Slot)
    if available is not None:
        if available:
            query = query.filter(models.Slot.is_booked == False)
        else:
            query = query.filter(models.Slot.is_booked == True)
    
    return query.offset(skip).limit(limit).all()

def get_booked_slots(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Slot).filter(models.Slot.is_booked == True).offset(skip).limit(limit).all()

def create_slot(db: Session, slot: schemas.SlotCreate):
    db_slot = db.query(models.Slot).filter(models.Slot.start_time == slot.start_time).first()
    if db_slot:
        raise HTTPException(status_code=400, detail="Slot with this start time already exists")
    
    new_slot = models.Slot(
        start_time=slot.start_time,
        end_time=slot.end_time
    )
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)
    return new_slot

def book_slot(db: Session, slot_id: int, booking: schemas.SlotBooking):
    # Use with_for_update for row-level locking to prevent race conditions
    db_slot = db.query(models.Slot).filter(models.Slot.id == slot_id).with_for_update().first()
    
    if not db_slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if db_slot.is_booked:
        raise HTTPException(status_code=400, detail="Slot is already booked")
    
    db_slot.is_booked = True
    db_slot.booked_by_name = booking.name
    db_slot.booked_by_email = booking.email
    
    db.commit()
    db.refresh(db_slot)
    return db_slot
