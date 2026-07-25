from .alergias import Alergia
from .association_tables import t_paciente_alergia
from .atendimentos import Atendimento
from .base import Base
from .escalas import Escala
from .internacoes import Internacao
from .pacientes import Paciente
from .pessoas import Pessoa
from .procedimentos import Procedimento, ProcedimentoRealizado
from .profissionais import Preceptor, Profissional, Residente
from .unidades import Unidade
from .views import (
    t_vw_estatisticas_atendimentos_mensal,
    t_vw_pacientes_internados,
    t_vw_residentes_sem_supervisor,
)