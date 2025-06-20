# models.py

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class TrackCollection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    description = Column(String)
    cover_url = Column(String)

    tracks = relationship("Track", back_populates="collection", cascade="all, delete-orphan")


class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    audio_url = Column(String)
    collection_id = Column(Integer, ForeignKey("collections.id"))

    collection = relationship("TrackCollection", back_populates="tracks")
