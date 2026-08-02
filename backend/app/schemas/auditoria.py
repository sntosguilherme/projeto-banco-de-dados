from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict


OperacaoAuditoria = Literal["INSERT", "UPDATE", "DELETE"]


class AuditoriaAtendimentoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_auditoria: int
    id_atendimento: int
    operacao: OperacaoAuditoria
    usuario: str
    dados_antigos: dict[str, Any] | None = None
    dados_novos: dict[str, Any] | None = None
    data_hora: datetime
