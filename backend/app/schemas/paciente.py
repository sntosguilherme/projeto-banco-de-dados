from pydantic import BaseModel, model_validator


class PacienteUpdate(BaseModel):
    # Atualização de um paciente pode incluir qualquer um dos campos opcionais abaixo.
    num_convenio: str | None = None
    alergias: str | None = None
    
    # validação para garantir que pelo menos um dos campos seja fornecido
    @model_validator(mode="after")
    def pelo_menos_um_campo(self):
        if self.num_convenio is None and self.alergias is None:
            raise ValueError(
                "Informe ao menos um campo: 'num_convenio' ou 'alergias'" 
            )
        return self
 
 
class PacienteUpdateOut(BaseModel):
    # Retorna o id do paciente atualizado e uma mensagem de sucesso.
    id_pessoa: int
    detail: str = "Paciente atualizado com sucesso"