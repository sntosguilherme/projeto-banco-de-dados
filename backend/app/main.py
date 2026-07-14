# Ponto de entrada da API

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_db_connection
from app.routers import pacientes, atendimentos, procedimentos, relatorios, health, profissionais,residentes


# Criação da instância do FastAPI com o título "Sistema Hospitalar Dra. Yuska Maritan Brito".
app = FastAPI(title="Sistema Hospitalar Dra. Yuska Maritan Brito")

# configuração do middleware CORS para permitir solicitações apenas do frontend em http://localhost:3000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permite solicitações apenas do frontend em http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#registra as rotas de cada arquivo do routers/ na aplicação
app.include_router(pacientes.router)
app.include_router(atendimentos.router)
app.include_router(procedimentos.router)
app.include_router(relatorios.router)
app.include_router(health.router)  
app.include_router(profissionais.router)
app.include_router(residentes.router)  
