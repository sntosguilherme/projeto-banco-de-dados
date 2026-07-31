from sqlalchemy import Column, Integer, DateTime, ForeignKey
from app.database import Base

class Atendimento(Base):
    __tablename__ = "atendimentos"

    id_atendimento = Column(Integer, primary_key=True, index=True)
    data_hora = Column(DateTime, nullable=False)
    duracao_minutos = Column(Integer, nullable=False)
    id_paciente = Column(Integer, ForeignKey("pacientes.id_paciente"), nullable=False)
    id_residente = Column(Integer, ForeignKey("residentes.id_residente"), nullable=False)
    id_preceptor = Column(Integer, ForeignKey("preceptores.id_preceptor"), nullable=False)