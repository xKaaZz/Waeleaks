# schemas.py

from typing import List, Optional
from pydantic import BaseModel

class TrackBase(BaseModel):
    title: str
    audio_url: str

class TrackCreate(TrackBase):
    pass

class Track(TrackBase):
    id: int
    collection_id: int

    class Config:
        from_attributes = True


class CollectionBase(BaseModel):
    title: str
    description: Optional[str] = None
    cover_url: Optional[str] = None

class CollectionCreate(CollectionBase):
    pass

class Collection(CollectionBase):
    id: int
    tracks: List[Track] = []

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    telegram_id: str | None = None
    telegram_token: str | None = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    token: str