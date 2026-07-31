from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter()


@router.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1")).scalar_one()
        return {"status": "ok", "db": "up"}
    except Exception as exc:
        return {"status": "error", "db": "down", "detail": str(exc)}
