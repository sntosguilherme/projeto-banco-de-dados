"""Adiciona dados relacionados para enriquecer as visualizacoes.

Revision ID: 20260802_04
Revises: 20260802_03
Create Date: 2026-08-02
"""

from datetime import datetime, timedelta
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260802_04"
down_revision: Union[str, Sequence[str], None] = "20260802_03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


atendimento = sa.table(
    "atendimento",
    sa.column("data_hora", sa.DateTime),
    sa.column("duracao_minutos", sa.Integer),
    sa.column("id_paciente", sa.Integer),
    sa.column("id_residente", sa.Integer),
    sa.column("id_preceptor", sa.Integer),
)

internacao = sa.table(
    "internacao",
    sa.column("id_paciente", sa.Integer),
    sa.column("id_unidade", sa.Integer),
    sa.column("data_hora_entrada", sa.DateTime),
    sa.column("data_hora_saida", sa.DateTime),
)


# As combinacoes de residente, preceptor e dia da semana correspondem as escalas
# criadas no seed anterior. Assim, atendimentos aparecem vinculados a unidades nas
# views e no calculo de tempo medio de espera.
ATENDIMENTOS_BASE = [
    # Marco: preceptor 6, unidades 1 e 3.
    (datetime(2026, 3, 2, 8, 10), 1, 6),
    (datetime(2026, 3, 3, 19, 20), 2, 6),
    (datetime(2026, 3, 8, 9, 5), 3, 6),
    (datetime(2026, 3, 9, 8, 25), 1, 6),
    (datetime(2026, 3, 10, 19, 40), 2, 6),
    (datetime(2026, 3, 15, 9, 15), 3, 6),
    (datetime(2026, 3, 16, 8, 35), 1, 6),
    (datetime(2026, 3, 17, 20, 0), 2, 6),
    # Abril: preceptor 7, unidades 2, 3, 4 e 5.
    (datetime(2026, 4, 1, 14, 10), 5, 7),
    (datetime(2026, 4, 3, 8, 20), 3, 7),
    (datetime(2026, 4, 6, 14, 30), 2, 7),
    (datetime(2026, 4, 7, 15, 0), 1, 7),
    (datetime(2026, 4, 8, 14, 45), 5, 7),
    (datetime(2026, 4, 10, 8, 40), 3, 7),
    (datetime(2026, 4, 13, 15, 10), 2, 7),
    (datetime(2026, 4, 14, 15, 35), 1, 7),
    # Maio: preceptor 8, atendimentos distribuidos pelas cinco unidades.
    (datetime(2026, 5, 2, 14, 5), 4, 8),
    (datetime(2026, 5, 6, 14, 20), 3, 8),
    (datetime(2026, 5, 7, 15, 15), 5, 8),
    (datetime(2026, 5, 9, 14, 40), 4, 8),
    (datetime(2026, 5, 13, 14, 50), 3, 8),
    (datetime(2026, 5, 14, 15, 30), 5, 8),
    (datetime(2026, 5, 16, 8, 30), 1, 8),
    (datetime(2026, 5, 20, 20, 10), 1, 8),
    # Junho: preceptor 9, atendimentos distribuidos pelas cinco unidades.
    (datetime(2026, 6, 1, 8, 15), 3, 9),
    (datetime(2026, 6, 3, 9, 0), 1, 9),
    (datetime(2026, 6, 4, 8, 35), 4, 9),
    (datetime(2026, 6, 6, 9, 20), 3, 9),
    (datetime(2026, 6, 8, 8, 50), 3, 9),
    (datetime(2026, 6, 11, 8, 5), 4, 9),
    (datetime(2026, 6, 13, 9, 45), 3, 9),
    (datetime(2026, 6, 18, 19, 30), 2, 9),
    # Julho: preceptor 10, unidades 1, 3 e 4.
    (datetime(2026, 7, 3, 19, 10), 5, 10),
    (datetime(2026, 7, 6, 8, 10), 5, 10),
    (datetime(2026, 7, 10, 19, 35), 5, 10),
    (datetime(2026, 7, 13, 8, 30), 5, 10),
    (datetime(2026, 7, 17, 20, 0), 5, 10),
    (datetime(2026, 7, 20, 8, 45), 5, 10),
    (datetime(2026, 7, 24, 19, 20), 2, 10),
    (datetime(2026, 7, 31, 20, 10), 2, 10),
]

PACIENTES = tuple(range(11, 21))
DURACOES = (32, 45, 58, 71, 39, 84, 52, 66, 95, 43)
TEMPOS_PLANEJADOS = (15, 5, 10, 8, 25, 20, 10, 30, 20, 15, 3, 5)
VARIACOES_TEMPO = (-2, 1, 4, 0, 3, -1)
TEMPOS_ESPERA = (6, 11, 17, 24, 33, 15, 28, 9)

ATENDIMENTOS = [
    {
        "data_hora": data_hora,
        "duracao_minutos": DURACOES[indice % len(DURACOES)],
        "id_paciente": PACIENTES[indice % len(PACIENTES)],
        "id_residente": id_residente,
        "id_preceptor": id_preceptor,
    }
    for indice, (data_hora, id_residente, id_preceptor) in enumerate(
        ATENDIMENTOS_BASE
    )
]

INTERNACOES = [
    {
        "id_paciente": 11,
        "id_unidade": 1,
        "data_hora_entrada": datetime(2026, 7, 29, 21, 10),
        "data_hora_saida": None,
    },
    {
        "id_paciente": 13,
        "id_unidade": 2,
        "data_hora_entrada": datetime(2026, 7, 30, 10, 25),
        "data_hora_saida": None,
    },
    {
        "id_paciente": 16,
        "id_unidade": 4,
        "data_hora_entrada": datetime(2026, 7, 31, 16, 40),
        "data_hora_saida": None,
    },
    {
        "id_paciente": 18,
        "id_unidade": 5,
        "data_hora_entrada": datetime(2026, 8, 1, 7, 50),
        "data_hora_saida": None,
    },
    {
        "id_paciente": 20,
        "id_unidade": 3,
        "data_hora_entrada": datetime(2026, 8, 2, 6, 30),
        "data_hora_saida": None,
    },
    {
        "id_paciente": 12,
        "id_unidade": 1,
        "data_hora_entrada": datetime(2026, 6, 10, 18, 0),
        "data_hora_saida": datetime(2026, 6, 14, 11, 20),
    },
    {
        "id_paciente": 14,
        "id_unidade": 3,
        "data_hora_entrada": datetime(2026, 7, 15, 12, 15),
        "data_hora_saida": datetime(2026, 7, 15, 20, 45),
    },
    {
        "id_paciente": 17,
        "id_unidade": 4,
        "data_hora_entrada": datetime(2026, 7, 20, 9, 30),
        "data_hora_saida": datetime(2026, 7, 24, 14, 10),
    },
]

AUDITORIA_TEMPORARIA_DATA = datetime(2026, 7, 30, 23, 59, 30)


def _procedimentos_realizados() -> list[dict]:
    registros = []

    for indice, dados_atendimento in enumerate(ATENDIMENTOS):
        procedimento_principal = (indice % 12) + 1
        espera = TEMPOS_ESPERA[indice % len(TEMPOS_ESPERA)]
        tempo_real = max(
            1,
            TEMPOS_PLANEJADOS[procedimento_principal - 1]
            + VARIACOES_TEMPO[indice % len(VARIACOES_TEMPO)],
        )
        registros.append(
            {
                **dados_atendimento,
                "id_procedimento": procedimento_principal,
                "quantidade": 2 if indice % 11 == 0 else 1,
                "tempo_real_minutos": tempo_real,
                "observacao": "Registro clinico de teste para demonstracao.",
                "faturado": indice % 3 != 0,
                "data_hora_inicio": dados_atendimento["data_hora"]
                + timedelta(minutes=espera),
            }
        )

        if indice % 2 == 0:
            procedimento_complementar = ((indice + 5) % 12) + 1
            tempo_complementar = max(
                1,
                TEMPOS_PLANEJADOS[procedimento_complementar - 1]
                + VARIACOES_TEMPO[(indice + 2) % len(VARIACOES_TEMPO)],
            )
            registros.append(
                {
                    **dados_atendimento,
                    "id_procedimento": procedimento_complementar,
                    "quantidade": 1,
                    "tempo_real_minutos": tempo_complementar,
                    "observacao": "Procedimento complementar do atendimento.",
                    "faturado": indice % 4 != 0,
                    "data_hora_inicio": dados_atendimento["data_hora"]
                    + timedelta(minutes=espera + tempo_real + 5),
                }
            )

    return registros


def upgrade() -> None:
    # Nenhuma pessoa ou especializacao de pessoa e criada nesta migration.
    op.bulk_insert(atendimento, ATENDIMENTOS)
    op.bulk_insert(internacao, INTERNACOES)

    conexao = op.get_bind()
    conexao.execute(
        sa.text(
            """
            INSERT INTO procedimento_realizado (
                id_atendimento,
                id_procedimento,
                quantidade,
                tempo_real_minutos,
                observacao,
                faturado,
                data_hora_inicio
            )
            SELECT
                a.id_atendimento,
                :id_procedimento,
                :quantidade,
                :tempo_real_minutos,
                :observacao,
                :faturado,
                :data_hora_inicio
            FROM atendimento a
            WHERE a.data_hora = :data_hora
              AND a.id_paciente = :id_paciente
              AND a.id_residente = :id_residente
              AND a.id_preceptor = :id_preceptor
            """
        ),
        _procedimentos_realizados(),
    )

    # Gera um exemplo de UPDATE sem remover o atendimento da visualizacao.
    conexao.execute(
        sa.text(
            """
            UPDATE atendimento
            SET duracao_minutos = duracao_minutos + 12
            WHERE data_hora = :data_hora
            """
        ),
        {"data_hora": ATENDIMENTOS[0]["data_hora"]},
    )

    # Um registro temporario gera exemplos de INSERT, UPDATE e DELETE na auditoria.
    id_temporario = conexao.execute(
        sa.text(
            """
            INSERT INTO atendimento (
                data_hora,
                duracao_minutos,
                id_paciente,
                id_residente,
                id_preceptor
            )
            VALUES (:data_hora, 18, 20, 5, 10)
            RETURNING id_atendimento
            """
        ),
        {"data_hora": AUDITORIA_TEMPORARIA_DATA},
    ).scalar_one()
    conexao.execute(
        sa.text(
            """
            UPDATE atendimento
            SET duracao_minutos = 26
            WHERE id_atendimento = :id_atendimento
            """
        ),
        {"id_atendimento": id_temporario},
    )
    conexao.execute(
        sa.text("DELETE FROM atendimento WHERE id_atendimento = :id_atendimento"),
        {"id_atendimento": id_temporario},
    )


def downgrade() -> None:
    conexao = op.get_bind()

    # Guarda os IDs gerados para remover tambem os registros criados pelo trigger.
    conexao.execute(
        sa.text(
            """
            CREATE TEMP TABLE seed_visualizacao_atendimento_ids (
                id_atendimento INTEGER PRIMARY KEY
            ) ON COMMIT DROP
            """
        )
    )
    conexao.execute(
        sa.text(
            """
            INSERT INTO seed_visualizacao_atendimento_ids (id_atendimento)
            SELECT id_atendimento
            FROM atendimento
            WHERE data_hora = :data_hora
              AND id_paciente = :id_paciente
              AND id_residente = :id_residente
              AND id_preceptor = :id_preceptor
            ON CONFLICT DO NOTHING
            """
        ),
        ATENDIMENTOS,
    )

    conexao.execute(
        sa.text(
            """
            DELETE FROM internacao
            WHERE id_paciente = :id_paciente
              AND id_unidade = :id_unidade
              AND data_hora_entrada = :data_hora_entrada
            """
        ),
        INTERNACOES,
    )
    conexao.execute(
        sa.text(
            """
            DELETE FROM atendimento
            WHERE id_atendimento IN (
                SELECT id_atendimento
                FROM seed_visualizacao_atendimento_ids
            )
            """
        )
    )
    conexao.execute(
        sa.text(
            """
            DELETE FROM auditoria_atendimento
            WHERE id_atendimento IN (
                SELECT id_atendimento
                FROM seed_visualizacao_atendimento_ids
            )
               OR COALESCE(
                    dados_antigos ->> 'data_hora',
                    dados_novos ->> 'data_hora'
                  ) = :data_hora_temporaria
            """
        ),
        {"data_hora_temporaria": AUDITORIA_TEMPORARIA_DATA.isoformat()},
    )

    # O trigger atualiza a media apenas no INSERT; no downgrade ela e recalculada.
    conexao.execute(
        sa.text(
            """
            UPDATE procedimento p
            SET media_tempo_procedimento = (
                SELECT ROUND(AVG(pr.tempo_real_minutos), 2)
                FROM procedimento_realizado pr
                WHERE pr.id_procedimento = p.id_procedimento
            )
            """
        )
    )

    for nome_tabela, coluna_id in (
        ("atendimento", "id_atendimento"),
        ("internacao", "id_internacao"),
        ("auditoria_atendimento", "id_auditoria"),
    ):
        conexao.execute(
            sa.text(
                f"""
                SELECT setval(
                    pg_get_serial_sequence('{nome_tabela}', '{coluna_id}'),
                    (SELECT MAX({coluna_id}) FROM {nome_tabela}),
                    true
                )
                """
            )
        )
