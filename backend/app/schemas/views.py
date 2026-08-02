from datetime import datetime

from pydantic import BaseModel


class EstatisticaAtendimentoMensalOut(BaseModel):
    mes: str
    unidade: str | None = None
    total_atendimentos: int
    media_duracao: float
    procedimento_mais_comum: str | None = None


class PacienteInternadoOut(BaseModel):
    paciente_nome: str
    data_hora_entrada: datetime
    unidade_internacao: str


class ResidenteSemSupervisorOut(BaseModel):
    residente_nome: str
    preceptor_nome: str
    preceptor_titulacao: str
    supervisao_ativa: bool
