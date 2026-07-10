-- ranking_residentes_atendimentos
-- 1) RANKING DOS RESIDENTES POR QTD DE ATENDIMENTOS
SELECT
    pessoa.nome AS residente,
    -- contando a coluna, e não usando * de propósito, pq COUNT ignora NULL
    -- e isso que faz o residente sem atendimento dar 0 em vez de dar erro
    COUNT(atendimento.id_atendimento) AS total_atendimentos
FROM RESIDENTE residente
    -- RESIDENTE só tem o id e o ano de residência, não tem nome nenhum
    -- então bora subir até PROFISSIONAL pra depois chegar no nome
    -- aqui em PROFISSIONAL o id se chama id_pessoa nas TABLES
    JOIN PROFISSIONAL profissional ON profissional.id_pessoa = residente.id_profissional
    -- PROFISSIONAL também não tem nome, só crm e especialidade
    -- o nome mesmo só mora lá em PESSOA
    JOIN PESSOA pessoa ON pessoa.id_pessoa = profissional.id_pessoa
    -- se fosse um JOIN normal, residente sem atendimento simplesmente
    -- sumiria do resultado, pq não teria nada do lado direito pra casar
    -- com LEFT JOIN a gente garante que o residente fica, só que com
    -- NULL no lugar do atendimento quando não tem nenhum
    LEFT JOIN ATENDIMENTO atendimento ON atendimento.id_residente = residente.id_profissional
-- cada residente vira um grupo
-- e o COUNT soma quantos atendimentos caíram dentro desse grupo
GROUP BY pessoa.nome
-- do que mais atendeu pro que menos
ORDER BY total_atendimentos DESC;

-- preceptores_mais_de_5_atendimentos_mes
-- 2) PRECEPTORES COM MAIS DE 5 ATENDIMENTOS NUM MÊS
SELECT
    p.nome AS preceptor,
    -- DATE_TRUNC corta a data e joga fora tudo exceto o mês
    -- tipo '2025-06-07 08:30:00' e '2025-06-10 15:20:00' viram os dois
    -- '2025-06-01 00:00:00'. sem isso cada atendimento cairia sozinho
    -- num grupo, pq o timestamp é único até o segundo
    -- e o COUNT nunca passaria de 1, ia ficar tudo bagunçado
    DATE_TRUNC('month', atendimento.data_hora) AS mes,
    COUNT(atendimento.id_atendimento) AS total_atendimentos
FROM ATENDIMENTO atendimento
    -- ATENDIMENTO.id_preceptor aponta pra PRECEPTOR.id_profissional
    JOIN PRECEPTOR pr ON pr.id_profissional = atendimento.id_preceptor
    -- em PROFISSIONAL o id é "id_pessoa", não "id_profissional"
    JOIN PROFISSIONAL profissional ON profissional.id_pessoa = pr.id_profissional
    JOIN PESSOA p ON p.id_pessoa = profissional.id_pessoa
-- agrupa por preceptor E por mês juntos, pq a regra é "mais de 5 no mês"
-- não no total geral. se agrupasse só por nome ia misturar todos
-- os meses juntos e a conta ia ficar errada
GROUP BY p.nome, DATE_TRUNC('month', atendimento.data_hora)
-- WHERE não deixa usar COUNT() dentro dele, o HAVING deixa
-- isso acontece pq o WHERE roda ANTES de agrupar 
-- então o COUNT ainda nem existe naquele momento
-- HAVING roda DEPOIS do GROUP BY, quando o COUNT já foi calculado,
-- por isso o filtro de quantidade tem que vir aqui
HAVING COUNT(atendimento.id_atendimento) > 5
ORDER BY mes, total_atendimentos DESC;

-- plantoes_por_residente_unidade
-- 3) PLANTÕES ESCALADOS POR RESIDENTE, POR UNIDADE
SELECT
    u.nome AS unidade,
    p.nome AS residente,
    -- isso aqui conta quantos plantões dentro das semanas fixos o residente tem
    -- nessa unidade, não quantas vezes ele realmente trabalhou lá num mes
    COUNT(e.id_escala) AS qtd_plantoes_semanais
FROM ESCALA e
    -- ESCALA.id_unidade -> UNIDADE.id_unidade
    JOIN UNIDADE u ON u.id_unidade = e.id_unidade
    -- ESCALA.id_residente aponta pra RESIDENTE.id_profissional, 
    -- que é o mesmo valor de PROFISSIONAL.id_pessoa 
    JOIN PROFISSIONAL prof ON prof.id_pessoa = e.id_residente
    JOIN PESSOA p ON p.id_pessoa = prof.id_pessoa
-- sem LEFT JOIN aqui porque só quero combinações unidade+residente
-- que existem de verdade na escala. não faz sentido mostrar tipo
-- "Centro Cirúrgico + Borges + 0" se isso nunca foi escalado
GROUP BY u.nome, p.nome
ORDER BY u.nome, qtd_plantoes_semanais DESC;

-- pacientes_sem_procedimento_alto_risco
-- 4) PACIENTES QUE NUNCA FIZERAM PROCEDIMENTO DE RISCO 'ALTO'
SELECT p.nome AS paciente
FROM PACIENTE pac
    -- aqui PACIENTE.id_pessoa bate direto com PESSOA.id_pessoa
    JOIN PESSOA p ON p.id_pessoa = pac.id_pessoa
WHERE pac.id_pessoa NOT IN (
    -- essa subquery roda sozinha, uma vez só, e devolve uma LISTA de ids
    SELECT a.id_paciente
    FROM ATENDIMENTO a
        -- PROCEDIMENTO_REALIZADO é a tabela que liga atendimento com
        -- procedimento (um atendimento pode ter vários procedimentos e
        -- vice versa), por isso precisa passar por ela pra chegar no nivel_risco
        JOIN PROCEDIMENTO_REALIZADO pre ON pre.id_atendimento = a.id_atendimento
        -- nivel_risco só existe lá em PROCEDIMENTO mesmo
        JOIN PROCEDIMENTO proc ON proc.id_procedimento = pre.id_procedimento
    WHERE proc.nivel_risco = 'ALTO'
    -- essa lista pode vir com id repetido (exemplo se a alguém fez 2
    -- procedimentos ALTO, o id dela aparece 2 vezes na lista), mas isso
    -- não atrapalha em nada
)
-- pra cada paciente, o banco testa - seu id tá dentro dessa listona
-- de quem já fez ALTO? se tiver, ele é excluído - IN virando falso
-- se não tiver, ele entra no resultado - NOT IN logo vira verdadeiro

-- o NOT IN se a lista de dentro viesse com algum
-- valor NULL no meio, o NOT IN inteiro quebra e a query
-- devolve 0 linhas pra todos
-- isso não acontece aqui porque no CREATE TABLE o ATENDIMENTO.id_paciente
-- é NOT NULL - o banco nunca deixa ter um atendimento sem paciente, então
-- essa lista nunca vai ter NULL e o NOT IN não vai quebrar
ORDER BY p.nome;