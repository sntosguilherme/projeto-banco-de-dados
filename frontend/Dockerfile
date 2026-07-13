# Alpine foi escolhida por ser uma imagem leve.
FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de pacotes para instalar as dependências primeiro
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Define a variável de ambiente HOSTNAME para que o Next.js escute em todas as interfaces de rede.
ENV HOSTNAME="0.0.0.0"

# Expõe a porta do servidor de desenvolvimento do Next.js.
EXPOSE 3000

# Rodando em modo de desenvolvimento.
CMD ["npm", "run", "dev"]