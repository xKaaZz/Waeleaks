from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

POSTGRES_USER = quote_plus(os.getenv("POSTGRES_USER", "xkaazz"))
POSTGRES_PASSWORD = quote_plus(os.getenv("POSTGRES_PASSWORD", "blade91"))
POSTGRES_DB = quote_plus(os.getenv("POSTGRES_DB", "waeleaks"))
POSTGRES_HOST = quote_plus(os.getenv("POSTGRES_HOST", "localhost"))
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")

SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"client_encoding": "utf8"}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 