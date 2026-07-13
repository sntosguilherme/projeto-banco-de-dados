from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.sql_loader import load_query
from app.schemas.paciente import PacienteUpdate, PacienteUpdateOut
from app.schemas.atendimento import AtendimentoOut

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"

# rota para listar os atendimentos de um paciente específico.
@router.get("/{id_paciente}/atendimentos", response_model=list[AtendimentoOut])
def listar_atendimentos_do_paciente(id_paciente: int):
    try:
        sql = load_query(ARQUIVO_SQL, "listar_atendimentos")

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, (id_paciente,))
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# rota para atualizar os dados de um paciente específico. 
# Atende tanto a atualização do número do convênio quanto das alergias.
# Os demais dados do paciente não podem ser atualizados através desta rota pois não estao no schema pydantic.
@router.patch("/{id_paciente}", response_model=PacienteUpdateOut)
def atualizar_paciente(id_paciente: int, dados: PacienteUpdate):
    try:
        with get_db_connection() as conn:
            with conn: 
                with conn.cursor() as cursor:
                    if dados.num_convenio is not None:
                        sql = load_query(ARQUIVO_SQL, "atualizar_paciente_convenio")
                        cursor.execute(sql, (dados.num_convenio, id_paciente))

                if dados.alergias is not None:
                    sql = load_query(ARQUIVO_SQL, "atualizar_paciente_alergias")
                    cursor.execute(sql, (dados.alergias, id_paciente))

        return PacienteUpdateOut(id_pessoa=id_paciente)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))