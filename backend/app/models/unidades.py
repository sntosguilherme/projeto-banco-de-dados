from sqlalchemy import CheckConstraint, Integer, PrimaryKeyConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Unidade(Base):
    __tablename__ = 'unidade'
    __table_args__ = (
        CheckConstraint('capacidade_leitos >= 0', name='unidade_capacidade_leitos_check'),
        PrimaryKeyConstraint('id_unidade', name='unidade_pkey')
    )

    id_unidade: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo: Mapped[str] = mapped_column(String(50), nullable=False)
    capacidade_leitos: Mapped[int] = mapped_column(Integer, nullable=False)

    internacao: Mapped[list['Internacao']] = relationship('Internacao', back_populates='unidade')
    escala: Mapped[list['Escala']] = relationship('Escala', back_populates='unidade')