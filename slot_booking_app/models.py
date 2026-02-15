from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
import datetime

class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, unique=True, nullable=False)
    end_time = Column(DateTime, nullable=False)
    is_booked = Column(Boolean, default=False)
    booked_by_name = Column(String(100), nullable=True)
    booked_by_email = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
