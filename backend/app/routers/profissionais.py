from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Pessoa, Profissional, Residente, Preceptor
from app.schemas.profissional import (
    ResidenteCreate,
    ResidenteCreateOut,
    PreceptorCreate,
    PreceptorCreateOut,
    ProfissionalOut
)

router = APIRouter(tags=["Profissionais"])

@router.post("/residentes", response_model=ResidenteCreateOut, status_code=201)
def criar_residente(residente: ResidenteCreate, db: Session = Depends(get_db)):
    try:
        nova_pessoa = Pessoa(
            nome=residente.nome,
            cpf=residente.cpf,
            data_nascimento=residente.data_nascimento,
            is_flamengo=residente.is_flamengo,
            telefone=residente.telefone
        )
        db.add(nova_pessoa)
        db.flush()
        
        novo_profissional = Profissional(
            id_pessoa=nova_pessoa.id_pessoa,
            crm=residente.crm,
            data_admissao=residente.data_admissao,
            especialidade=residente.especialidade
        )
        db.add(novo_profissional)
        db.flush()
        
        novo_residente = Residente(
            id_profissional=novo_profissional.id_pessoa,
            ano_residencia=residente.ano_residencia
        )
        db.add(novo_residente)
        
        db.commit()
        return ResidenteCreateOut(id_pessoa=nova_pessoa.id_pessoa)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preceptores", response_model=PreceptorCreateOut, status_code=201)
def criar_preceptor(preceptor: PreceptorCreate, db: Session = Depends(get_db)):
    try:
        nova_pessoa = Pessoa(
            nome=preceptor.nome,
            cpf=preceptor.cpf,
            data_nascimento=preceptor.data_nascimento,
            is_flamengo=preceptor.is_flamengo,
            telefone=preceptor.telefone
        )
        db.add(nova_pessoa)
        db.flush()
        
        novo_profissional = Profissional(
            id_pessoa=nova_pessoa.id_pessoa,
            crm=preceptor.crm,
            data_admissao=preceptor.data_admissao,
            especialidade=preceptor.especialidade
        )
        db.add(novo_profissional)
        db.flush()
        
        novo_preceptor = Preceptor(
            id_profissional=novo_profissional.id_pessoa,
            titulacao=preceptor.titulacao
        )
        db.add(novo_preceptor)
        
        db.commit()
        return PreceptorCreateOut(id_pessoa=nova_pessoa.id_pessoa)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profissionais", response_model=list[ProfissionalOut])
def listar_profissionais(db: Session = Depends(get_db)):
    try:
        resultados = (
            db.query(
                Pessoa.id_pessoa,
                Pessoa.nome,
                Profissional.crm,
                Profissional.especialidade,
                Residente.id_profissional.label("is_residente"),
                Preceptor.id_profissional.label("is_preceptor"),
                Residente.ano_residencia,
                Preceptor.titulacao
            )
            .join(Profissional, Profissional.id_pessoa == Pessoa.id_pessoa)
            .outerjoin(Residente, Residente.id_profissional == Profissional.id_pessoa)
            .outerjoin(Preceptor, Preceptor.id_profissional == Profissional.id_pessoa)
            .order_by(Pessoa.nome.asc())
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
