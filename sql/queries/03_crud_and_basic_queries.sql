-- inserir_atendimento
-- Inserir um novo atendimento
-- Mapeamento CRUD: CREATE / Sugestão de Rota API: POST /atendimentos
INSERT INTO ATENDIMENTO (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor)
VALUES (%s, %s, %s, %s, %s);

-- listar_atendimentos
-- Listar todos os atendimentos de um paciente específico
-- Mapeamento CRUD: READ / Sugestão de Rota API: GET /pacientes/{id_paciente}/atendimentos
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
-- Mapeamento CRUD: READ / Sugestão de Rota API: GET /atendimentos/{id_atendimento}/procedimentos
SELECT 
    p.nome AS nome_procedimento,
    pr.quantidade,
    pr.tempo_real_minutos
FROM PROCEDIMENTO_REALIZADO pr
JOIN PROCEDIMENTO p ON pr.id_procedimento = p.id_procedimento
WHERE pr.id_atendimento = %s;

-- atualizar_paciente_convenio
-- Atualizar os dados de um paciente (convênio)
-- Mapeamento CRUD: UPDATE / Sugestão de Rota API: PATCH /pacientes/{id_paciente}
UPDATE PACIENTE
SET num_convenio = %s
WHERE id_pessoa = %s;

-- atualizar_paciente_alergias
-- Atualizar os dados de um paciente (alergias)
-- Mapeamento CRUD: UPDATE / Sugestão de Rota API: PATCH /pacientes/{id_paciente}
UPDATE PACIENTE
SET alergias = %s
WHERE id_pessoa = %s;

-- remover_procedimento
-- Remover um procedimento realizado
-- Mapeamento CRUD: DELETE / Sugestão de Rota API: DELETE /atendimentos/{id_atendimento}/procedimentos/{id_procedimento}
DELETE FROM PROCEDIMENTO_REALIZADO
WHERE id_atendimento = %s 
    AND id_procedimento = %s 
    AND faturado = FALSE;

-- tempo_medio_atendimento
-- Calcular o tempo médio de duração dos atendimentos por residente
-- Mapeamento CRUD: READ / Sugestão de Rota API: GET /residentes/metricas/tempo-medio-atendimento
SELECT 
    pes.nome AS nome_residente,
    r.ano_residencia,
    ROUND(AVG(a.duracao_minutos), 2) AS tempo_medio_atendimento
FROM ATENDIMENTO a
JOIN RESIDENTE r ON a.id_residente = r.id_profissional
JOIN PESSOA pes ON r.id_profissional = pes.id_pessoa
GROUP BY r.id_profissional, pes.nome, r.ano_residencia
ORDER BY tempo_medio_atendimento DESC;
