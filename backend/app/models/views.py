from sqlalchemy import BigInteger, Boolean, Column, DateTime, Numeric, String, Table, Text
from .base import Base

t_vw_estatisticas_atendimentos_mensal = Table(
    'vw_estatisticas_atendimentos_mensal', Base.metadata,
    Column('mes', Text),
    Column('unidade', String(100)),
    Column('total_atendimentos', BigInteger),
    Column('media_duracao', Numeric),
    Column('procedimento_mais_comum', String)
)

t_vw_pacientes_internados = Table(
    'vw_pacientes_internados', Base.metadata,
    Column('paciente_nome', String(100)),
    Column('data_hora_entrada', DateTime),
    Column('unidade_internacao', String(100))
)

t_vw_residentes_sem_supervisor = Table(
    'vw_residentes_sem_supervisor', Base.metadata,
    Column('residente_nome', String(100)),
    Column('preceptor_nome', String(100)),
    Column('preceptor_titulacao', String(50)),
    Column('supervisao_ativa', Boolean)
)