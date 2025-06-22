from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
import os, shutil, datetime, jwt as pyjwt, requests
from passlib.context import CryptContext

from database import get_db, engine
import models, schemas

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Création des tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(redirect_slashes=True)

# 1) CORS MIDDLEWARE — à déclarer avant tout endpoint ou app.mount
app.add_middleware(
    CORSMiddleware,
    allow_origins=[  # ou ["*"] si tu veux ouvrir à tous les front
        "http://192.168.1.194:5175",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],       # GET, POST, PUT, DELETE, OPTIONS…
    allow_headers=["*"],       # tous les headers autorisés
    expose_headers=[           # si besoin d’exposer des headers spéciaux
        "Content-Range",
        "Accept-Ranges",
        "Content-Length"
    ],
)

# Static pour les covers
app.mount(
    "/uploads/covers",
    StaticFiles(directory=os.path.join(BASE_DIR, "uploads", "covers")),
    name="covers"
)

SECRET_KEY = "secret"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_token(user_id: int):
    return pyjwt.encode({
        "sub": str(user_id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")

def decode_token(token: str):
    try:
        data = pyjwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return data.get("sub")
    except:
        return None

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(401, "Token manquant")
    token = authorization.replace("Bearer ", "")
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(401, "Token invalide")
    return db.query(models.User).get(int(user_id))


# — AUTHENT et UTILISATEUR
@app.post("/api/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(username=user.username).first():
        raise HTTPException(400, "Nom d'utilisateur déjà utilisé")
    new_user = models.User(
        username=user.username,
        hashed_password=pwd_context.hash(user.password),
        telegram_id=user.telegram_id,
        telegram_token=user.telegram_token
    )
    db.add(new_user); db.commit()
    return {"message": "Inscription réussie"}

@app.post("/api/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter_by(username=user.username).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(401, "Identifiants invalides")
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


# — COLLECTIONS
@app.get("/api/collections/", response_model=List[schemas.Collection])
def list_collections(db: Session = Depends(get_db)):
    return db.query(models.TrackCollection).all()

@app.get("/api/collections/{collection_id}", response_model=schemas.Collection)
def get_collection(collection_id: int, db: Session = Depends(get_db)):
    col = (
      db.query(models.TrackCollection)
        .options(joinedload(models.TrackCollection.tracks))
        .filter(models.TrackCollection.id == collection_id)
        .first()
    )
    if not col:
        raise HTTPException(404, "Collection non trouvée")
    return col

@app.post("/api/collections/", response_model=schemas.Collection)
def create_collection(
    title: str = Form(...),
    description: str = Form(""),
    cover: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    cover_path = None
    if cover:
        os.makedirs(os.path.join(BASE_DIR, "uploads", "covers"), exist_ok=True)
        cover_path = f"uploads/covers/{cover.filename}"
        with open(os.path.join(BASE_DIR, cover_path), "wb") as buf:
            shutil.copyfileobj(cover.file, buf)
    new = models.TrackCollection(title=title, description=description, cover_url=cover_path)
    db.add(new); db.commit(); db.refresh(new)
    return new

# Ajout direct de piste à une collection (upload)
@app.post("/api/collections/{collection_id}/tracks", response_model=schemas.Track)
def add_track_to_collection(
    collection_id: int,
    title: str = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    os.makedirs(os.path.join(BASE_DIR, "uploads", "audio"), exist_ok=True)
    ap = f"uploads/audio/{audio.filename}"
    with open(os.path.join(BASE_DIR, ap), "wb") as buf:
        shutil.copyfileobj(audio.file, buf)

    tr = models.Track(title=title, audio_url=ap)
    # on lie la piste à la collection via la relation M2M
    col = db.query(models.TrackCollection).get(collection_id)
    if not col:
        raise HTTPException(404, "Collection introuvable")
    tr.collections.append(col)

    db.add(tr); db.commit(); db.refresh(tr)
    return tr

# Ajout d’un son « libre »
@app.post("/api/tracks", response_model=schemas.Track)
def add_standalone_track(
    title: str = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    os.makedirs(os.path.join(BASE_DIR, "uploads", "audio"), exist_ok=True)
    ap = f"uploads/audio/{audio.filename}"
    with open(os.path.join(BASE_DIR, ap), "wb") as buf:
        shutil.copyfileobj(audio.file, buf)

    tr = models.Track(title=title, audio_url=ap)
    db.add(tr); db.commit(); db.refresh(tr)
    return tr

# Lecture des pistes M2M d’une collection (optionnel, front peut utiliser GET /collections/{id})
@app.get("/api/collections/{collection_id}/tracks", response_model=List[schemas.Track])
def read_collection_tracks(collection_id: int, db: Session = Depends(get_db)):
    col = db.query(models.TrackCollection).get(collection_id)
    if not col:
        raise HTTPException(404, "Collection introuvable")
    return col.tracks


# — PISTES
@app.get("/api/tracks/", response_model=List[schemas.Track])
def list_tracks(db: Session = Depends(get_db)):
    return db.query(models.Track).all()

@app.put("/api/tracks/{track_id}", response_model=schemas.Track)
def update_track(
    track_id: int,
    payload: schemas.TrackUpdate,
    db: Session = Depends(get_db)
):
    tr = db.query(models.Track).get(track_id)
    if not tr:
        raise HTTPException(404, "Track non trouvée")
    # Réassignation des collections
    tr.collections = db.query(models.TrackCollection)\
                       .filter(models.TrackCollection.id.in_(payload.collection_ids))\
                       .all()
    db.commit(); db.refresh(tr)
    return tr

# — SUPPRESSION
@app.delete("/api/collections/{collection_id}", status_code=204)
def delete_collection(collection_id: int, db: Session = Depends(get_db)):
    col = db.query(models.TrackCollection).get(collection_id)
    if not col:
        raise HTTPException(404, "Collection introuvable")
    db.delete(col)
    db.commit()

@app.delete("/api/tracks/{track_id}", status_code=204)
def delete_track(track_id: int, db: Session = Depends(get_db)):
    tr = db.query(models.Track).get(track_id)
    if not tr:
        raise HTTPException(404, "Track introuvable")
    db.delete(tr)
    db.commit()


# — AUDIO STREAMING
@app.get("/api/audio/{filename}")
def serve_audio(filename: str, request: Request):
    path = os.path.join(BASE_DIR, "uploads", "audio", filename)
    if not os.path.isfile(path):
        raise HTTPException(404, "Fichier introuvable")
    file_size = os.path.getsize(path)
    range_header = request.headers.get("range")
    def iterfile(start=0):
        with open(path, "rb") as f:
            f.seek(start)
            while chunk := f.read(4096):
                yield chunk

    if range_header:
        start, end = range_header.replace("bytes=", "").split("-")
        start = int(start)
        end   = int(end) if end else file_size - 1
        length = end - start + 1
        return StreamingResponse(
            iterfile(start),
            status_code=206,
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(length),
                "Content-Type": "audio/mpeg",
            }
        )

    return StreamingResponse(
        iterfile(),
        headers={
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes",
            "Content-Type": "audio/mpeg",
        }
    )

# — TELEGRAM SETTINGS
@app.put("/api/user/telegram")
def update_telegram(
    telegram_id: str = Form(...),
    telegram_token: str = Form(...),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user.telegram_id = telegram_id
    user.telegram_token = telegram_token
    db.commit()
    return {"message": "Infos Telegram mises à jour"}

# — AJOUTER / LIER une piste existante à une collection
@app.post("/api/collections/{collection_id}/add-track/{track_id}")
def link_track_to_collection(collection_id: int, track_id: int, db: Session = Depends(get_db)):
    col = db.query(models.TrackCollection).get(collection_id)
    tr  = db.query(models.Track).get(track_id)
    if not col or not tr:
        raise HTTPException(404, "Track ou collection introuvable")
    if tr not in col.tracks:
        col.tracks.append(tr)
        db.commit()
    return {"message": "Track ajouté à la collection"}
