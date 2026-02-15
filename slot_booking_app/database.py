from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL format: mysql+pymysql://<username>:<password>@<host>/<dbname>
# Update these credentials as needed
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:sowji@localhost:5432/slot_booking"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
