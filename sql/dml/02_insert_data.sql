-- mínimo: 5 pacientes, 5 residentes, 5 preceptores, 3 unidades, 10 atendimentos, 10 procedimentos realizados

INSERT INTO PESSOA (nome, cpf, data_nascimento, is_flamengo, telefone) VALUES
-- TODO

INSERT INTO PACIENTE (id_pessoa, num_convenio, alergias, grupo_sanguineo) VALUES
-- TODO

INSERT INTO PROFISSIONAL (id_pessoa, crm, data_admissao, especialidade) VALUES
-- TODO

INSERT INTO RESIDENTE (id_profissional, ano_residencia) VALUES
-- TODO

INSERT INTO PRECEPTOR (id_profissional, titulacao) VALUES
-- TODO

INSERT INTO UNIDADE (nome, tipo, capacidade_leitos) VALUES
-- TODO

INSERT INTO PROCEDIMENTO (codigo, nome, tempo_medio_minutos, nivel_risco) VALUES
-- TODO

INSERT INTO ATENDIMENTO (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor) VALUES
-- TODO

INSERT INTO PROCEDIMENTO_REALIZADO (id_atendimento, id_procedimento, quantidade, tempo_real_minutos, observacao, faturado) VALUES
-- TODO

INSERT INTO ESCALA (id_unidade, dia_semana, turno, id_residente, id_preceptor) VALUES
-- TODO
