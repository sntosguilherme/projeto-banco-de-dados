from datetime import date
from pydantic import BaseModel, Field


class PessoaBase(BaseModel):
    nome: str
    cpf: str
    data_nascimento: date
    is_flamengo: bool = False
    telefone: str | None = None


class ProfissionalBase(PessoaBase):
    crm: str
    data_admissao: date
    especialidade: str


class ResidenteCreate(ProfissionalBase):
    ano_residencia: str = Field(..., description="Ano de residência (ex: R1, R2, R3)", pattern="^(R1|R2|R3)$")


class ResidenteCreateOut(BaseModel):
    id_pessoa: int
    detail: str = "Residente cadastrado com sucesso"


class PreceptorCreate(ProfissionalBase):
    titulacao: str = Field(..., description="Titulação do preceptor")


class PreceptorCreateOut(BaseModel):
    id_pessoa: int
    detail: str = "Preceptor cadastrado com sucesso"


class ProfissionalOut(BaseModel):
    id_pessoa: int
    nome: str
    crm: str
    especialidade: str
    papel: str | None = None
    ano_residencia: str | None = None
    titulacao: str | None = None
