from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator


DiaSemana = Literal[
    "Segunda",
    "Terca",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sabado",
    "Domingo",
]
Turno = Literal["Manha", "Tarde", "Noite"]


class ProcedimentoAtendimentoCompletoIn(BaseModel):
    id_procedimento: int = Field(gt=0)
    quantidade: int = Field(gt=0)
    tempo_real_minutos: int = Field(gt=0)
    faturado: bool = False
    observacao: str | None = None
    data_hora_inicio: datetime | None = None


class AtendimentoCompletoIn(BaseModel):
    data_hora: datetime
    duracao_minutos: int = Field(gt=0)
    id_paciente: int = Field(gt=0)
    id_residente: int = Field(gt=0)
    id_preceptor: int = Field(gt=0)
    procedimentos: list[ProcedimentoAtendimentoCompletoIn] = Field(min_length=1)

    @model_validator(mode="after")
    def validar_procedimentos(self):
        ids = [item.id_procedimento for item in self.procedimentos]
        if len(ids) != len(set(ids)):
            raise ValueError("Um procedimento não pode ser informado mais de uma vez")

        tempo_total = sum(item.tempo_real_minutos for item in self.procedimentos)
        if tempo_total > self.duracao_minutos:
            raise ValueError(
                "A soma do tempo dos procedimentos não pode exceder a duração do atendimento"
            )

        if any(
            item.data_hora_inicio is not None
            and item.data_hora_inicio < self.data_hora
            for item in self.procedimentos
        ):
            raise ValueError(
                "O início de um procedimento não pode ser anterior ao atendimento"
            )

        return self


class AtendimentoCompletoOut(BaseModel):
    id_atendimento: int
    procedimentos_registrados: int
    detail: str = "Atendimento e procedimentos registrados com sucesso"


class TempoMedioEsperaOut(BaseModel):
    unidade: str
    tempo_medio_espera_minutos: float


class ReajusteEscalaIn(BaseModel):
    id_residente: int = Field(gt=0)
    dia_origem: DiaSemana
    turno_origem: Turno
    dia_destino: DiaSemana
    turno_destino: Turno

    @model_validator(mode="after")
    def validar_destino(self):
        if (
            self.dia_origem == self.dia_destino
            and self.turno_origem == self.turno_destino
        ):
            raise ValueError("A escala de destino deve ser diferente da escala de origem")
        return self


class ReajusteEscalaOut(BaseModel):
    escalas_encontradas: int
    escalas_reajustadas: int
    conflitos_ignorados: int
    detail: str = "Reajuste de escala concluído"
