from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from slot_booking_app import models
from slot_booking_app.database import engine
from fastapi.middleware.cors import CORSMiddleware
from slot_booking_app.routers import slots, bookings

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Slot Booking API")

# Mount static files
BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(slots.router)
app.include_router(bookings.router)
