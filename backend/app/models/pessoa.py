from sqlalchemy import Column, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Pessoa(Base):
    __tablename__ = "pessoas"

    id_pessoa = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    cpf = Column(String, unique=True, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    is_flamengo = Column(Boolean, default=False)
    telefone = Column(String)

    paciente = relationship("Paciente", back_populates="pessoa", uselist=False)