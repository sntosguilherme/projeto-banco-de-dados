
-- atualizar_paciente_convenio
-- Atualizar os dados de um paciente (convênio)
-- Mapeamento CRUD: UPDATE / Rota API: PATCH /pacientes/{id_paciente}
UPDATE PACIENTE
SET num_convenio = %s
WHERE id_pessoa = %s;


-- inserir_atendimento
-- Inserir um novo atendimento
-- Mapeamento CRUD: CREATE / Rota API: POST /atendimentos
INSERT INTO ATENDIMENTO (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor)
VALUES (%s, %s, %s, %s, %s)
RETURNING id_atendimento;

-- inserir_profissional
-- Inserir dados específicos de um profissional (requer id_pessoa)
-- Mapeamento CRUD: CREATE
INSERT INTO PROFISSIONAL (id_pessoa, crm, data_admissao, especialidade)
VALUES (%s, %s, %s, %s);

-- inserir_residente
-- Inserir dados de residente (requer id_profissional)
-- Mapeamento CRUD: CREATE
INSERT INTO RESIDENTE (id_profissional, ano_residencia)
VALUES (%s, %s);

-- inserir_preceptor
-- Inserir dados de preceptor (requer id_profissional)
-- Mapeamento CRUD: CREATE
INSERT INTO PRECEPTOR (id_profissional, titulacao)
VALUES (%s, %s);

-- inserir_pessoa
-- Inserir dados básicos de uma pessoa -> usado antes de inserir paciente/profissional
-- Mapeamento CRUD: CREATE
INSERT INTO PESSOA (nome, cpf, data_nascimento, is_flamengo, telefone)
VALUES (%s, %s, %s, %s, %s)
RETURNING id_pessoa;

-- inserir_paciente
-- Inserir dados específicos de um paciente requer id_pessoa
-- Mapeamento CRUD: CREATE
INSERT INTO PACIENTE (id_pessoa, num_convenio, grupo_sanguineo)
VALUES (%s, %s, %s);

-- inserir_paciente_alergia
-- Inserir uma alergia para um paciente (requer id_pessoa e id_alergia)
-- Mapeamento CRUD: CREATE
INSERT INTO PACIENTE_ALERGIA (id_pessoa, id_alergia)
VALUES (%s, %s)
ON CONFLICT DO NOTHING;

-- inserir_alergia
-- Inserir uma nova alergia no sistema
-- Mapeamento CRUD: CREATE
INSERT INTO ALERGIA (nome)
VALUES (%s)
ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
RETURNING id_alergia;

-- listar_atendimentos
-- Listar todos os atendimentos de um paciente específico
-- Mapeamento CRUD: READ / Rota API: GET /pacientes/{id_paciente}/atendimentos
SELECT 
    a.id_atendimento,
    a.data_hora,
    a.duracao_minutos,
    p.nome AS nome_paciente,
    r.nome AS nome_residente,
    pr.nome AS nome_preceptor
FROM ATENDIMENTO a
JOIN PESSOA p ON a.id_paciente = p.id_pessoa
JOIN PESSOA r ON a.id_residente = r.id_pessoa
JOIN PESSOA pr ON a.id_preceptor = pr.id_pessoa
WHERE a.id_paciente = %s
ORDER BY a.data_hora DESC;

-- listar_procedimentos
-- Listar os procedimentos realizados em um atendimento
-- Mapeamento CRUD: READ / Rota API: GET /atendimentos/{id_atendimento}/procedimentos
SELECT 
    pr.id_procedimento,
    p.nome AS nome_procedimento,
    pr.quantidade,
    pr.tempo_real_minutos,
    pr.observacao,
    pr.faturado
FROM PROCEDIMENTO_REALIZADO pr
JOIN PROCEDIMENTO p ON pr.id_procedimento = p.id_procedimento
WHERE pr.id_atendimento = %s;

-- remover_procedimento
-- Remover um procedimento realizado
-- Mapeamento CRUD: DELETE / Rota API: DELETE /atendimentos/{id_atendimento}/procedimentos/{id_procedimento}
DELETE FROM PROCEDIMENTO_REALIZADO
WHERE id_atendimento = %s 
    AND id_procedimento = %s 
    AND faturado = FALSE;

-- tempo_medio_atendimento
-- Calcular o tempo médio de duração dos atendimentos por residente
-- Mapeamento CRUD: READ / Rota API: GET /residentes/metricas/tempo-medio-atendimento
SELECT 
    pes.nome AS nome_residente,
    r.ano_residencia,
    ROUND(AVG(a.duracao_minutos), 2) AS tempo_medio_atendimento
FROM ATENDIMENTO a
JOIN RESIDENTE r ON a.id_residente = r.id_profissional
JOIN PESSOA pes ON r.id_profissional = pes.id_pessoa
GROUP BY r.id_profissional, pes.nome, r.ano_residencia
ORDER BY tempo_medio_atendimento DESC;


-- listar_pacientes
-- Listar todos os pacientes cadastrados com seus dados básicos
-- Mapeamento CRUD: READ / Rota API: GET /pacientes
SELECT 
    pes.id_pessoa,
    pes.nome,
    pes.cpf,
    pac.num_convenio,
    pac.grupo_sanguineo,
    COALESCE(STRING_AGG(a.nome, ', '), '') AS alergias -- Listar alergias do paciente, separadas por vírgula
FROM PACIENTE pac
JOIN PESSOA pes ON pac.id_pessoa = pes.id_pessoa
LEFT JOIN PACIENTE_ALERGIA pa ON pa.id_pessoa = pac.id_pessoa
LEFT JOIN ALERGIA a ON a.id_alergia = pa.id_alergia
GROUP BY
    pes.id_pessoa,
    pes.nome,
    pes.cpf,
    pac.num_convenio,
    pac.grupo_sanguineo
ORDER BY pes.nome ASC;


-- listar_profissionais
-- Listar todos os profissionais, indicando papel e dados específicos
-- Mapeamento CRUD: READ / Rota API: GET /profissionais
SELECT 
    pes.id_pessoa,
    pes.nome,
    prof.crm,
    prof.especialidade,
    CASE 
        WHEN res.id_profissional IS NOT NULL THEN 'Residente'
        WHEN prec.id_profissional IS NOT NULL THEN 'Preceptor'
    END as papel,
    res.ano_residencia,
    prec.titulacao
FROM PROFISSIONAL prof
JOIN PESSOA pes ON prof.id_pessoa = pes.id_pessoa
LEFT JOIN RESIDENTE res ON prof.id_pessoa = res.id_profissional
LEFT JOIN PRECEPTOR prec ON prof.id_pessoa = prec.id_profissional
ORDER BY pes.nome ASC;

-- verificar_atendimento_existe
-- Mapeamento CRUD: READ / Uso: Validar se um atendimento existe antes de realizar ações dependentes
SELECT id_atendimento, duracao_minutos FROM ATENDIMENTO WHERE id_atendimento = %s;

-- verificar_procedimento_existe
-- Verificar se o procedimento especificado existe
-- Mapeamento CRUD: READ
SELECT 1 FROM PROCEDIMENTO WHERE id_procedimento = %s;

-- inserir_procedimento_realizado
-- Inserir um procedimento realizado em um atendimento e retorna os dados recem criados
-- Mapeamento CRUD: CREATE / Rota API: POST /atendimentos/{id_atendimento}/procedimentos
INSERT INTO PROCEDIMENTO_REALIZADO (id_atendimento, id_procedimento, quantidade, tempo_real_minutos, observacao)
VALUES (%s, %s, %s, %s, %s)
RETURNING id_atendimento, id_procedimento, quantidade, tempo_real_minutos, observacao;

-- listar_historico_atendimentos
-- Listar o histórico completo de todos os atendimentos
-- Mapeamento CRUD: READ / Rota API: GET /atendimentos
SELECT
    a.id_atendimento,
    a.data_hora,
    a.duracao_minutos,
    p.nome AS nome_paciente,
    r.nome AS nome_residente,
    pr.nome AS nome_preceptor
FROM ATENDIMENTO a
JOIN PESSOA p ON a.id_paciente = p.id_pessoa
JOIN PESSOA r ON a.id_residente = r.id_pessoa
JOIN PESSOA pr ON a.id_preceptor = pr.id_pessoa
ORDER BY a.data_hora DESC;

-- listar_todos_procedimentos
-- Listar todos os procedimentos disponíveis no catálogo
-- Mapeamento CRUD: READ / Rota API: GET /procedimentos
SELECT id_procedimento, codigo, nome, tempo_medio_minutos, nivel_risco 
FROM PROCEDIMENTO 
ORDER BY nome ASC;

-- recalcular_duracao_atendimento
-- Mapeamento CRUD: UPDATE / Uso: Ao adicionar ou remover um procedimento
UPDATE ATENDIMENTO 
SET duracao_minutos = (
    SELECT COALESCE(SUM(tempo_real_minutos), 0) 
    FROM PROCEDIMENTO_REALIZADO 
    WHERE id_atendimento = %s
)
WHERE id_atendimento = %s;

-- obter_tempo_procedimento
SELECT tempo_real_minutos FROM PROCEDIMENTO_REALIZADO WHERE id_atendimento = %s AND id_procedimento = %s;

-- remover_alergias_paciente
DELETE FROM PACIENTE_ALERGIA WHERE id_pessoa = %s;