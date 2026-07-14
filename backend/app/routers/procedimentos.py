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
        sql_delete = load_query(ARQUIVO_SQL, "remover_procedimento")

        with get_db_connection() as conn:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql_delete, (id_atendimento, id_procedimento))

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
        # Puxando as queries necessárias
        sql_verifica_atendimento = load_query(ARQUIVO_SQL, "verificar_atendimento_existe")
        sql_verifica_procedimento = load_query(ARQUIVO_SQL, "verificar_procedimento_existe")
        sql_inserir_procedimento = load_query(ARQUIVO_SQL, "inserir_procedimento_realizado")

        # Query manual para checar tempo (não precisa estar no SQL se for simples, ou podemos usar db inline)
        sql_soma_tempo = "SELECT COALESCE(SUM(tempo_real_minutos), 0) AS soma FROM PROCEDIMENTO_REALIZADO WHERE id_atendimento = %s"

        with get_db_connection() as conn:
            with conn:
                with conn.cursor() as cursor:
                    
                    # 1. Verifica se o atendimento existe e pega a duração dele
                    cursor.execute(sql_verifica_atendimento, (id_atendimento,))
                    atendimento = cursor.fetchone()
                    if not atendimento:
                        raise HTTPException(
                            status_code=404,
                            detail="Atendimento não encontrado.",
                        )
                    
                    duracao_atendimento = atendimento["duracao_minutos"]

                    # 2. Verifica se o procedimento existe
                    cursor.execute(sql_verifica_procedimento, (dados.id_procedimento,))
                    if not cursor.fetchone():
                        raise HTTPException(
                            status_code=404,
                            detail="Procedimento não encontrado.",
                        )
                    
                    # 3. Validação de Regra de Negócio: O tempo total dos procedimentos não pode exceder o atendimento
                    cursor.execute(sql_soma_tempo, (id_atendimento,))
                    resultado_soma = cursor.fetchone()
                    soma_atual = resultado_soma["soma"] if resultado_soma else 0
                    
                    novo_tempo_total = soma_atual + dados.tempo_real_minutos
                    if novo_tempo_total > duracao_atendimento:
                        raise HTTPException(
                            status_code=400,
                            detail=f"A soma do tempo dos procedimentos ({novo_tempo_total} min) não pode exceder a duração total do atendimento ({duracao_atendimento} min).",
                        )

                    # 4. Insere o procedimento
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
    
# End of file - forcing reload to load updated SQL queries.