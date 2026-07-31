from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.catalogo_procedimentos import CatalogoProcedimento
from app.schemas.procedimento import ProcedimentoOut

router = APIRouter(prefix="/procedimentos", tags=["Catálogo de Procedimentos"])


# Rota para listar todos os procedimentos disponíveis no catálogo
@router.get("", response_model=list[ProcedimentoOut])
def listar_todos_procedimentos(db: Session = Depends(get_db)):
    try:
        return db.query(CatalogoProcedimento).order_by(CatalogoProcedimento.nome).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))