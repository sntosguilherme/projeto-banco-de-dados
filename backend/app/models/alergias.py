from sqlalchemy import Integer, PrimaryKeyConstraint, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Alergia(Base):
    __tablename__ = 'alergia'
    __table_args__ = (
        PrimaryKeyConstraint('id_alergia', name='alergia_pkey'),
        UniqueConstraint('nome', name='alergia_nome_key')
    )

    id_alergia: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)

    paciente: Mapped[list['Paciente']] = relationship('Paciente', secondary='paciente_alergia', back_populates='alergia')