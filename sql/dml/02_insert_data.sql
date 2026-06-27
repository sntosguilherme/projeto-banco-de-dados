-- Distribuição
--   Residentes:  Guimas, Borges, Zé Freire, Mikael, Matheus        (ids 1-5)
--   Preceptores: Beca, Galego, Lara, Mark, Yuri Cavalcante         (ids 6-10)
--   Pacientes:   Hugo, Pedrão, Ruan, Carol, Marcelo, Ju, Anna, Yan,
--                David, Mathes (também paciente), extra             (ids 11-20)


-- PESSOA
INSERT INTO PESSOA (nome, cpf, data_nascimento, is_flamengo, telefone) VALUES
-- Residentes
('Guimas',              '021.345.678-90', '1998-03-12', TRUE,  '(83) 91111-0001'),
('Borges',              '032.456.789-01', '1997-11-25', FALSE, '(83) 92222-0002'),
('Zé Freire',           '043.567.890-12', '1999-06-08', TRUE,  '(83) 93333-0003'),
('Mikael Menezes',      '054.678.901-23', '1998-09-17', FALSE, '(83) 94444-0004'),
('Matheus',             '065.789.012-34', '2000-01-30', TRUE,  '(83) 95555-0005'),
-- Preceptores
('Beca',                '076.890.123-45', '1985-04-22', TRUE,  '(83) 96666-0006'),
('Galego',              '087.901.234-56', '1983-07-14', TRUE,  '(83) 97777-0007'),
('Lara Poggers',        '098.012.345-67', '1987-02-19', FALSE, '(83) 98888-0008'),
('Mark',                '109.123.456-78', '1980-10-05', FALSE, '(83) 99999-0009'),
('Yuri Cavalcante',     '210.234.567-89', '1982-08-28', TRUE,  '(83) 90000-0010'),
-- Pacientes
('Hugo Poggers',        '321.345.678-90', '2001-05-11', TRUE,  '(83) 91111-0011'),
('Pedrão',              '432.456.789-01', '1999-12-03', TRUE,  '(83) 92222-0012'),
('Ruan',                '543.567.890-12', '2000-07-22', TRUE,  '(83) 93333-0013'),
('Carol Camilo',        '654.678.901-23', '1998-04-16', TRUE,  '(83) 94444-0014'),
('Marcelo Iury',        '765.789.012-34', '1997-09-09', FALSE, '(83) 95555-0015'),
('Ju Lindo',            '876.890.123-45', '2001-03-27', FALSE, '(83) 96666-0016'),
('Anna Livia Cavalcante','987.901.234-56','2000-11-14', FALSE, '(83) 97777-0017'),
('Yan',                 '198.012.345-67', '2002-01-08', TRUE,  '(83) 98888-0018'),
('David Lopes',         '209.123.456-78', '1999-06-30', FALSE, '(83) 99999-0019'),
('Bruno Freire',        '310.234.567-89', '2001-08-18', TRUE,  '(83) 90000-0020');
-- PROFISSIONAL (residentes ids 1-5, preceptores ids 6-10)
INSERT INTO PROFISSIONAL (id_pessoa, crm, data_admissao, especialidade) VALUES
(1,  'CRM-PB-1', '2023-02-01', 'Clínica Médica'),
(2,  'CRM-PB-2', '2023-02-01', 'Cirurgia Geral'),
(3,  'CRM-PB-3', '2023-03-01', 'Cirurgia Geral'),
(4,  'CRM-PB-4', '2023-02-15', 'Cardiologia'),
(5,  'CRM-PB-5', '2023-03-15', 'Neurologia'),
(6,  'CRM-PB-6', '2015-06-10', 'Clínica Médica'),
(7,  'CRM-PB-7', '2013-08-20', 'Clínica Médica'),
(8,  'CRM-PB-8', '2016-01-05', 'Cirurgia Geral'),
(9,  'CRM-PB-9', '2010-11-30', 'Cardiologia'),
(10, 'CRM-PB-10', '2012-04-15', 'Neurologia');
-- RESIDENTE
INSERT INTO RESIDENTE (id_profissional, ano_residencia) VALUES
(1, 'R2'),  -- Guimas
(2, 'R1'),  -- Borges
(3, 'R3'),  -- Zé Freire
(4, 'R1'),  -- Mikael
(5, 'R2');  -- Mathes
-- PRECEPTOR
INSERT INTO PRECEPTOR (id_profissional, titulacao) VALUES
(6,  'Doutor'), -- Beca
(7,  'Mestre'), -- Galego
(8,  'Especialista'), -- Lara
(9,  'Doutor'), -- Mark
(10, 'Mestre'); -- Yuri Cavalcante
-- PACIENTE
INSERT INTO PACIENTE (id_pessoa, num_convenio, alergias, grupo_sanguineo) VALUES
(11, 'UNIMED-1',    'Dipirona',                          'O+'),
(12, 'BRADESCO-1',   NULL,                               'A+'),
(13, NULL,          'Penicilina, Látex',                 'B-'),
(14, 'AMIL-1',       NULL,                               'AB+'),
(15, 'UNIMED-2',     NULL,                               'O-'),
(16, NULL,          'Ser feio',                          'A-'), 
(17, 'SULAMERICA-1', NULL,                               'B+'),
(18, 'BRADESCO-2',  'Amoxicilina',                       'O+'),
(19, NULL,          'Segunda-Feira',                     'A+'),
(20, 'AMIL-1',      'Segunda-Feira',                     'AB-');




-- UNIDADE
INSERT INTO UNIDADE (nome, tipo, capacidade_leitos) VALUES
('UTI Adulto', 'UTI', 10),
('Enfermaria', 'Enfermaria', 30),
('Pronto-Socorro', 'Emergência', 12),
('Ala de Cardiologia', 'Ala Especializada', 8),
('Centro Cirúrgico', 'Cirurgia', 5);




-- PROCEDIMENTO
INSERT INTO PROCEDIMENTO (codigo, nome, tempo_medio_minutos, nivel_risco) VALUES
('PROC-001', 'Raio-X de tórax', 15, 'BAIXO'),
('PROC-002', 'Medição de pressão arterial', 5, 'BAIXO'),
('PROC-003', 'Curativo simples', 10, 'BAIXO'),
('PROC-004', 'Coleta de sangue', 8, 'BAIXO'),
('PROC-005', 'Sutura de ferida', 25, 'MEDIO'),
('PROC-006', 'Sonda urinária', 20, 'MEDIO'),
('PROC-007', 'Eletrocardiograma', 10, 'MEDIO'),
('PROC-008', 'Tomografia computadorizada', 30, 'ALTO'),
('PROC-009', 'Intubação', 20, 'ALTO'),
('PROC-010', 'Desfibrilação', 15, 'ALTO'),
('PROC-011', 'Aplicação de band-aid com sopro', 3, 'BAIXO'),
('PROC-012', 'Medição de temperatura no sovaco', 5, 'BAIXO');
-- ATENDIMENTO
INSERT INTO ATENDIMENTO (data_hora, duracao_minutos, id_paciente, id_residente, id_preceptor) VALUES
('2025-06-01 08:00:00', 45, 11, 1, 6), -- (PAC) Hugo / (RES) Guimas / (PRE) Beca
('2025-06-02 10:30:00', 60, 12, 2, 7), -- (PAC) Pedrão / (RES) Borges / (PRE) Galego
('2025-06-03 14:00:00', 30, 13, 3, 8), -- (PAC) Ruan / (RES) Zé / (PRE) Lara
('2025-06-04 09:15:00', 90, 14, 4, 9), -- (PAC) Carol / (RES) Mikael / (PRE) Mark
('2025-06-05 11:00:00', 50, 15, 5, 10), -- (PAC) Marcelo / (RES) Matheus / (PRE) Yuri
('2025-06-06 16:45:00', 35, 16, 1, 7), -- (PAC) Ju / (RES) Guimas / (PRE) Galego
('2025-06-07 08:30:00', 120, 17, 2, 6), -- (PAC) Anna / (RES) Borges / (PRE) Beca
('2025-06-08 13:00:00', 25, 18, 3, 10), -- (PAC) Yan / (RES) Zé / (PRE) Yuri
('2025-06-09 07:45:00', 75, 19, 4, 8), -- (PAC) David / (RES) Mikael / (PRE) Lara
('2025-06-10 15:20:00', 40, 20, 5, 9); -- (PAC) Bruno / (RES) MatheUs / (PRE) Mark


-- PROCEDIMENTO REALIZADO
INSERT INTO PROCEDIMENTO_REALIZADO (id_atendimento, id_procedimento, quantidade, tempo_real_minutos, observacao, faturado) VALUES
(1, 5, 1, 28, 'Sutura na mão direita, 4 pontos', FALSE),
(1, 4, 1, 8, 'Coleta de sangue pré-sutura', TRUE),
(2, 1, 1, 12, NULL, FALSE),
(3, 9, 1, 22, 'Intubação de urgência, paciente agitado', FALSE),
(4, 7, 1, 10, NULL, FALSE),
(4, 8, 1, 35, 'TC do crânio', FALSE),
(5, 6, 1, 14, 'Sondagem de alívio', TRUE),
(6, 3, 1, 10, NULL, FALSE),
(7, 10, 1, 18, 'Desfibrilação', FALSE),
(7, 9, 1, 20, 'Intubação pós-desfibrilação', FALSE),
(8, 2, 1, 5, NULL, TRUE),
(9, 11, 1, 4, 'Band-aid no dedão com direito a sopro', FALSE),
(10, 12, 1, 6, 'Termômetro quebrou no meio', FALSE);


-- ESCALA
INSERT INTO ESCALA (id_unidade, dia_semana, turno, id_residente, id_preceptor) VALUES
-- UTI Adulto
(1, 'Segunda', 'Manha', 1, 6),
(1, 'Terca', 'Noite', 2, 6),
(1, 'Quarta', 'Tarde', 3, 8),
(1, 'Quinta', 'Manha', 4, 9),
(1, 'Sexta', 'Noite', 5, 10),
-- Enfermaria
(2, 'Segunda', 'Tarde', 2, 7),
(2, 'Terca', 'Manha', 4, 6),
(2, 'Quarta', 'Noite', 1, 8),
(2, 'Sabado', 'Manha', 3, 9),
-- Pronto-Socorro
(3, 'Segunda', 'Manha', 5, 10),
(3, 'Terca', 'Tarde', 1, 7),
(3, 'Quinta', 'Noite', 2, 9),
(3, 'Sabado', 'Tarde', 4, 8),
(3, 'Domingo', 'Manha', 3, 6),
-- Ala de Cardiologia
(4, 'Segunda', 'Manha', 3, 9),
(4, 'Quarta', 'Tarde', 5, 7),
(4, 'Sexta', 'Noite', 2, 10),
(4, 'Sabado', 'Manha', 1, 8),
-- Centro Cirúrgico
(5, 'Terca', 'Manha', 4, 6),
(5, 'Quarta', 'Manha', 1, 9),
(5, 'Quinta', 'Tarde', 5, 8),
(5, 'Sexta', 'Manha', 3, 7);