import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKeyConstraint, Integer, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Internacao(Base):
    __tablename__ = 'internacao'
    __table_args__ = (
        ForeignKeyConstraint(['id_paciente'], ['paciente.id_pessoa'], ondelete='CASCADE', name='internacao_id_paciente_fkey'),
        ForeignKeyConstraint(['id_unidade'], ['unidade.id_unidade'], ondelete='CASCADE', name='internacao_id_unidade_fkey'),
        PrimaryKeyConstraint('id_internacao', name='internacao_pkey')
    )

    id_internacao: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_paciente: Mapped[int] = mapped_column(Integer, nullable=False)
    id_unidade: Mapped[int] = mapped_column(Integer, nullable=False)
    data_hora_entrada: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    data_hora_saida: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)

    paciente: Mapped['Paciente'] = relationship('Paciente', back_populates='internacao')
    unidade: Mapped['Unidade'] = relationship('Unidade', back_populates='internacao')