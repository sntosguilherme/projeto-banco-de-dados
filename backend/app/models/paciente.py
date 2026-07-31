from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

# Tabela de associação N:N entre Paciente e Alergia
paciente_alergia = Table(
    "paciente_alergia",
    Base.metadata,
    Column("id_pessoa", Integer, ForeignKey("pacientes.id_pessoa"), primary_key=True),
    Column("id_alergia", Integer, ForeignKey("alergias.id_alergia"), primary_key=True),
)


class Paciente(Base):
    __tablename__ = "pacientes"

    id_pessoa = Column(Integer, ForeignKey("pessoas.id_pessoa"), primary_key=True)
    num_convenio = Column(String)
    grupo_sanguineo = Column(String)

    pessoa = relationship("Pessoa", back_populates="paciente")
    alergias = relationship("Alergia", secondary=paciente_alergia)