from typing import List, Optional
from pydantic import BaseModel

# ───── TRACK ───────────────────────────────────────────

class CollectionNested(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True  # anciennement orm_mode

class TrackBase(BaseModel):
    title: str
    audio_url: str

class TrackCreate(TrackBase):
    pass

class TrackUpdate(BaseModel):
    collection_ids: List[int]  # Permet d'assigner le son à plusieurs collections

class Track(TrackBase):
    id: int
    collections: List[CollectionNested] = []

    class Config:
        from_attributes = True

# ───── COLLECTION ──────────────────────────────────────

class TrackNested(BaseModel):
    id: int
    title: str

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
    tracks: List[TrackNested] = []

    class Config:
        from_attributes = True

# ───── AUTH ─────────────────────────────────────────────

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
