from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.sql_loader import load_query

router = APIRouter(prefix="/atendimentos", tags=["Procedimentos"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"

#rota para listar os procedimentos de um atendimento
@router.get("/{id_atendimento}/procedimentos")
def listar_procedimentos_do_atendimento(id_atendimento: int):
    try:
        sql = load_query(ARQUIVO_SQL, "listar_procedimentos")

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, (id_atendimento,))
                resultados = cursor.fetchall()
                return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#rota para deletar um procedimento realizado de um atendimento se não tiver sido faturado
@router.delete("/{id_atendimento}/procedimentos/{id_procedimento}")
def deletar_procedimento_realizado(id_atendimento: int, id_procedimento: int):
    try:
        sql = load_query(ARQUIVO_SQL, "remover_procedimento")

        with get_db_connection() as conn:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql, (id_atendimento, id_procedimento))

                    #verificação: rowcount diz quantas linhas foram afetadas pela última operação
                    if cursor.rowcount == 0:
                        raise HTTPException(
                            status_code=404, 
                            detail=f"Procedimento não encontrado ou já faturado."
                        )
                    return {"mensagem": "Procedimento removido com sucesso."}
    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))