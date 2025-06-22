# models.py

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from database import Base

track_collection_association = Table(
    "track_collection_association",
    Base.metadata,
    Column("track_id", ForeignKey("tracks.id"), primary_key=True),
    Column("collection_id", ForeignKey("collections.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    telegram_id = Column(String, nullable=True)
    telegram_token = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)


class TrackCollection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)
    cover_url = Column(String)

    tracks = relationship("Track", secondary=track_collection_association, back_populates="collections")


class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    audio_url = Column(String)

    collections = relationship("TrackCollection", secondary=track_collection_association, back_populates="tracks")
