from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import insert
from app.database import get_db
from app.models.models import Pessoa, Profissional, Residente, Preceptor
from app.schemas.profissional import (
    PreceptorCreate,
    PreceptorCreateOut,
    ProfissionalOut,
    ResidenteCreate,
    ResidenteCreateOut,
)

router = APIRouter(tags=["Profissionais"])


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
def criar_residente(residente: ResidenteCreate, db: Session = Depends(get_db)):
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
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preceptores", response_model=PreceptorCreateOut, status_code=201)
def criar_preceptor(preceptor: PreceptorCreate, db: Session = Depends(get_db)):
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
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profissionais", response_model=list[ProfissionalOut])
def listar_profissionais(db: Session = Depends(get_db)):
    try:
        pessoa = Pessoa.__table__
        profissional = Profissional.__table__
        residente = Residente.__table__
        preceptor = Preceptor.__table__
        resultados = (
            db.query(
                pessoa.c.id_pessoa,
                pessoa.c.nome,
                profissional.c.crm,
                profissional.c.especialidade,
                residente.c.id_profissional.label("is_residente"),
                preceptor.c.id_profissional.label("is_preceptor"),
                residente.c.ano_residencia,
                preceptor.c.titulacao
            )
            .select_from(pessoa)
            .join(profissional, profissional.c.id_pessoa == pessoa.c.id_pessoa)
            .outerjoin(residente, residente.c.id_profissional == profissional.c.id_pessoa)
            .outerjoin(preceptor, preceptor.c.id_profissional == profissional.c.id_pessoa)
            .order_by(pessoa.c.nome.asc())
            .all()
        )
        
        profissionais_formatados = []
        for row in resultados:
            if row.is_residente:
                papel = 'Residente'
            elif row.is_preceptor:
                papel = 'Preceptor'
            else:
                papel = None
                
            profissionais_formatados.append({
                "id_pessoa": row.id_pessoa,
                "nome": row.nome,
                "crm": row.crm,
                "especialidade": row.especialidade,
                "papel": papel,
                "ano_residencia": row.ano_residencia,
                "titulacao": row.titulacao
            })
            
        return profissionais_formatados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
