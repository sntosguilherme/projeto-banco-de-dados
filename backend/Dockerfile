FROM python:3.12-slim

# Evita que o Python escreva arquivos .pyc no container
ENV PYTHONDONTWRITEBYTECODE=1

# Garante que os logs do FastAPI/Uvicorn apareçam em tempo real no terminal
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instala as dependências do sistema necessárias para compilar o psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia primeiro apenas o arquivo de dependências (otimiza o cache do Docker)
COPY requirements.txt .

# Instala as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante dos arquivos da pasta backend para dentro do container
COPY . .

# Expõe a porta padrão que o FastAPI vai rodar
EXPOSE 8000

# Comando para rodar a API em modo de desenvolvimento (com live-reload ativo)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]