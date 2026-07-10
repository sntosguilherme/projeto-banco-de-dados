from datetime import date
from pydantic import BaseModel


# GET /residentes/ranking
class RankingResidenteOut(BaseModel):
    # Corpo esperado da resposta para a rota de ranking de residentes.
    residente: str
    total_atendimentos: int


# GET /preceptores/supervisao
class PreceptorSupervisorOut(BaseModel):
    # Corpo esperado da resposta para a rota de supervisão de preceptores.
    preceptor: str
    mes: date
    total_atendimentos: int

# GET /unidades/plantoes
class PlantaoPorUnidadeOut(BaseModel):
    # Corpo esperado da resposta para a rota de plantões por unidade.
    unidade: str
    residente: str
    qtd_plantoes_semanais: int

# GET /pacientes/sem-procedimento-alto-risco
class PacienteSemProcedimentoAltoRiscoOut(BaseModel):
    # Corpo esperado da resposta para a rota de pacientes sem procedimento de alto risco.
    paciente: str