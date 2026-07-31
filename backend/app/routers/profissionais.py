from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import insert, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Pessoa, Preceptor, Profissional, Residente
from app.schemas.profissional import (
    PreceptorCreate,
    PreceptorCreateOut,
    ProfissionalOut,
    ResidenteCreate,
    ResidenteCreateOut,
)
from app.sql_loader import load_query

router = APIRouter(tags=["Profissionais"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"


def inserir_pessoa(db: Session, dados: ResidenteCreate | PreceptorCreate) -> int:
    return db.execute(
        insert(Pessoa.__table__)
        .values(
            nome=dados.nome,
            cpf=dados.cpf,
            data_nascimento=dados.data_nascimento,
            is_flamengo=dados.is_flamengo,
            telefone=dados.telefone,
        )
        .returning(Pessoa.id_pessoa)
    ).scalar_one()


def inserir_profissional(
    db: Session, id_pessoa: int, dados: ResidenteCreate | PreceptorCreate
) -> None:
    db.execute(
        insert(Profissional.__table__).values(
            id_pessoa=id_pessoa,
            crm=dados.crm,
            data_admissao=dados.data_admissao,
            especialidade=dados.especialidade,
        )
    )


@router.post("/residentes", response_model=ResidenteCreateOut, status_code=201)
def criar_residente(
    residente: ResidenteCreate, db: Session = Depends(get_db)
):
    try:
        id_pessoa = inserir_pessoa(db, residente)
        inserir_profissional(db, id_pessoa, residente)
        db.execute(
            insert(Residente.__table__).values(
                id_profissional=id_pessoa,
                ano_residencia=residente.ano_residencia,
            )
        )
        db.commit()
        return ResidenteCreateOut(id_pessoa=id_pessoa)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/preceptores", response_model=PreceptorCreateOut, status_code=201)
def criar_preceptor(
    preceptor: PreceptorCreate, db: Session = Depends(get_db)
):
    try:
        id_pessoa = inserir_pessoa(db, preceptor)
        inserir_profissional(db, id_pessoa, preceptor)
        db.execute(
            insert(Preceptor.__table__).values(
                id_profissional=id_pessoa,
                titulacao=preceptor.titulacao,
            )
        )
        db.commit()
        return PreceptorCreateOut(id_pessoa=id_pessoa)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/profissionais", response_model=list[ProfissionalOut])
def listar_profissionais(db: Session = Depends(get_db)):
    try:
        sql = load_query(ARQUIVO_SQL, "listar_profissionais")
        return db.execute(text(sql)).mappings().all()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
