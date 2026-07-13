from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.sql_loader import load_query
from app.schemas.profissional import (
    ResidenteCreate,
    ResidenteCreateOut,
    PreceptorCreate,
    PreceptorCreateOut,
    ProfissionalOut
)

router = APIRouter(tags=["Profissionais"])
ARQUIVO_SQL = "03_crud_and_basic_queries.sql"

@router.post("/residentes", response_model=ResidenteCreateOut, status_code=201)
def criar_residente(residente: ResidenteCreate):
    try:
        sql_pessoa = load_query(ARQUIVO_SQL, "inserir_pessoa")
        sql_profissional = load_query(ARQUIVO_SQL, "inserir_profissional")
        sql_residente = load_query(ARQUIVO_SQL, "inserir_residente")
        
        with get_db_connection() as conn:
            with conn: 
                with conn.cursor() as cursor:
                    # Inserir a Pessoa
                    cursor.execute(sql_pessoa, (
                        residente.nome,
                        residente.cpf,
                        residente.data_nascimento,
                        residente.is_flamengo,
                        residente.telefone
                    ))
                    
                    result = cursor.fetchone()
                    id_pessoa = result["id_pessoa"]
                    
                    # Inserir o Profissional
                    cursor.execute(sql_profissional, (
                        id_pessoa,
                        residente.crm,
                        residente.data_admissao,
                        residente.especialidade
                    ))
                    
                    # Inserir o Residente
                    cursor.execute(sql_residente, (
                        id_pessoa,
                        residente.ano_residencia
                    ))
                    
        return ResidenteCreateOut(id_pessoa=id_pessoa)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preceptores", response_model=PreceptorCreateOut, status_code=201)
def criar_preceptor(preceptor: PreceptorCreate):
    try:
        sql_pessoa = load_query(ARQUIVO_SQL, "inserir_pessoa")
        sql_profissional = load_query(ARQUIVO_SQL, "inserir_profissional")
        sql_preceptor = load_query(ARQUIVO_SQL, "inserir_preceptor")
        
        with get_db_connection() as conn:
            with conn: 
                with conn.cursor() as cursor:
                    # Inserir a Pessoa
                    cursor.execute(sql_pessoa, (
                        preceptor.nome,
                        preceptor.cpf,
                        preceptor.data_nascimento,
                        preceptor.is_flamengo,
                        preceptor.telefone
                    ))
                    
                    result = cursor.fetchone()
                    id_pessoa = result["id_pessoa"]
                    
                    # Inserir o Profissional
                    cursor.execute(sql_profissional, (
                        id_pessoa,
                        preceptor.crm,
                        preceptor.data_admissao,
                        preceptor.especialidade
                    ))
                    
                    # Inserir o Preceptor
                    cursor.execute(sql_preceptor, (
                        id_pessoa,
                        preceptor.titulacao
                    ))
                    
        return PreceptorCreateOut(id_pessoa=id_pessoa)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profissionais", response_model=list[ProfissionalOut])
def listar_profissionais():
    try:
        sql = load_query(ARQUIVO_SQL, "listar_profissionais")
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql)
                return cursor.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
