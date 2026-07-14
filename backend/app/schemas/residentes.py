from pydantic import BaseModel

# GET /residentes/metricas/tempo-medio-atendimento
class TempoMedioResidenteOut(BaseModel):
    # Retorna o tempo médio de atendimento por residente.
    nome_residente: str
    ano_residencia: str
    tempo_medio_atendimento: float