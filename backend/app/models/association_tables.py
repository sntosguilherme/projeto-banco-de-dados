from sqlalchemy import Column, ForeignKeyConstraint, Integer, PrimaryKeyConstraint, Table

from .base import Base


t_paciente_alergia = Table(
    'paciente_alergia', Base.metadata,
    Column('id_pessoa', Integer, primary_key=True),
    Column('id_alergia', Integer, primary_key=True),
    ForeignKeyConstraint(['id_alergia'], ['alergia.id_alergia'], ondelete='CASCADE', name='paciente_alergia_id_alergia_fkey'),
    ForeignKeyConstraint(['id_pessoa'], ['paciente.id_pessoa'], ondelete='CASCADE', name='paciente_alergia_id_pessoa_fkey'),
    PrimaryKeyConstraint('id_pessoa', 'id_alergia', name='paciente_alergia_pkey')
)