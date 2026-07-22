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
    titulacao VARCHAR(50) NOT NULL,
    -- adicionado a coluna supervisao_ativa BOOLEAN NOT NULL DEFAULT TRUE
    supervisao_ativa BOOLEAN NOT NULL DEFAULT TRUE
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

-- adicionado a tabela INTERNACAO que se relaciona com PACIENTE e UNIDADE
CREATE TABLE INTERNACAO (
    id_internacao SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL REFERENCES PACIENTE(id_pessoa) ON DELETE CASCADE,
    id_unidade INT NOT NULL REFERENCES UNIDADE(id_unidade) ON DELETE CASCADE,
    data_hora_entrada TIMESTAMP NOT NULL,
    data_hora_saida TIMESTAMP
);

-- consulta a internação mais recente e filtra pela ausência de uma data de saída.
CREATE VIEW vw_pacientes_internados AS
SELECT 
    pe.nome AS paciente_nome,
    i.data_hora_entrada,
    u.nome AS unidade_internacao
FROM PACIENTE p
JOIN PESSOA pe ON p.id_pessoa = pe.id_pessoa
JOIN INTERNACAO i ON p.id_pessoa = i.id_paciente
JOIN UNIDADE u ON i.id_unidade = u.id_unidade
WHERE i.data_hora_saida IS NULL
  AND i.id_internacao = (
      SELECT id_internacao 
      FROM INTERNACAO i2 
      WHERE i2.id_paciente = p.id_pessoa 
      ORDER BY data_hora_entrada DESC 
      LIMIT 1
  );

-- cruza as escalas do residente com as do preceptor e checa se a titulação é diferente de "Doutor" ou se a supervisão está inativa.
-- a inserção dos dados preexistentes não será quebrada graças ao valor padrão (DEFAULT TRUE).
CREATE VIEW vw_residentes_sem_supervisor AS
SELECT DISTINCT
    pe_res.nome AS residente_nome,
    pe_prec.nome AS preceptor_nome,
    pr.titulacao AS preceptor_titulacao,
    pr.supervisao_ativa
FROM RESIDENTE r
JOIN PESSOA pe_res ON r.id_profissional = pe_res.id_pessoa
JOIN ESCALA e ON r.id_profissional = e.id_residente
JOIN PRECEPTOR pr ON e.id_preceptor = pr.id_profissional
JOIN PESSOA pe_prec ON pr.id_profissional = pe_prec.id_pessoa
WHERE pr.titulacao != 'Doutor' 
   OR pr.supervisao_ativa = FALSE;

-- mapeia os atendimentos em relação à sua respectiva unidade a partir da ESCALA 
-- (cruzando id_residente, id_preceptor e o dia da semana derivado da data_hora do atendimento)
-- em seguida, ela agrupa tudo por mês (usando TO_CHAR(data_hora, 'YYYY-MM')) e unidade
-- utilizado a função analítica MODE() WITHIN GROUP (ORDER BY p.nome) para obter facilmente o procedimento mais comum para aquele mês/unidade.
CREATE VIEW vw_estatisticas_atendimentos_mensal AS
WITH AtendimentoUnidade AS (
    SELECT 
        a.id_atendimento,
        a.data_hora,
        a.duracao_minutos,
        TO_CHAR(a.data_hora, 'YYYY-MM') AS mes,
        e.id_unidade
    FROM ATENDIMENTO a
    LEFT JOIN ESCALA e ON a.id_residente = e.id_residente 
        AND a.id_preceptor = e.id_preceptor
        AND (
            CASE EXTRACT(ISODOW FROM a.data_hora)
                WHEN 1 THEN 'Segunda'
                WHEN 2 THEN 'Terca'
                WHEN 3 THEN 'Quarta'
                WHEN 4 THEN 'Quinta'
                WHEN 5 THEN 'Sexta'
                WHEN 6 THEN 'Sabado'
                WHEN 7 THEN 'Domingo'
            END
        ) = e.dia_semana
)
SELECT 
    au.mes,
    u.nome AS unidade,
    COUNT(DISTINCT au.id_atendimento) AS total_atendimentos,
    ROUND(AVG(au.duracao_minutos), 2) AS media_duracao,
    MODE() WITHIN GROUP (ORDER BY p.nome) AS procedimento_mais_comum
FROM AtendimentoUnidade au
LEFT JOIN UNIDADE u ON au.id_unidade = u.id_unidade
LEFT JOIN PROCEDIMENTO_REALIZADO pr ON au.id_atendimento = pr.id_atendimento
LEFT JOIN PROCEDIMENTO p ON pr.id_procedimento = p.id_procedimento
GROUP BY au.mes, u.nome;
