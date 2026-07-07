from fastapi import APIRouter, HTTPException, Body
from app.database import get_db_connection
from app.sql_loader import load_query

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"

#rota para listar todos os atendimentos de um paciente
@router.get("/{id_paciente}/atendimentos")
def listar_atendimentos_do_paciente(id_paciente: int):
    try:
        #carrega a query sql específica usando o loader de queries
        sql = load_query(ARQUIVO_SQL, "listar_atendimentos")

        #abre a conexão com o bd usando o gerenciador de contexto
        with get_db_connection() as conn:
            #abre o cursor para conseguir executar comandos no banco
            with conn.cursor() as cursor:
                #executa a query com o id do paciente como parâmetro
                cursor.execute(sql, (id_paciente,))
                #pega todos os registros retornados pelo banco
                resultados = cursor.fetchall()
                return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#rota para atualizar o convenio de um paciente
@router.patch("/{id_paciente}/convenio")
def atualizar_convenio(id_paciente: int, num_convenio: str = Body(embed=True)):
    try:
        sql = load_query(ARQUIVO_SQL, "atualizar_paciente_convenio")

        with get_db_connection() as conn:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql,(num_convenio, id_paciente))
                return {"mensagem": "Convênio atualizado com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#rota para atualizar as alergias do paciente
@router.patch("/{id_paciente}/alergias")
def atualizar_alergias(id_paciente: int, alergias: str = Body(embed=True)):
    try:
        sql = load_query(ARQUIVO_SQL, "atualizar_paciente_alergias")

        with get_db_connection() as conn:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql,(alergias, id_paciente))
                return {"mensagem": "Alergias atualizadas com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))