from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import (
    t_vw_estatisticas_atendimentos_mensal,
    t_vw_pacientes_internados,
    t_vw_residentes_sem_supervisor,
)
from app.schemas.views import (
    EstatisticaAtendimentoMensalOut,
    PacienteInternadoOut,
    ResidenteSemSupervisorOut,
)


router = APIRouter(prefix="/views", tags=["Views"])


def executar_view(db: Session, statement):
    return db.execute(statement).mappings().all()


@router.get(
    "/estatisticas-atendimentos-mensais",
    response_model=list[EstatisticaAtendimentoMensalOut],
)
def listar_estatisticas_atendimentos_mensais(db: Session = Depends(get_db)):
    try:
        view = t_vw_estatisticas_atendimentos_mensal
        return executar_view(
            db,
            select(view).order_by(view.c.mes.desc(), view.c.unidade),
        )
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=500,
            detail="Não foi possível consultar as estatísticas mensais.",
        ) from exc


@router.get(
    "/pacientes-internados",
    response_model=list[PacienteInternadoOut],
)
def listar_pacientes_internados(db: Session = Depends(get_db)):
    try:
        view = t_vw_pacientes_internados
        return executar_view(
            db,
            select(view).order_by(view.c.data_hora_entrada.desc()),
        )
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=500,
            detail="Não foi possível consultar os pacientes internados.",
        ) from exc


@router.get(
    "/residentes-sem-supervisor",
    response_model=list[ResidenteSemSupervisorOut],
)
def listar_residentes_sem_supervisor(db: Session = Depends(get_db)):
    try:
        view = t_vw_residentes_sem_supervisor
        return executar_view(
            db,
            select(view).order_by(view.c.residente_nome, view.c.preceptor_nome),
        )
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=500,
            detail="Não foi possível consultar as pendências de supervisão.",
        ) from exc
