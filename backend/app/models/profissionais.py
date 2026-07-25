import datetime
from typing import Optional

from sqlalchemy import Boolean, CheckConstraint, Date, ForeignKeyConstraint, Integer, PrimaryKeyConstraint, String, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .pessoas import Pessoa


class Profissional(Pessoa):
    __tablename__ = 'profissional'
    __table_args__ = (
        ForeignKeyConstraint(['id_pessoa'], ['pessoa.id_pessoa'], ondelete='CASCADE', name='profissional_id_pessoa_fkey'),
        PrimaryKeyConstraint('id_pessoa', name='profissional_pkey'),
        UniqueConstraint('crm', name='profissional_crm_key')
    )

    id_pessoa: Mapped[int] = mapped_column(Integer, primary_key=True)
    crm: Mapped[str] = mapped_column(String(20), nullable=False)
    data_admissao: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    especialidade: Mapped[str] = mapped_column(String(50), nullable=False)


class Preceptor(Profissional):
    __tablename__ = 'preceptor'
    __table_args__ = (
        ForeignKeyConstraint(['id_profissional'], ['profissional.id_pessoa'], ondelete='CASCADE', name='preceptor_id_profissional_fkey'),
        PrimaryKeyConstraint('id_profissional', name='preceptor_pkey')
    )

    id_profissional: Mapped[int] = mapped_column(Integer, primary_key=True)
    titulacao: Mapped[str] = mapped_column(String(50), nullable=False)
    supervisao_ativa: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('true'))

    atendimento: Mapped[list['Atendimento']] = relationship('Atendimento', back_populates='preceptor')
    escala: Mapped[list['Escala']] = relationship('Escala', back_populates='preceptor')


class Residente(Profissional):
    __tablename__ = 'residente'
    __table_args__ = (
        CheckConstraint("ano_residencia::text = ANY (ARRAY['R1'::character varying, 'R2'::character varying, 'R3'::character varying]::text[])", name='residente_ano_residencia_check'),
        ForeignKeyConstraint(['id_profissional'], ['profissional.id_pessoa'], ondelete='CASCADE', name='residente_id_profissional_fkey'),
        PrimaryKeyConstraint('id_profissional', name='residente_pkey')
    )

    id_profissional: Mapped[int] = mapped_column(Integer, primary_key=True)
    ano_residencia: Mapped[Optional[str]] = mapped_column(String(2))

    atendimento: Mapped[list['Atendimento']] = relationship('Atendimento', back_populates='residente')
    escala: Mapped[list['Escala']] = relationship('Escala', back_populates='residente')