from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import logging
from pydantic import BaseModel
from database import get_db, engine
import models
import schemas
from scraper_mangamoins import MangaMoinsScraper
from scraper_madara import MadaraScraper
from manga_sources import MANGA_SOURCES
from rss_monitor import check_new_chapters
import requests
import datetime
from passlib.context import CryptContext
import jwt as pyjwt

# Init app
models.Base.metadata.create_all(bind=engine)
app = FastAPI()

class TelegramUpdate(BaseModel):
    telegram_id: str
    telegram_token: str
# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://192.168.1.194:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("main")

# Auth
SECRET_KEY = "secret"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_token(user_id: int):
    return pyjwt.encode(
        {
            "sub": str(user_id),  # <-- ici le fix
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        },
        SECRET_KEY,
        algorithm="HS256"
    )



def decode_token(token: str):
    try:
        decoded = pyjwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded.get("sub")
    except Exception as e:
        print("🔒 Erreur de décodage JWT :", e)
        return None

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    print("🛡️ Reçu dans header:", authorization)
    if not authorization:
        raise HTTPException(status_code=401, detail="Token manquant")

    token = authorization.replace("Bearer ", "")
    user_id = decode_token(token)

    print("🧠 ID décodé:", user_id)

    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")

    return db.query(models.User).filter(models.User.id == user_id).first()


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

# --- SUIVI MANGA ---
@app.get("/api/mangas/", response_model=List[schemas.Manga])
def read_mangas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Manga).offset(skip).limit(limit).all()

@app.get("/api/mangas/{manga_id}", response_model=schemas.Manga)
def read_manga(manga_id: int, db: Session = Depends(get_db)):
    manga = db.query(models.Manga).filter(models.Manga.id == manga_id).first()
    if not manga:
        raise HTTPException(status_code=404, detail="Manga not found")
    return manga

@app.get("/api/mangas/{manga_id}/chapters", response_model=List[schemas.Chapter])
def read_manga_chapters(manga_id: int, db: Session = Depends(get_db)):
    return db.query(models.Chapter).filter(models.Chapter.manga_id == manga_id).all()

@app.get("/api/chapters/{chapter_id}", response_model=schemas.Chapter)
def read_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    next_chapter = db.query(models.Chapter).filter(models.Chapter.manga_id == chapter.manga_id, models.Chapter.number > chapter.number).order_by(models.Chapter.number.asc()).first()
    previous_chapter = db.query(models.Chapter).filter(models.Chapter.manga_id == chapter.manga_id, models.Chapter.number < chapter.number).order_by(models.Chapter.number.desc()).first()

    chapter_dict = chapter.__dict__.copy()
    chapter_dict["next_chapter_id"] = next_chapter.id if next_chapter else None
    chapter_dict["previous_chapter_id"] = previous_chapter.id if previous_chapter else None
    return chapter_dict

# --- LECTURE UTILISATEUR ---
@app.get("/api/mangas/{manga_id}/read_chapters", response_model=List[int])
def get_user_read_chapters(manga_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    reads = db.query(models.ChapterRead).join(models.Chapter).filter(models.Chapter.manga_id == manga_id, models.ChapterRead.user_id == user.id).all()
    return [r.chapter_id for r in reads]

@app.post("/api/chapters/{chapter_id}/mark_read")
def mark_chapter_as_read(chapter_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    exists = db.query(models.ChapterRead).filter_by(user_id=user.id, chapter_id=chapter_id).first()
    if not exists:
        db.add(models.ChapterRead(user_id=user.id, chapter_id=chapter_id))
        db.commit()
    return {"message": "Chapitre marqué comme lu"}

@app.delete("/api/chapters/{chapter_id}/mark_read")
def unmark_chapter_as_read(chapter_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    read = db.query(models.ChapterRead).filter_by(user_id=user.id, chapter_id=chapter_id).first()
    if read:
        db.delete(read)
        db.commit()
    return {"message": "Lecture annulée"}

@app.post("/api/mangas/{manga_id}/mark_all_read")
def mark_all_chapters_as_read(manga_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    chapters = db.query(models.Chapter).filter_by(manga_id=manga_id).all()
    for chapter in chapters:
        already = db.query(models.ChapterRead).filter_by(chapter_id=chapter.id, user_id=user.id).first()
        if not already:
            db.add(models.ChapterRead(user_id=user.id, chapter_id=chapter.id))
    db.commit()
    return {"message": "Tous les chapitres ont été marqués comme lus"}

@app.delete("/api/mangas/{manga_id}/mark_all_read")
def unmark_all_chapters_as_read(manga_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    reads = db.query(models.ChapterRead).join(models.Chapter).filter(models.Chapter.manga_id == manga_id, models.ChapterRead.user_id == user.id).all()
    for read in reads:
        db.delete(read)
    db.commit()
    return {"message": "Tous les chapitres ont été marqués comme non lus"}

# --- SCRAPING & FLUX ---
@app.post("/api/mangas/")
def create_manga(manga: schemas.MangaCreate, db: Session = Depends(get_db)):
    if db.query(models.Manga).filter_by(title=manga.title).first():
        raise HTTPException(status_code=400, detail="Manga already exists")

    scraper, title = get_scraper_for_title(manga.title)
    manga_info = scraper.scrape(title)

    db_manga = models.Manga(
        title=manga_info["title"],
        description=manga_info.get("description", "Description non disponible"),
        cover_url=manga_info.get("cover_url", "https://via.placeholder.com/300x400?text=No+Image")
    )
    db.add(db_manga)
    db.commit()
    db.refresh(db_manga)

    for chapter_data in manga_info["chapters"]:
        db.add(models.Chapter(
            manga_id=db_manga.id,
            number=chapter_data["number"],
            pages=chapter_data["pages"]
        ))
    db.commit()
    return db_manga

@app.post("/api/rss/check-new-chapters")
def check_new_chapters_api():
    try:
        result = check_new_chapters()
        return {"status": "success", "new_chapters": result}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.post("/api/mangas/{manga_id}/clear-new")
def clear_new_flag(manga_id: int, db: Session = Depends(get_db)):
    manga = db.query(models.Manga).filter(models.Manga.id == manga_id).first()
    if not manga:
        raise HTTPException(status_code=404, detail="Manga non trouvé")
    manga.has_new_chapter = False
    db.commit()
    return {"status": "ok"}

# --- SCRAPER SELECTION ---
def get_scraper_for_title(title: str):
    title_lc = title.lower()
    if title_lc in MANGA_SOURCES:
        return MANGA_SOURCES[title_lc]["scraper"], MANGA_SOURCES[title_lc]["title"]
    raise Exception("Aucun scraper disponible pour ce titre")

@app.post("/api/mangas/refresh/{title}")
def refresh_manga(title: str, db: Session = Depends(get_db)):
    existing_manga = db.query(models.Manga).filter(models.Manga.title == title).first()
    if not existing_manga:
        raise HTTPException(status_code=404, detail="Manga non trouvé")

    # Supprime les lectures utilisateur liées
    db.query(models.ChapterRead).filter(
        models.ChapterRead.chapter_id.in_(
            db.query(models.Chapter.id).filter(models.Chapter.manga_id == existing_manga.id)
        )
    ).delete(synchronize_session=False)

    # Supprime les anciens chapitres
    db.query(models.Chapter).filter(models.Chapter.manga_id == existing_manga.id).delete()

    # Scraping
    scraper, resolved_title = get_scraper_for_title(title)
    chapter_links = scraper.get_chapter_links()
    chapters_data = []

    for chap in chapter_links:
        pages = scraper.scrape_chapter_images(chap, resolved_title)
        if pages:
            chapters_data.append({
                "number": chap["number"],
                "pages": pages
            })

    if not chapters_data:
        raise HTTPException(status_code=500, detail="Aucun chapitre récupéré dynamiquement")

    for chapter_data in chapters_data:
        db.add(models.Chapter(
            manga_id=existing_manga.id,
            number=chapter_data["number"],
            pages=chapter_data["pages"]
        ))

    db.commit()
    return {"message": f"{len(chapters_data)} chapitres rescrapés pour {title}"}

@app.get("/api/user/me")
def get_user_me(user: models.User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "telegram_id": user.telegram_id,
        "telegram_token": user.telegram_token,
    }

@app.patch("/api/user/me")
def update_telegram_credentials(data: TelegramUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.telegram_id = data.telegram_id
    user.telegram_token = data.telegram_token
    db.commit()
    return {"message": "Infos Telegram mises à jour"}

@app.post("/api/one-piece/rescrape")
def rescrape_one_piece_offset(db: Session = Depends(get_db)):
    scraper = MadaraScraper("https://onepiecescan.fr/")
    title = "One Piece"
    manga = db.query(models.Manga).filter_by(title=title).first()
    if not manga:
        raise HTTPException(status_code=404, detail="Manga non trouvé")

    chapters = scraper.scrape_range_with_offset(1046, 1146, title, offset=1)

    for chap in chapters:
        db.add(models.Chapter(
            manga_id=manga.id,
            number=chap["number"],
            pages=chap["pages"]
        ))
    db.commit()

    return {"message": f"{len(chapters)} chapitres réinsérés pour One Piece avec offset"}

@app.post("/api/kingdom/check-animesama")
def check_kingdom_on_animesama(db: Session = Depends(get_db)):
    title = "Kingdom"
    manga = db.query(models.Manga).filter(models.Manga.title == title).first()
    if not manga:
        raise HTTPException(status_code=404, detail="Manga non trouvé")

    latest_chapter = (
        db.query(models.Chapter)
        .filter(models.Chapter.manga_id == manga.id)
        .order_by(models.Chapter.number.desc())
        .first()
    )
    last_number = latest_chapter.number if latest_chapter else 0

    scraper = MadaraScraper("https://kingdomscan.com")
    new_chapters = []

    for num in range(last_number + 1, last_number + 6):
        result = scraper.scrape_chapter_with_offset(num, title, offset=0)
        if result["pages"]:
            db.add(models.Chapter(
                manga_id=manga.id,
                number=num,
                pages=result["pages"]
            ))
            manga.has_new_chapter = True
            new_chapters.append(num)
        else:
            break

    db.commit()

    # ✉️ Notification Telegram (repris de rss_monitor)
    if new_chapters:
        message = f"\U0001F4E2 Nouveau chapitre de {title} ! Chapitre {new_chapters[-1]} disponible \U0001F680"
        users = db.query(models.User).filter(
            models.User.telegram_id != None,
            models.User.telegram_token != None
        ).all()
        for user in users:
            try:
                requests.post(
                    f"https://api.telegram.org/bot{user.telegram_token}/sendMessage",
                    data={"chat_id": user.telegram_id, "text": message}
                )
            except Exception as e:
                logger.warning(f"Erreur lors de l'envoi Telegram à {user.username}: {e}")

    return {"message": f"Chapitres ajoutés: {new_chapters}" if new_chapters else "Aucun nouveau chapitre"}


