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

# GET /preceptores/supervisionaram-pacientes-flamenguistas
class PreceptorFlamenguistaOut(BaseModel):
    id_profissional: int
    nome: str
    crm: str
    titulacao: str
 
    class Config:
        from_attributes = True

# Resumo de cada procedimento dentro do "último atendimento"
class ProcedimentoResumoOut(BaseModel):
    nome_procedimento: str
    quantidade: int
    tempo_real_minutos: int
 
    class Config:
        from_attributes = True

# GET /pacientes/ultimo-atendimento
class UltimoAtendimentoOut(BaseModel):
    id_atendimento: int
    data_hora: date.datetime
    paciente: str
    residente: str
    preceptor: str
    procedimentos: list[ProcedimentoResumoOut]

# GET /residentes/percentual-alto-risco
class PercentualAltoRiscoOut(BaseModel):
    id_residente: int
    nome_residente: str
    total_procedimentos: int
    total_alto_risco: int
    percentual_alto_risco: float