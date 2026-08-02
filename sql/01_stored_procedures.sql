-- sp_registrar_atendimento_completo
-- Recebe dados do atendimento e uma lista de procedimentos em JSON.
-- Insere tudo em uma transação (garantido pelo escopo da procedure no PostgreSQL).
CREATE OR REPLACE PROCEDURE sp_registrar_atendimento_completo(
    p_data_hora TIMESTAMP,
    p_duracao_minutos INT,
    p_id_paciente INT,
    p_id_residente INT,
    p_id_preceptor INT,
    p_procedimentos JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_atendimento INT;
    v_proc JSONB;
BEGIN
    INSERT INTO atendimento (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor)
    VALUES (p_data_hora, p_duracao_minutos, p_id_paciente, p_id_residente, p_id_preceptor)
    RETURNING id_atendimento INTO v_id_atendimento;

    FOR v_proc IN SELECT * FROM jsonb_array_elements(p_procedimentos)
    LOOP
        INSERT INTO procedimento_realizado (
            id_atendimento, 
            id_procedimento, 
            quantidade, 
            tempo_real_minutos, 
            faturado, 
            observacao,
            data_hora_inicio
        ) VALUES (
            v_id_atendimento,
            (v_proc->>'id_procedimento')::INT,
            (v_proc->>'quantidade')::INT,
            (v_proc->>'tempo_real_minutos')::INT,
            COALESCE((v_proc->>'faturado')::BOOLEAN, FALSE),
            v_proc->>'observacao',
            COALESCE((v_proc->>'data_hora_inicio')::TIMESTAMP, p_data_hora)
        );
    END LOOP;
END;
$$;

-- sp_calcular_tempo_medio_espera
-- Calcula para cada unidade o tempo médio entre a chegada do paciente (atendimento.data_hora)
-- e o início do primeiro procedimento (procedimento_realizado.data_hora_inicio).
CREATE OR REPLACE FUNCTION sp_calcular_tempo_medio_espera()
RETURNS TABLE (
    unidade VARCHAR,
    tempo_medio_espera_minutos NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH atendimento_unidade AS (
        SELECT
            a.id_atendimento,
            a.data_hora AS data_hora_chegada,
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
    ),
    primeiro_procedimento AS (
        SELECT 
            id_atendimento,
            MIN(data_hora_inicio) AS data_hora_inicio_primeiro
        FROM procedimento_realizado
        GROUP BY id_atendimento
    )
    SELECT 
        u.nome::VARCHAR AS unidade,
        ROUND(AVG(EXTRACT(EPOCH FROM (p.data_hora_inicio_primeiro - a.data_hora_chegada))/60)::NUMERIC, 2) AS tempo_medio_espera_minutos
    FROM atendimento_unidade a
    JOIN primeiro_procedimento p ON a.id_atendimento = p.id_atendimento
    JOIN unidade u ON a.id_unidade = u.id_unidade
    WHERE p.data_hora_inicio_primeiro IS NOT NULL
    GROUP BY u.nome;
END;
$$;

-- sp_reajustar_escala
-- Muda todas as escalas de um residente de um dia/turno para outro,
-- ignorando os casos em que a mudança causaria conflito (mesma unidade+dia+turno+residente).
CREATE OR REPLACE PROCEDURE sp_reajustar_escala(
    p_id_residente INT,
    p_dia_origem VARCHAR,
    p_turno_origem VARCHAR,
    p_dia_destino VARCHAR,
    p_turno_destino VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE escala e1
    SET dia_semana = p_dia_destino,
        turno = p_turno_destino
    WHERE e1.id_residente = p_id_residente
      AND e1.dia_semana = p_dia_origem
      AND e1.turno = p_turno_origem
      AND NOT EXISTS (
          SELECT 1 FROM escala e2
          WHERE e2.id_residente = p_id_residente
            AND e2.id_unidade = e1.id_unidade
            AND e2.dia_semana = p_dia_destino
            AND e2.turno = p_turno_destino
      );
END;
$$;
