from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.sql_loader import load_query
from app.schemas.procedimento import (
    ProcedimentoRealizadoOut,
    ProcedimentoRealizadoDeleteOut,
    ProcedimentoRealizadoCreate,
    ProcedimentoRealizadoCreateOut,
)

router = APIRouter(prefix="/atendimentos", tags=["Procedimentos"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"


# rota para listar os procedimentos realizados em um atendimento específico
@router.get(
    "/{id_atendimento}/procedimentos",
    response_model=list[ProcedimentoRealizadoOut],
)
def listar_procedimentos_do_atendimento(id_atendimento: int):
    try:
        sql = load_query(ARQUIVO_SQL, "listar_procedimentos")

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, (id_atendimento,))
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# rota para deletar um procedimento realizado em um atendimento específico
@router.delete(
    "/{id_atendimento}/procedimentos/{id_procedimento}",
    response_model=ProcedimentoRealizadoDeleteOut,
)
def deletar_procedimento_realizado(id_atendimento: int, id_procedimento: int):
    try:
        sql = load_query(ARQUIVO_SQL, "remover_procedimento")

        with get_db_connection() as conn:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql, (id_atendimento, id_procedimento))

                    if cursor.rowcount == 0:
                        raise HTTPException(
                            status_code=404,
                            detail="Procedimento não encontrado ou já faturado.",
                        )

                    return ProcedimentoRealizadoDeleteOut(
                        id_atendimento=id_atendimento,
                        id_procedimento=id_procedimento,
                    )
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Rota para inserir um procedimento em um atendimento existente
@router.post(
    "/{id_atendimento}/procedimentos",
    response_model=ProcedimentoRealizadoCreateOut,
    status_code=201,
)
def inserir_procedimento_em_atendimento(id_atendimento: int, dados: ProcedimentoRealizadoCreate):
    try:
        sql_verifica_atendimento = load_query(ARQUIVO_SQL, "verificar_atendimento_existe")
        sql_verifica_procedimento = load_query(ARQUIVO_SQL, "verificar_procedimento_existe")
        sql_inserir_procedimento = load_query(ARQUIVO_SQL, "inserir_procedimento_realizado")

        with get_db_connection() as conn:
            with conn:
                with conn.cursor() as cursor:
                    
                    cursor.execute(sql_verifica_atendimento, (id_atendimento,))
                    if not cursor.fetchone():
                        raise HTTPException(
                            status_code=404,
                            detail="Atendimento não encontrado.",
                        )
                    cursor.execute(sql_verifica_procedimento, (dados.id_procedimento,))
                    if not cursor.fetchone():
                        raise HTTPException(
                            status_code=404,
                            detail="Procedimento não encontrado.",
                        )
                    cursor.execute(
                        sql_inserir_procedimento,
                        (
                            id_atendimento,
                            dados.id_procedimento,
                            dados.quantidade,
                            dados.tempo_real_minutos,
                            dados.observacao,
                        ))
                    resultado = cursor.fetchone()
                    return ProcedimentoRealizadoCreateOut(**resultado)
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))