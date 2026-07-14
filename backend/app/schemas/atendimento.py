from datetime import datetime
from pydantic import BaseModel, Field


# POST /atendimentos
class AtendimentoCreate(BaseModel):
    # Corpo esperado para inserir um novo atendimento.
    data_hora: datetime
    duracao_minutos: int = Field(gt=0, description="Duração em minutos, deve ser positiva")
    id_paciente: int
    id_residente: int
    id_preceptor: int


class AtendimentoCreateOut(BaseModel):
    # Retorno após criar um atendimento (usa RETURNING id_atendimento).
    id_atendimento: int



# GET /pacientes/{id_paciente}/atendimentos
class AtendimentoOut(BaseModel):
    # Retorna os atendimentos de um paciente específico.
    id_atendimento: int
    data_hora: datetime
    duracao_minutos: int
    nome_paciente: str
    nome_residente: str
    nome_preceptor: str


