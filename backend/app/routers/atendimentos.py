from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.atendimento import Atendimento
from app.schemas.atendimento import AtendimentoCreate, AtendimentoCreateOut, AtendimentoOut

router = APIRouter(prefix="/atendimentos", tags=["Atendimentos"])


# Rota para criar um novo atendimento
@router.post("", response_model=AtendimentoCreateOut)
def criar_atendimento(dados: AtendimentoCreate, db: Session = Depends(get_db)):
    try:
        novo_atendimento = Atendimento(
            data_hora=dados.data_hora,
            duracao_minutos=dados.duracao_minutos,
            id_paciente=dados.id_paciente,
            id_residente=dados.id_residente,
            id_preceptor=dados.id_preceptor,
        )
        db.add(novo_atendimento)
        db.commit()
        db.refresh(novo_atendimento)

        return AtendimentoCreateOut(id_atendimento=novo_atendimento.id_atendimento)

    # SQLAlchemy encapsula qualquer erro de integridade do banco
    # (violação de FK, unique, not null) em IntegrityError
    # Aqui assumimos que neste contexto o erro mais provável é uma violação de chave estrangeira
    # inexistente
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=404,
            detail="Paciente, residente ou preceptor informado não existe.",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Rota para listar o histórico geral de todos os atendimentos
@router.get("", response_model=list[AtendimentoOut])
def listar_historico_atendimentos(db: Session = Depends(get_db)):
    try:
        return db.query(Atendimento).order_by(Atendimento.data_hora.desc()).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))