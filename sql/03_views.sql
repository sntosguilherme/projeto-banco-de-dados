-- Views do projeto hospitalar
-- PostgreSQL 16+

-- 1. vw_pacientes_internados
-- Retorna os pacientes que estão atualmente internados (data_hora_saida IS NULL na internação mais recente).
CREATE OR REPLACE VIEW vw_pacientes_internados AS
SELECT
    pe.nome AS paciente_nome,
    i.data_hora_entrada,
    u.nome AS unidade_internacao
FROM paciente p
JOIN pessoa pe ON p.id_pessoa = pe.id_pessoa
JOIN internacao i ON p.id_pessoa = i.id_paciente
JOIN unidade u ON i.id_unidade = u.id_unidade
WHERE i.data_hora_saida IS NULL
  AND i.id_internacao = (
      SELECT i2.id_internacao
      FROM internacao i2
      WHERE i2.id_paciente = p.id_pessoa
      ORDER BY i2.data_hora_entrada DESC
      LIMIT 1
  );

-- 2. vw_residentes_sem_supervisor
-- Retorna residentes escalados em plantões mas cujo preceptor não tem titulação de doutor ou não possui supervisão ativa.
CREATE OR REPLACE VIEW vw_residentes_sem_supervisor AS
SELECT DISTINCT
    pe_res.nome AS residente_nome,
    pe_prec.nome AS preceptor_nome,
    pr.titulacao AS preceptor_titulacao,
    pr.supervisao_ativa
FROM residente r
JOIN pessoa pe_res ON r.id_profissional = pe_res.id_pessoa
JOIN escala e ON r.id_profissional = e.id_residente
JOIN preceptor pr ON e.id_preceptor = pr.id_profissional
JOIN pessoa pe_prec ON pr.id_profissional = pe_prec.id_pessoa
WHERE pr.titulacao != 'Doutor'
   OR pr.supervisao_ativa = FALSE;

-- 3. vw_estatisticas_atendimentos_mensal
-- Agregação por mês e por unidade: total de atendimentos, média de duração e procedimentos mais comuns.
CREATE OR REPLACE VIEW vw_estatisticas_atendimentos_mensal AS
WITH atendimento_unidade AS (
    SELECT
        a.id_atendimento,
        a.data_hora,
        a.duracao_minutos,
        TO_CHAR(a.data_hora, 'YYYY-MM') AS mes,
        e.id_unidade
    FROM atendimento a
    LEFT JOIN escala e
      ON a.id_residente = e.id_residente
     AND a.id_preceptor = e.id_preceptor
     AND CASE EXTRACT(ISODOW FROM a.data_hora)
            WHEN 1 THEN 'Segunda'
            WHEN 2 THEN 'Terca'
            WHEN 3 THEN 'Quarta'
            WHEN 4 THEN 'Quinta'
            WHEN 5 THEN 'Sexta'
            WHEN 6 THEN 'Sabado'
            WHEN 7 THEN 'Domingo'
         END = e.dia_semana
)
SELECT
    au.mes,
    u.nome AS unidade,
    COUNT(DISTINCT au.id_atendimento) AS total_atendimentos,
    ROUND(AVG(au.duracao_minutos), 2) AS media_duracao,
    MODE() WITHIN GROUP (ORDER BY p.nome) AS procedimento_mais_comum
FROM atendimento_unidade au
LEFT JOIN unidade u ON au.id_unidade = u.id_unidade
LEFT JOIN procedimento_realizado pr
  ON au.id_atendimento = pr.id_atendimento
LEFT JOIN procedimento p ON pr.id_procedimento = p.id_procedimento
GROUP BY au.mes, u.nome;
