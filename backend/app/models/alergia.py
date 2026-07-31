from sqlalchemy import Column, Integer, String
from app.database import Base

class Alergia(Base):
    __tablename__ = "alergias"

    id_alergia = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, nullable=False)