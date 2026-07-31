from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ProcedimentoRealizado(Base):
    __tablename__ = "procedimento_realizado"

    id_atendimento = Column(Integer, ForeignKey("atendimentos.id_atendimento"), primary_key=True)
    id_procedimento = Column(Integer, ForeignKey("catalogo_procedimentos.id_procedimento"), primary_key=True)
    quantidade = Column(Integer, nullable=False)
    tempo_real_minutos = Column(Integer, nullable=False)
    observacao = Column(String)

    atendimento = relationship("Atendimento")
    procedimento = relationship("CatalogoProcedimento")