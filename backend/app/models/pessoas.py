import datetime
from typing import Optional

from sqlalchemy import Boolean, CheckConstraint, Date, Integer, PrimaryKeyConstraint, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Pessoa(Base):
    __tablename__ = 'pessoa'
    __table_args__ = (
        CheckConstraint("cpf::text ~ '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$'::text", name='pessoa_cpf_check'),
        CheckConstraint("data_nascimento >= '1900-01-01'::date AND data_nascimento <= CURRENT_DATE", name='pessoa_data_nascimento_check'),
        CheckConstraint("telefone::text ~ '^\\(\\d{2}\\) \\d{5}-\\d{4}$'::text", name='pessoa_telefone_check'),
        PrimaryKeyConstraint('id_pessoa', name='pessoa_pkey'),
        UniqueConstraint('cpf', name='pessoa_cpf_key')
    )

    id_pessoa: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    cpf: Mapped[str] = mapped_column(String(14), nullable=False)
    data_nascimento: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    is_flamengo: Mapped[bool] = mapped_column(Boolean, nullable=False)
    telefone: Mapped[Optional[str]] = mapped_column(String(15))