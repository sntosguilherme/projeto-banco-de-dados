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
