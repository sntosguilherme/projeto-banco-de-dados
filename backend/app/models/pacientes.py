from typing import Optional

from sqlalchemy import CheckConstraint, ForeignKeyConstraint, Integer, PrimaryKeyConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .alergias import Alergia
from .base import Base
from .pessoas import Pessoa


class Paciente(Pessoa):
    __tablename__ = 'paciente'
    __table_args__ = (
        CheckConstraint("grupo_sanguineo::text = ANY (ARRAY['A+'::character varying, 'A-'::character varying, 'B+'::character varying, 'B-'::character varying, 'AB+'::character varying, 'AB-'::character varying, 'O+'::character varying, 'O-'::character varying]::text[])", name='paciente_grupo_sanguineo_check'),
        ForeignKeyConstraint(['id_pessoa'], ['pessoa.id_pessoa'], ondelete='CASCADE', name='paciente_id_pessoa_fkey'),
        PrimaryKeyConstraint('id_pessoa', name='paciente_pkey')
    )

    id_pessoa: Mapped[int] = mapped_column(Integer, primary_key=True)
    num_convenio: Mapped[Optional[str]] = mapped_column(String(50))
    grupo_sanguineo: Mapped[Optional[str]] = mapped_column(String(3))

    alergia: Mapped[list[Alergia]] = relationship('Alergia', secondary='paciente_alergia', back_populates='paciente')
    internacao: Mapped[list['Internacao']] = relationship('Internacao', back_populates='paciente')
    atendimento: Mapped[list['Atendimento']] = relationship('Atendimento', back_populates='paciente')