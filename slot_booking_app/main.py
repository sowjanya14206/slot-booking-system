from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import models
from database import engine
from fastapi.middleware.cors import CORSMiddleware
from routers import slots, bookings

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Slot Booking API")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

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
