CREATE TABLE PESSOA (
    id_pessoa SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$'),
    data_nascimento DATE NOT NULL CHECK (data_nascimento >= '1900-01-01' AND data_nascimento <= CURRENT_DATE),
    is_flamengo BOOLEAN NOT NULL,
    telefone VARCHAR(15) CHECK (telefone ~ '^\(\d{2}\) \d{5}-\d{4}$')
);

CREATE TABLE ALERGIA (
    id_alergia SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE PACIENTE (
    id_pessoa INT PRIMARY KEY REFERENCES PESSOA(id_pessoa) ON DELETE CASCADE,
    num_convenio VARCHAR(50),
    grupo_sanguineo VARCHAR(3) CHECK (grupo_sanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'))
);

CREATE TABLE PACIENTE_ALERGIA (
    id_pessoa INT NOT NULL REFERENCES PACIENTE(id_pessoa) ON DELETE CASCADE,
    id_alergia INT NOT NULL REFERENCES ALERGIA(id_alergia) ON DELETE CASCADE,
    PRIMARY KEY (id_pessoa, id_alergia)
);

CREATE TABLE PROFISSIONAL (
    id_pessoa INT PRIMARY KEY REFERENCES PESSOA(id_pessoa) ON DELETE CASCADE,
    crm VARCHAR(20) UNIQUE NOT NULL,
    data_admissao DATE NOT NULL,
    especialidade VARCHAR(50) NOT NULL
);

CREATE TABLE PRECEPTOR (
    id_profissional INT PRIMARY KEY REFERENCES PROFISSIONAL(id_pessoa) ON DELETE CASCADE,
    titulacao VARCHAR(50) NOT NULL
);

CREATE TABLE RESIDENTE (
    id_profissional INT PRIMARY KEY REFERENCES PROFISSIONAL(id_pessoa) ON DELETE CASCADE,
    ano_residencia VARCHAR(2) CHECK (ano_residencia IN ('R1', 'R2', 'R3'))
);

CREATE TABLE UNIDADE (
    id_unidade SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    capacidade_leitos INT NOT NULL CHECK (capacidade_leitos >= 0)
);

CREATE TABLE ATENDIMENTO (
    id_atendimento SERIAL PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL,
    duracao_minutos INT NOT NULL CHECK (duracao_minutos > 0),
    id_paciente INT NOT NULL REFERENCES PACIENTE(id_pessoa),
    id_residente INT NOT NULL REFERENCES RESIDENTE(id_profissional),
    id_preceptor INT NOT NULL REFERENCES PRECEPTOR(id_profissional)
);

CREATE TABLE PROCEDIMENTO (
    id_procedimento SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tempo_medio_minutos INT NOT NULL CHECK (tempo_medio_minutos > 0),
    nivel_risco VARCHAR(20) DEFAULT 'BAIXO' CHECK (nivel_risco IN ('BAIXO', 'MEDIO', 'ALTO'))
);

CREATE TABLE PROCEDIMENTO_REALIZADO (
    id_atendimento INT REFERENCES ATENDIMENTO(id_atendimento) ON DELETE CASCADE,
    id_procedimento INT REFERENCES PROCEDIMENTO(id_procedimento),
    quantidade INT NOT NULL CHECK (quantidade > 0),
    tempo_real_minutos INT NOT NULL CHECK (tempo_real_minutos > 0),
    observacao TEXT,
   faturado BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id_atendimento, id_procedimento)
);

CREATE TABLE ESCALA (
    id_escala SERIAL PRIMARY KEY,
    id_unidade INT NOT NULL REFERENCES UNIDADE(id_unidade),
    dia_semana VARCHAR(15) CHECK (dia_semana IN ('Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo')),
    turno VARCHAR(10) CHECK (turno IN ('Manha', 'Tarde', 'Noite')),
    id_residente INT NOT NULL REFERENCES RESIDENTE(id_profissional),
    id_preceptor INT NOT NULL REFERENCES PRECEPTOR(id_profissional),
    CONSTRAINT unique_escala_residente UNIQUE (id_unidade, dia_semana, turno, id_residente)
);
