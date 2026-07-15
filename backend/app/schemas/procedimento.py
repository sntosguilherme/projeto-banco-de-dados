from pydantic import BaseModel
from typing import Optional

# GET /procedimentos
class ProcedimentoOut(BaseModel):
    id_procedimento: int
    codigo: str
    nome: str
    tempo_medio_minutos: int
    nivel_risco: str
# GET /atendimentos/{id_atendimento}/procedimentos
class ProcedimentoRealizadoOut(BaseModel):
    # Retorna os procedimentos realizados em um atendimento específico.
    id_procedimento: int
    nome_procedimento: str
    quantidade: int
    tempo_real_minutos: int
    observacao: Optional[str] = None
    faturado: bool



# DELETE /atendimentos/{id_atendimento}/procedimentos/{id_procedimento}
class ProcedimentoRealizadoDeleteOut(BaseModel):
    # Confirmação de remoção do procedimento realizado. A logica da flag "faturado" é tratada no banco de dados e deve ser tratada na rota.
    id_atendimento: int
    id_procedimento: int
    detail: str = "Procedimento removido com sucesso"

# POST /atendimentos/{id_atendimento}/procedimentos
class ProcedimentoRealizadoCreate(BaseModel):
    # Cria um novo procedimento realizado em um atendimento específico.
    id_procedimento: int
    quantidade: int
    tempo_real_minutos: int
    observacao: Optional[str] = None

class ProcedimentoRealizadoCreateOut(BaseModel):
    # Retorna os dados do procedimento realizado criado.
    id_atendimento: int
    id_procedimento: int
    quantidade: int
    tempo_real_minutos: int
    observacao: Optional[str] = None