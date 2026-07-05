from pydantic import BaseModel


# GET /atendimentos/{id_atendimento}/procedimentos
class ProcedimentoRealizadoOut(BaseModel):
    # Retorna os procedimentos realizados em um atendimento específico.
    nome_procedimento: str
    quantidade: int
    tempo_real_minutos: int



# DELETE /atendimentos/{id_atendimento}/procedimentos/{id_procedimento}
class ProcedimentoRealizadoDeleteOut(BaseModel):
    # Confirmação de remoção do procedimento realizado. A logica da flag "faturado" é tratada no banco de dados e deve ser tratada na rota.
    id_atendimento: int
    id_procedimento: int
    detail: str = "Procedimento removido com sucesso"
