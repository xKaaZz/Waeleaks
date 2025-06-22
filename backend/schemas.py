from typing import List, Optional
from pydantic import BaseModel

class TrackBase(BaseModel):
    title: str
    audio_url: str

class TrackCreate(TrackBase):
    pass

class TrackUpdate(BaseModel):
    collection_ids: List[int]  # on envoie la liste de toutes les collections

class Track(TrackBase):
    id: int
    collection_ids: List[int] = []

    class Config:
        orm_mode = True

class CollectionBase(BaseModel):
    title: str
    description: Optional[str] = None
    cover_url: Optional[str] = None

class CollectionCreate(CollectionBase):
    pass

class Collection(CollectionBase):
    id: int
    track_ids: List[int] = []

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    password: str
    telegram_id: Optional[str] = None
    telegram_token: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    token: str
