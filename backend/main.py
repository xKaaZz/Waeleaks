from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import os
import shutil
import datetime
import jwt as pyjwt
from passlib.context import CryptContext

from database import get_db, engine
import models
import schemas

# --- INIT APP ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.1.194:5174", "http://localhost:5174"],  # ajuste si besoin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=os.path.join(BASE_DIR, "uploads")), name="uploads")

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
        with open(f"backend/{cover_path}", "wb") as buffer:
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
    with open(f"backend/{audio_path}", "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    new_track = models.Track(
        title=title,
        audio_url=audio_path,
        collection_id=collection_id
    )
    db.add(new_track)
    db.commit()
    db.refresh(new_track)

    # 🔔 Notification Telegram (si activée)
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
