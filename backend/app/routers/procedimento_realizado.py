from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.atendimento import Atendimento
from app.models.catalogo_procedimentos import CatalogoProcedimento
from app.models.procedimento_realizado import ProcedimentoRealizado
from app.schemas.procedimento import (
    ProcedimentoRealizadoOut,
    ProcedimentoRealizadoDeleteOut,
    ProcedimentoRealizadoCreate,
    ProcedimentoRealizadoCreateOut,
)

router = APIRouter(prefix="/atendimentos", tags=["Procedimentos"])


# rota para listar os procedimentos realizados em um atendimento específico
@router.get(
    "/{id_atendimento}/procedimentos",
    response_model=list[ProcedimentoRealizadoOut],
)
def listar_procedimentos_do_atendimento(id_atendimento: int, db: Session = Depends(get_db)):
    try:
        return (
            db.query(ProcedimentoRealizado)
            .filter(ProcedimentoRealizado.id_atendimento == id_atendimento)
            .all()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# rota para deletar um procedimento realizado em um atendimento específico
@router.delete(
    "/{id_atendimento}/procedimentos/{id_procedimento}",
    response_model=ProcedimentoRealizadoDeleteOut,
)
def deletar_procedimento_realizado(
    id_atendimento: int, id_procedimento: int, db: Session = Depends(get_db)
):
    try:
        procedimento_realizado = (
            db.query(ProcedimentoRealizado)
            .filter(
                ProcedimentoRealizado.id_atendimento == id_atendimento,
                ProcedimentoRealizado.id_procedimento == id_procedimento,
            )
            .first()
        )

        if procedimento_realizado is None:
            raise HTTPException(
                status_code=404,
                detail="Procedimento não encontrado ou já faturado.",
            )

        db.delete(procedimento_realizado)
        db.commit()

        return ProcedimentoRealizadoDeleteOut(
            id_atendimento=id_atendimento,
            id_procedimento=id_procedimento,
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# Rota para inserir um procedimento em um atendimento existente
@router.post(
    "/{id_atendimento}/procedimentos",
    response_model=ProcedimentoRealizadoCreateOut,
    status_code=201,
)
def inserir_procedimento_em_atendimento(
    id_atendimento: int, dados: ProcedimentoRealizadoCreate, db: Session = Depends(get_db)
):
    try:
        # 1 -> verifica se o atendimento existe e pega a duração dele
        atendimento = (
            db.query(Atendimento)
            .filter(Atendimento.id_atendimento == id_atendimento)
            .first()
        )
        if not atendimento:
            raise HTTPException(
                status_code=404,
                detail="Atendimento não encontrado.",
            )

        duracao_atendimento = atendimento.duracao_minutos

        # 2 -> verifica se o procedimento existe
        procedimento_existe = (
            db.query(CatalogoProcedimento)
            .filter(CatalogoProcedimento.id_procedimento == dados.id_procedimento)
            .first()
        )
        if not procedimento_existe:
            raise HTTPException(
                status_code=404,
                detail="Procedimento não encontrado.",
            )

        # 3 -> validação da nossa regra de negócio
        # o tempo total dos procedimentos realizados não pode exceder a duração do atendimento
        soma_atual = (
            db.query(func.coalesce(func.sum(ProcedimentoRealizado.tempo_real_minutos), 0))
            .filter(ProcedimentoRealizado.id_atendimento == id_atendimento)
            .scalar()
        )

        novo_tempo_total = soma_atual + dados.tempo_real_minutos
        if novo_tempo_total > duracao_atendimento:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"A soma do tempo dos procedimentos ({novo_tempo_total} min) "
                    f"não pode exceder a duração total do atendimento ({duracao_atendimento} min)."
                ),
            )

        # 4 -> ao fim, insere o procedimento
        novo_procedimento_realizado = ProcedimentoRealizado(
            id_atendimento=id_atendimento,
            id_procedimento=dados.id_procedimento,
            quantidade=dados.quantidade,
            tempo_real_minutos=dados.tempo_real_minutos,
            observacao=dados.observacao,
        )
        db.add(novo_procedimento_realizado)
        db.commit()
        db.refresh(novo_procedimento_realizado)

        return ProcedimentoRealizadoCreateOut(
            id_atendimento=novo_procedimento_realizado.id_atendimento,
            id_procedimento=novo_procedimento_realizado.id_procedimento,
            quantidade=novo_procedimento_realizado.quantidade,
            tempo_real_minutos=novo_procedimento_realizado.tempo_real_minutos,
            observacao=novo_procedimento_realizado.observacao,
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))