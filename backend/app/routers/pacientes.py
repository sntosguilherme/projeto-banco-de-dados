from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.sql_loader import load_query
from app.schemas.paciente import (
    PacienteCreate,
    PacienteCreateOut,
    PacienteOut,
    PacienteUpdate, 
    PacienteUpdateOut
)
from app.schemas.atendimento import AtendimentoOut

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"


def salvar_alergias(cursor, id_pessoa: int, alergias: str | None) -> None:
    if not alergias:
        return

    alergias_normalizadas = [alergia.strip() for alergia in alergias.split(",") if alergia.strip()]
    for alergia in alergias_normalizadas:
        cursor.execute(
            """
            INSERT INTO ALERGIA (nome)
            VALUES (%s)
            ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
            RETURNING id_alergia;
            """,
            (alergia,)
        )
        id_alergia = cursor.fetchone()["id_alergia"]
        cursor.execute(
            """
            INSERT INTO PACIENTE_ALERGIA (id_pessoa, id_alergia)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING;
            """,
            (id_pessoa, id_alergia)
        )

@router.post("", response_model=PacienteCreateOut, status_code=201)
# o response model ele formata a saida final usando o schemas definido para isso
# o 201 é o codigo de status HTTP que significa criado
def criar_paciente(paciente: PacienteCreate):
# valida a entrada do usuario com o response model antes já definido
    try:
        # load_query vai atrás procurar no crud esse de inserir pessoa e inserir paciente
        sql_pessoa = load_query(ARQUIVO_SQL, "inserir_pessoa")
        sql_paciente = load_query(ARQUIVO_SQL, "inserir_paciente")
        
        # abre a conexão com o banco de dados
        with get_db_connection() as conn:
            with conn: # dentro do conn garante que se der erro ele desfaz a operação, fazendo com que o banco de dados fique como estava antes do erro
                with conn.cursor() as cursor:
                    # Inserir a Pessoa
                    cursor.execute(sql_pessoa, (
                        paciente.nome,
                        paciente.cpf,
                        paciente.data_nascimento,
                        paciente.is_flamengo,
                        paciente.telefone
                    ))
                    
                    result = cursor.fetchone()
                    id_pessoa = result["id_pessoa"]
                    
                    # Inserir o Paciente
                    cursor.execute(sql_paciente, (
                        id_pessoa,
                        paciente.num_convenio,
                        paciente.grupo_sanguineo
                    ))

                    salvar_alergias(cursor, id_pessoa, paciente.alergias)
                    
        return PacienteCreateOut(id_pessoa=id_pessoa)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=list[PacienteOut])
def listar_pacientes():
    try:
        sql = load_query(ARQUIVO_SQL, "listar_pacientes")
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql)
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
                        cursor.execute(
                            "DELETE FROM PACIENTE_ALERGIA WHERE id_pessoa = %s",
                            (id_paciente,)
                        )
                        salvar_alergias(cursor, id_paciente, dados.alergias)

        return PacienteUpdateOut(id_pessoa=id_paciente)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
