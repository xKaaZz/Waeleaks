from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import os
import shutil
import datetime
import jwt as pyjwt
from passlib.context import CryptContext
from starlette.requests import Request
import requests

from database import get_db, engine
import models
import schemas

# --- INIT APP ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
models.Base.metadata.create_all(bind=engine)
app = FastAPI(redirect_slashes=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.194:5175", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory=os.path.join(BASE_DIR, "uploads"), html=True),
    name="uploads"
)

# --- AUTH ---
SECRET_KEY = "secret"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_token(user_id: int):
    return pyjwt.encode({
        "sub": str(user_id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    try:
        decoded = pyjwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded.get("sub")
    except:
        return None

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")
    token = authorization.replace("Bearer ", "")
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")
    return db.query(models.User).filter(models.User.id == int(user_id)).first()

# --- USER ---
@app.post("/api/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=user.username).first():
        raise HTTPException(status_code=400, detail="Nom d'utilisateur déjà utilisé")
    new_user = models.User(
        username=user.username,
        hashed_password=pwd_context.hash(user.password),
        telegram_id=user.telegram_id,
        telegram_token=user.telegram_token
    )
    db.add(new_user)
    db.commit()
    return {"message": "Inscription réussie"}

@app.post("/api/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter_by(username=user.username).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    return {"token": create_token(db_user.id)}

@app.get("/api/user/me")
def get_user_me(user: models.User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "telegram_id": user.telegram_id,
        "telegram_token": user.telegram_token,
        "is_admin": user.is_admin,
    }

# --- COLLECTIONS ---
@app.get("/api/collections/", response_model=List[schemas.Collection])
def list_collections(db: Session = Depends(get_db)):
    return db.query(models.TrackCollection).all()

@app.get("/api/collections/{collection_id}", response_model=schemas.Collection)
def get_collection(collection_id: int, db: Session = Depends(get_db)):
    collection = db.query(models.TrackCollection).filter_by(id=collection_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection introuvable")
    return collection

@app.post("/api/collections/", response_model=schemas.Collection)
def create_collection(
    title: str = Form(...),
    description: str = Form(""),
    cover: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    cover_path = None
    if cover:
        os.makedirs("backend/uploads/covers", exist_ok=True)
        cover_path = f"uploads/covers/{cover.filename}"
        with open(f"{cover_path}", "wb") as buffer:
            shutil.copyfileobj(cover.file, buffer)

    new_collection = models.TrackCollection(
        title=title,
        description=description,
        cover_url=cover_path
    )
    db.add(new_collection)
    db.commit()
    db.refresh(new_collection)
    return new_collection

# --- TRACKS ---
@app.post("/api/collections/{collection_id}/tracks", response_model=schemas.Track)
def add_track_to_collection(
    collection_id: int,
    title: str = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    os.makedirs("backend/uploads/audio", exist_ok=True)
    audio_path = f"uploads/audio/{audio.filename}"
    with open(f"{audio_path}", "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    new_track = models.Track(
        title=title,
        audio_url=audio_path,
        collection_id=collection_id
    )
    db.add(new_track)
    db.commit()
    db.refresh(new_track)

    collection = db.query(models.TrackCollection).filter_by(id=collection_id).first()
    users = db.query(models.User).filter(
        models.User.telegram_id != None,
        models.User.telegram_token != None
    ).all()

    for user in users:
        try:
            message = f"🎵 Nouveau son ajouté dans {collection.title} : {title}"
            requests.post(
                f"https://api.telegram.org/bot{user.telegram_token}/sendMessage",
                data={"chat_id": user.telegram_id, "text": message}
            )
        except:
            pass

    return new_track

@app.post("/api/tracks", response_model=schemas.Track)
def add_standalone_track(
    title: str = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    os.makedirs("backend/uploads/audio", exist_ok=True)
    audio_path = f"uploads/audio/{audio.filename}"
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    new_track = models.Track(
        title=title,
        audio_url=audio_path,
        collection_id=None
    )
    db.add(new_track)
    db.commit()
    db.refresh(new_track)

    users = db.query(models.User).filter(
        models.User.telegram_id != None,
        models.User.telegram_token != None
    ).all()

    for user in users:
        try:
            message = f"🎶 Nouveau son ajouté : {title}"
            requests.post(
                f"https://api.telegram.org/bot{user.telegram_token}/sendMessage",
                data={"chat_id": user.telegram_id, "text": message}
            )
        except:
            pass

    return new_track

@app.get("/uploads/audio/{filename}")
def serve_audio(filename: str, request: Request):
    path = os.path.join(BASE_DIR, "uploads", "audio", filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Fichier introuvable")

    file_size = os.path.getsize(path)
    range_header = request.headers.get('range')

    def iterfile(start=0):
        with open(path, 'rb') as f:
            f.seek(start)
            while chunk := f.read(4096):
                yield chunk

    if range_header:
        range_value = range_header.strip().lower().replace("bytes=", "")
        range_start, range_end = range_value.split("-")
        range_start = int(range_start)
        range_end = int(range_end) if range_end else file_size - 1
        content_length = (range_end - range_start) + 1

        return StreamingResponse(
            iterfile(start=range_start),
            status_code=206,
            headers={
                "Content-Range": f"bytes {range_start}-{range_end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
                "Content-Type": "audio/mpeg",
            }
        )

    return StreamingResponse(
        iterfile(),
        headers={
            "Content-Length": str(file_size),
            "Content-Type": "audio/mpeg",
            "Accept-Ranges": "bytes",
        }
    )

@app.get("/api/tracks/", response_model=List[schemas.Track])
def list_tracks(db: Session = Depends(get_db)):
    return db.query(models.Track).all()

@app.delete("/api/collections/{collection_id}", status_code=204)
def delete_collection(collection_id: int, db: Session = Depends(get_db)):
    collection = db.query(models.TrackCollection).filter_by(id=collection_id).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection introuvable")

    if db.query(models.Track).filter_by(collection_id=collection_id).count() > 0:
        raise HTTPException(status_code=400, detail="Impossible de supprimer une collection non vide")

    db.delete(collection)
    db.commit()
    return

@app.delete("/api/tracks/{track_id}", status_code=204)
def delete_track(track_id: int, db: Session = Depends(get_db)):
    track = db.query(models.Track).filter_by(id=track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Son introuvable")
    db.delete(track)
    db.commit()
    return
