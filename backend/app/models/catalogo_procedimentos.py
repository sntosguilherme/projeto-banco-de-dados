from sqlalchemy import Column, Integer, String, Numeric
from app.database import Base

class CatalogoProcedimento(Base):
    __tablename__ = "catalogo_procedimentos"

    id_procedimento = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String)
    valor = Column(Numeric)
    # ajuste os campos conforme a estrutura real da tabela