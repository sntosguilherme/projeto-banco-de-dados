from typing import Optional

from sqlalchemy import CheckConstraint, ForeignKeyConstraint, Integer, PrimaryKeyConstraint, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Escala(Base):
    __tablename__ = 'escala'
    __table_args__ = (
        CheckConstraint("dia_semana::text = ANY (ARRAY['Segunda'::character varying, 'Terca'::character varying, 'Quarta'::character varying, 'Quinta'::character varying, 'Sexta'::character varying, 'Sabado'::character varying, 'Domingo'::character varying]::text[])", name='escala_dia_semana_check'),
        CheckConstraint("turno::text = ANY (ARRAY['Manha'::character varying, 'Tarde'::character varying, 'Noite'::character varying]::text[])", name='escala_turno_check'),
        ForeignKeyConstraint(['id_preceptor'], ['preceptor.id_profissional'], name='escala_id_preceptor_fkey'),
        ForeignKeyConstraint(['id_residente'], ['residente.id_profissional'], name='escala_id_residente_fkey'),
        ForeignKeyConstraint(['id_unidade'], ['unidade.id_unidade'], name='escala_id_unidade_fkey'),
        PrimaryKeyConstraint('id_escala', name='escala_pkey'),
        UniqueConstraint('id_unidade', 'dia_semana', 'turno', 'id_residente', name='unique_escala_residente')
    )

    id_escala: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_unidade: Mapped[int] = mapped_column(Integer, nullable=False)
    id_residente: Mapped[int] = mapped_column(Integer, nullable=False)
    id_preceptor: Mapped[int] = mapped_column(Integer, nullable=False)
    dia_semana: Mapped[Optional[str]] = mapped_column(String(15))
    turno: Mapped[Optional[str]] = mapped_column(String(10))

    preceptor: Mapped['Preceptor'] = relationship('Preceptor', back_populates='escala')
    residente: Mapped['Residente'] = relationship('Residente', back_populates='escala')
    unidade: Mapped['Unidade'] = relationship('Unidade', back_populates='escala')