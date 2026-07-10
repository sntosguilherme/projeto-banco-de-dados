from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.sql_loader import load_query
from app.schemas.atendimento import AtendimentoCreate, AtendimentoCreateOut
from psycopg2 import errors as pg_errors

router = APIRouter(prefix="/atendimentos", tags=["Atendimentos"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"

# Rota para criar um novo atendimento
@router.post("", response_model=AtendimentoCreateOut)
def criar_atendimento(dados: AtendimentoCreate):
    try:
        sql = load_query(ARQUIVO_SQL, "inserir_atendimento")

        with get_db_connection() as conn:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql, (
                        dados.data_hora,
                        dados.duracao_minutos,
                        dados.id_paciente,
                        dados.id_residente,
                        dados.id_preceptor,
                    ))
                    resultado = cursor.fetchone()
                    return AtendimentoCreateOut(id_atendimento=resultado["id_atendimento"])

    except pg_errors.ForeignKeyViolation:
        raise HTTPException(
            status_code=404,
            detail="Paciente, residente ou preceptor informado não existe.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))