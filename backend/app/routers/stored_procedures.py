import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.stored_procedures import (
    AtendimentoCompletoIn,
    AtendimentoCompletoOut,
    ReajusteEscalaIn,
    ReajusteEscalaOut,
    TempoMedioEsperaOut,
)


router = APIRouter(tags=["Stored Procedures"])


def _codigo_postgres(exc: IntegrityError) -> str | None:
    return getattr(exc.orig, "pgcode", None)


@router.post(
    "/atendimentos/completo",
    response_model=AtendimentoCompletoOut,
    status_code=status.HTTP_201_CREATED,
)
def registrar_atendimento_completo(
    dados: AtendimentoCompletoIn,
    db: Session = Depends(get_db),
):
    try:
        procedimentos_json = json.dumps(
            [item.model_dump(mode="json") for item in dados.procedimentos]
        )
        db.execute(
            text(
                """
                CALL sp_registrar_atendimento_completo(
                    :data_hora,
                    :duracao_minutos,
                    :id_paciente,
                    :id_residente,
                    :id_preceptor,
                    CAST(:procedimentos AS JSONB)
                )
                """
            ),
            {
                "data_hora": dados.data_hora,
                "duracao_minutos": dados.duracao_minutos,
                "id_paciente": dados.id_paciente,
                "id_residente": dados.id_residente,
                "id_preceptor": dados.id_preceptor,
                "procedimentos": procedimentos_json,
            },
        )
        id_atendimento = db.execute(
            text(
                """
                SELECT currval(
                    pg_get_serial_sequence('atendimento', 'id_atendimento')
                )
                """
            )
        ).scalar_one()
        db.commit()

        return AtendimentoCompletoOut(
            id_atendimento=id_atendimento,
            procedimentos_registrados=len(dados.procedimentos),
        )
    except IntegrityError as exc:
        db.rollback()
        codigo = _codigo_postgres(exc)
        if codigo == "23503":
            raise HTTPException(
                status_code=404,
                detail="Paciente, residente, preceptor ou procedimento não encontrado.",
            ) from exc
        if codigo == "23505":
            raise HTTPException(
                status_code=409,
                detail="Há dados duplicados no atendimento informado.",
            ) from exc
        raise HTTPException(
            status_code=400,
            detail="Os dados do atendimento violam uma regra de integridade.",
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Não foi possível registrar o atendimento completo.",
        ) from exc


@router.get(
    "/unidades/tempo-medio-espera",
    response_model=list[TempoMedioEsperaOut],
)
def calcular_tempo_medio_espera(db: Session = Depends(get_db)):
    try:
        return (
            db.execute(
                text(
                    """
                    SELECT unidade, tempo_medio_espera_minutos
                    FROM sp_calcular_tempo_medio_espera()
                    ORDER BY unidade
                    """
                )
            )
            .mappings()
            .all()
        )
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=500,
            detail="Não foi possível calcular o tempo médio de espera.",
        ) from exc


@router.post("/escalas/reajuste", response_model=ReajusteEscalaOut)
def reajustar_escala(
    dados: ReajusteEscalaIn,
    db: Session = Depends(get_db),
):
    parametros_origem = {
        "id_residente": dados.id_residente,
        "dia_origem": dados.dia_origem,
        "turno_origem": dados.turno_origem,
    }
    contar_origem = text(
        """
        SELECT COUNT(*)
        FROM escala
        WHERE id_residente = :id_residente
          AND dia_semana = :dia_origem
          AND turno = :turno_origem
        """
    )

    try:
        escalas_encontradas = db.execute(
            contar_origem, parametros_origem
        ).scalar_one()
        if escalas_encontradas == 0:
            raise HTTPException(
                status_code=404,
                detail="Nenhuma escala de origem foi encontrada para o residente.",
            )

        db.execute(
            text(
                """
                CALL sp_reajustar_escala(
                    :id_residente,
                    :dia_origem,
                    :turno_origem,
                    :dia_destino,
                    :turno_destino
                )
                """
            ),
            {
                **parametros_origem,
                "dia_destino": dados.dia_destino,
                "turno_destino": dados.turno_destino,
            },
        )
        conflitos_ignorados = db.execute(
            contar_origem, parametros_origem
        ).scalar_one()
        db.commit()

        return ReajusteEscalaOut(
            escalas_encontradas=escalas_encontradas,
            escalas_reajustadas=escalas_encontradas - conflitos_ignorados,
            conflitos_ignorados=conflitos_ignorados,
        )
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="O reajuste causaria conflito com outra escala do residente.",
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Não foi possível reajustar a escala.",
        ) from exc
