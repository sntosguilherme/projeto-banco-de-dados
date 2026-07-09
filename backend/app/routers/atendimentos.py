from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db_connection
from app.sql_loader import load_query
from datetime import datetime
from psycopg2 import errors as pg_errors

router = APIRouter(prefix="/atendimentos", tags=["Atendimentos"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"

class AtendimentoSchema(BaseModel):
    data_hora: datetime
    duracao_minutos: int
    id_paciente: int
    id_residente: int
    id_preceptor: int

@router.post("/")
def criar_atendimento(dados: AtendimentoSchema):
    try:
        sql = load_query(ARQUIVO_SQL, "inserir_atendimento")
        
        with get_db_connection() as conn:
            with conn:
                with conn.cursor() as cursor:
                    sql = load_query(ARQUIVO_SQL, "inserir_atendimento")
                    cursor.execute(sql, (
                        dados.data_hora,
                        dados.duracao_minutos,
                        dados.id_paciente,
                        dados.id_residente,
                        dados.id_preceptor
                    ))
                    return {"mensagem": "Atendimento criado com sucesso."}
    except pg_errors.ForeignKeyViolation:
        
        raise HTTPException(
            status_code=404,
            detail="Paciente, residente ou preceptor informado não existe."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))