from typing import Optional

from sqlalchemy import Boolean, CheckConstraint, ForeignKeyConstraint, Integer, PrimaryKeyConstraint, String, Text, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Procedimento(Base):
    __tablename__ = 'procedimento'
    __table_args__ = (
        CheckConstraint("nivel_risco::text = ANY (ARRAY['BAIXO'::character varying, 'MEDIO'::character varying, 'ALTO'::character varying]::text[])", name='procedimento_nivel_risco_check'),
        CheckConstraint('tempo_medio_minutos > 0', name='procedimento_tempo_medio_minutos_check'),
        PrimaryKeyConstraint('id_procedimento', name='procedimento_pkey'),
        UniqueConstraint('codigo', name='procedimento_codigo_key')
    )

    id_procedimento: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(String(20), nullable=False)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    tempo_medio_minutos: Mapped[int] = mapped_column(Integer, nullable=False)
    nivel_risco: Mapped[Optional[str]] = mapped_column(String(20), server_default=text("'BAIXO'::character varying"))

    procedimento_realizado: Mapped[list['ProcedimentoRealizado']] = relationship('ProcedimentoRealizado', back_populates='procedimento')


class ProcedimentoRealizado(Base):
    __tablename__ = 'procedimento_realizado'
    __table_args__ = (
        CheckConstraint('quantidade > 0', name='procedimento_realizado_quantidade_check'),
        CheckConstraint('tempo_real_minutos > 0', name='procedimento_realizado_tempo_real_minutos_check'),
        ForeignKeyConstraint(['id_atendimento'], ['atendimento.id_atendimento'], ondelete='CASCADE', name='procedimento_realizado_id_atendimento_fkey'),
        ForeignKeyConstraint(['id_procedimento'], ['procedimento.id_procedimento'], name='procedimento_realizado_id_procedimento_fkey'),
        PrimaryKeyConstraint('id_atendimento', 'id_procedimento', name='procedimento_realizado_pkey')
    )

    id_atendimento: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_procedimento: Mapped[int] = mapped_column(Integer, primary_key=True)
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False)
    tempo_real_minutos: Mapped[int] = mapped_column(Integer, nullable=False)
    faturado: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('false'))
    observacao: Mapped[Optional[str]] = mapped_column(Text)

    atendimento: Mapped['Atendimento'] = relationship('Atendimento', back_populates='procedimento_realizado')
    procedimento: Mapped['Procedimento'] = relationship('Procedimento', back_populates='procedimento_realizado')