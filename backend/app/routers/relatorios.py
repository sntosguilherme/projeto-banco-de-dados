from fastapi import APIRouter
from app.database import get_db_connection
from app.sql_loader import load_query
from app.schemas.relatorios import (
    RankingResidenteOut,
    PreceptorSupervisorOut,
    PlantaoPorUnidadeOut,
    PacienteSemProcedimentoAltoRiscoOut,
)

router = APIRouter(tags=["Relatórios"])

ARQUIVO_SQL = "04_analytical_queries.sql"


@router.get("/residentes/ranking", response_model=list[RankingResidenteOut])
def ranking_residentes():
    """Ranking dos residentes por quantidade total de atendimentos realizados."""
    query = load_query(ARQUIVO_SQL, "ranking_residentes_atendimentos")
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()


@router.get("/preceptores/supervisao", response_model=list[PreceptorSupervisorOut])
def preceptores_mais_de_5_atendimentos():
    """Preceptores que supervisionaram mais de 5 atendimentos em algum mês."""
    query = load_query(ARQUIVO_SQL, "preceptores_mais_de_5_atendimentos_mes")
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()


@router.get("/unidades/plantoes", response_model=list[PlantaoPorUnidadeOut])
def plantoes_por_unidade():
    """Quantidade de plantões escalados por residente, agrupado por unidade."""
    query = load_query(ARQUIVO_SQL, "plantoes_por_residente_unidade")
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()


@router.get(
    "/pacientes/sem-procedimento-alto-risco",
    response_model=list[PacienteSemProcedimentoAltoRiscoOut],
)
def pacientes_sem_procedimento_alto_risco():
    """Pacientes que nunca realizaram nenhum procedimento de risco ALTO."""
    query = load_query(ARQUIVO_SQL, "pacientes_sem_procedimento_alto_risco")
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()