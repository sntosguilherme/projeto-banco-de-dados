from datetime import date
from pydantic import BaseModel, model_validator, Field, field_validator


class PacienteCreate(BaseModel):
    # Dados da Pessoa
    nome: str
    cpf: str = Field(pattern=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$')
    data_nascimento: date
    is_flamengo: bool = False
    telefone: str | None = Field(default=None, pattern=r'^\(\d{2}\) \d{5}-\d{4}$')

    # validator para garantir que a data de nascimento esteja entre 01/01/1900 e hoje
    @field_validator('data_nascimento')
    @classmethod
    def validar_data_nascimento(cls, v: date):
        if v < date(1900, 1, 1) or v > date.today():
            raise ValueError('A data de nascimento deve estar entre 01/01/1900 e hoje')
        return v

    # Dados do Paciente
    num_convenio: str | None = None
    alergias: list[str] = []
    grupo_sanguineo: str | None = Field(default=None, max_length=3)


class PacienteCreateOut(BaseModel):
    id_pessoa: int
    detail: str = "Paciente cadastrado com sucesso"


class PacienteOut(BaseModel):
    id_pessoa: int
    nome: str
    cpf: str
    num_convenio: str | None = None
    alergias: str | None = None
    grupo_sanguineo: str | None = None


class PacienteUpdate(BaseModel):
    # Atualização de um paciente pode incluir qualquer um dos campos opcionais abaixo.
    num_convenio: str | None = None
    alergias: list[str] | None = None

    @model_validator(mode="after")
    def pelo_menos_um_campo(self):
        if self.num_convenio is None and self.alergias is None:
            raise ValueError(
                "Informe ao menos um campo: 'num_convenio' ou 'alergias'"
            )
        return self


class PacienteUpdateOut(BaseModel):
    id_pessoa: int
    detail: str = "Paciente atualizado com sucesso"