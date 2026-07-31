"""Seed test data.

Revision ID: 20260730_01
Revises: 20260730_00
Create Date: 2026-07-30
"""

from datetime import date, datetime
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260730_01"
down_revision: Union[str, Sequence[str], None] = "93b1444b14a9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pessoa = sa.table(
    "pessoa",
    sa.column("id_pessoa", sa.Integer),
    sa.column("nome", sa.String),
    sa.column("cpf", sa.String),
    sa.column("data_nascimento", sa.Date),
    sa.column("is_flamengo", sa.Boolean),
    sa.column("telefone", sa.String),
)
profissional = sa.table(
    "profissional",
    sa.column("id_pessoa", sa.Integer),
    sa.column("crm", sa.String),
    sa.column("data_admissao", sa.Date),
    sa.column("especialidade", sa.String),
)
residente = sa.table(
    "residente",
    sa.column("id_profissional", sa.Integer),
    sa.column("ano_residencia", sa.String),
)
preceptor = sa.table(
    "preceptor",
    sa.column("id_profissional", sa.Integer),
    sa.column("titulacao", sa.String),
)
paciente = sa.table(
    "paciente",
    sa.column("id_pessoa", sa.Integer),
    sa.column("num_convenio", sa.String),
    sa.column("grupo_sanguineo", sa.String),
)
alergia = sa.table(
    "alergia",
    sa.column("id_alergia", sa.Integer),
    sa.column("nome", sa.String),
)
paciente_alergia = sa.table(
    "paciente_alergia",
    sa.column("id_pessoa", sa.Integer),
    sa.column("id_alergia", sa.Integer),
)
unidade = sa.table(
    "unidade",
    sa.column("id_unidade", sa.Integer),
    sa.column("nome", sa.String),
    sa.column("tipo", sa.String),
    sa.column("capacidade_leitos", sa.Integer),
)
procedimento = sa.table(
    "procedimento",
    sa.column("id_procedimento", sa.Integer),
    sa.column("codigo", sa.String),
    sa.column("nome", sa.String),
    sa.column("tempo_medio_minutos", sa.Integer),
    sa.column("nivel_risco", sa.String),
)
atendimento = sa.table(
    "atendimento",
    sa.column("id_atendimento", sa.Integer),
    sa.column("data_hora", sa.DateTime),
    sa.column("duracao_minutos", sa.Integer),
    sa.column("id_paciente", sa.Integer),
    sa.column("id_residente", sa.Integer),
    sa.column("id_preceptor", sa.Integer),
)
procedimento_realizado = sa.table(
    "procedimento_realizado",
    sa.column("id_atendimento", sa.Integer),
    sa.column("id_procedimento", sa.Integer),
    sa.column("quantidade", sa.Integer),
    sa.column("tempo_real_minutos", sa.Integer),
    sa.column("observacao", sa.Text),
    sa.column("faturado", sa.Boolean),
)
escala = sa.table(
    "escala",
    sa.column("id_escala", sa.Integer),
    sa.column("id_unidade", sa.Integer),
    sa.column("dia_semana", sa.String),
    sa.column("turno", sa.String),
    sa.column("id_residente", sa.Integer),
    sa.column("id_preceptor", sa.Integer),
)


def upgrade() -> None:
    op.bulk_insert(
        pessoa,
        [
            {"id_pessoa": 1, "nome": "Guimas", "cpf": "021.345.678-90", "data_nascimento": date(1998, 3, 12), "is_flamengo": False, "telefone": "(83) 91111-0001"},
            {"id_pessoa": 2, "nome": "Borges", "cpf": "032.456.789-01", "data_nascimento": date(1997, 11, 25), "is_flamengo": False, "telefone": "(83) 92222-0002"},
            {"id_pessoa": 3, "nome": "Zé Freire", "cpf": "043.567.890-12", "data_nascimento": date(1999, 6, 8), "is_flamengo": True, "telefone": "(83) 93333-0003"},
            {"id_pessoa": 4, "nome": "Mikael Menezes", "cpf": "054.678.901-23", "data_nascimento": date(1998, 9, 17), "is_flamengo": False, "telefone": "(83) 94444-0004"},
            {"id_pessoa": 5, "nome": "Matheus", "cpf": "065.789.012-34", "data_nascimento": date(2000, 1, 30), "is_flamengo": True, "telefone": "(83) 95555-0005"},
            {"id_pessoa": 6, "nome": "Beca", "cpf": "076.890.123-45", "data_nascimento": date(1985, 4, 22), "is_flamengo": True, "telefone": "(83) 96666-0006"},
            {"id_pessoa": 7, "nome": "Galego", "cpf": "087.901.234-56", "data_nascimento": date(1983, 7, 14), "is_flamengo": False, "telefone": "(83) 97777-0007"},
            {"id_pessoa": 8, "nome": "Lara Poggers", "cpf": "098.012.345-67", "data_nascimento": date(1987, 2, 19), "is_flamengo": False, "telefone": "(83) 98888-0008"},
            {"id_pessoa": 9, "nome": "Mark", "cpf": "109.123.456-78", "data_nascimento": date(1980, 10, 5), "is_flamengo": False, "telefone": "(83) 99999-0009"},
            {"id_pessoa": 10, "nome": "Yuri Cavalcante", "cpf": "210.234.567-89", "data_nascimento": date(1982, 8, 28), "is_flamengo": True, "telefone": "(83) 90000-0010"},
            {"id_pessoa": 11, "nome": "Hugo Poggers", "cpf": "321.345.678-90", "data_nascimento": date(2001, 5, 11), "is_flamengo": True, "telefone": "(83) 91111-0011"},
            {"id_pessoa": 12, "nome": "Pedrão", "cpf": "432.456.789-01", "data_nascimento": date(1999, 12, 3), "is_flamengo": True, "telefone": "(83) 92222-0012"},
            {"id_pessoa": 13, "nome": "Ruan", "cpf": "543.567.890-12", "data_nascimento": date(2000, 7, 22), "is_flamengo": True, "telefone": "(83) 93333-0013"},
            {"id_pessoa": 14, "nome": "Carol Camilo", "cpf": "654.678.901-23", "data_nascimento": date(1998, 4, 16), "is_flamengo": True, "telefone": "(83) 94444-0014"},
            {"id_pessoa": 15, "nome": "Marcelo Iury", "cpf": "765.789.012-34", "data_nascimento": date(1997, 9, 9), "is_flamengo": True, "telefone": "(83) 95555-0015"},
            {"id_pessoa": 16, "nome": "Ju Lindo", "cpf": "876.890.123-45", "data_nascimento": date(2001, 3, 27), "is_flamengo": False, "telefone": "(83) 96666-0016"},
            {"id_pessoa": 17, "nome": "Anna Livia Cavalcante", "cpf": "987.901.234-56", "data_nascimento": date(2000, 11, 14), "is_flamengo": False, "telefone": "(83) 97777-0017"},
            {"id_pessoa": 18, "nome": "Yan", "cpf": "198.012.345-67", "data_nascimento": date(2002, 1, 8), "is_flamengo": True, "telefone": "(83) 98888-0018"},
            {"id_pessoa": 19, "nome": "David Lopes", "cpf": "209.123.456-78", "data_nascimento": date(1999, 6, 30), "is_flamengo": False, "telefone": "(83) 99999-0019"},
            {"id_pessoa": 20, "nome": "Bruno Freire", "cpf": "310.234.567-89", "data_nascimento": date(2001, 8, 18), "is_flamengo": True, "telefone": "(83) 90000-0020"},
        ],
    )
    op.bulk_insert(
        profissional,
        [
            {"id_pessoa": 1, "crm": "CRM-PB-1", "data_admissao": date(2023, 2, 1), "especialidade": "Clínica Médica"},
            {"id_pessoa": 2, "crm": "CRM-PB-2", "data_admissao": date(2023, 2, 1), "especialidade": "Cirurgia Geral"},
            {"id_pessoa": 3, "crm": "CRM-PB-3", "data_admissao": date(2023, 3, 1), "especialidade": "Cirurgia Geral"},
            {"id_pessoa": 4, "crm": "CRM-PB-4", "data_admissao": date(2023, 2, 15), "especialidade": "Cardiologia"},
            {"id_pessoa": 5, "crm": "CRM-PB-5", "data_admissao": date(2023, 3, 15), "especialidade": "Neurologia"},
            {"id_pessoa": 6, "crm": "CRM-PB-6", "data_admissao": date(2015, 6, 10), "especialidade": "Clínica Médica"},
            {"id_pessoa": 7, "crm": "CRM-PB-7", "data_admissao": date(2013, 8, 20), "especialidade": "Clínica Médica"},
            {"id_pessoa": 8, "crm": "CRM-PB-8", "data_admissao": date(2016, 1, 5), "especialidade": "Cirurgia Geral"},
            {"id_pessoa": 9, "crm": "CRM-PB-9", "data_admissao": date(2010, 11, 30), "especialidade": "Cardiologia"},
            {"id_pessoa": 10, "crm": "CRM-PB-10", "data_admissao": date(2012, 4, 15), "especialidade": "Neurologia"},
        ],
    )
    op.bulk_insert(residente, [{"id_profissional": i, "ano_residencia": ano} for i, ano in [(1, "R2"), (2, "R1"), (3, "R3"), (4, "R1"), (5, "R2")]])
    op.bulk_insert(preceptor, [{"id_profissional": i, "titulacao": titulacao} for i, titulacao in [(6, "Doutor"), (7, "Mestre"), (8, "Especialista"), (9, "Doutor"), (10, "Mestre")]])
    op.bulk_insert(
        paciente,
        [
            {"id_pessoa": 11, "num_convenio": "UNIMED-1", "grupo_sanguineo": "O+"},
            {"id_pessoa": 12, "num_convenio": "BRADESCO-1", "grupo_sanguineo": "A+"},
            {"id_pessoa": 13, "num_convenio": None, "grupo_sanguineo": "B-"},
            {"id_pessoa": 14, "num_convenio": "AMIL-1", "grupo_sanguineo": "AB+"},
            {"id_pessoa": 15, "num_convenio": "UNIMED-2", "grupo_sanguineo": "O-"},
            {"id_pessoa": 16, "num_convenio": None, "grupo_sanguineo": "A-"},
            {"id_pessoa": 17, "num_convenio": "SULAMERICA-1", "grupo_sanguineo": "B+"},
            {"id_pessoa": 18, "num_convenio": "BRADESCO-2", "grupo_sanguineo": "O+"},
            {"id_pessoa": 19, "num_convenio": None, "grupo_sanguineo": "A+"},
            {"id_pessoa": 20, "num_convenio": "AMIL-1", "grupo_sanguineo": "AB-"},
        ],
    )
    op.bulk_insert(alergia, [{"id_alergia": i, "nome": nome} for i, nome in enumerate(["Dipirona", "Penicilina", "Látex", "Ser feio", "Amoxicilina", "Segunda-Feira"], 1)])
    op.bulk_insert(paciente_alergia, [{"id_pessoa": p, "id_alergia": a} for p, a in [(11, 1), (13, 2), (13, 3), (16, 4), (18, 5), (19, 6), (20, 6)]])
    op.bulk_insert(
        unidade,
        [
            {"id_unidade": 1, "nome": "UTI Adulto", "tipo": "UTI", "capacidade_leitos": 10},
            {"id_unidade": 2, "nome": "Enfermaria", "tipo": "Enfermaria", "capacidade_leitos": 30},
            {"id_unidade": 3, "nome": "Pronto-Socorro", "tipo": "Emergência", "capacidade_leitos": 12},
            {"id_unidade": 4, "nome": "Ala de Cardiologia", "tipo": "Ala Especializada", "capacidade_leitos": 8},
            {"id_unidade": 5, "nome": "Centro Cirúrgico", "tipo": "Cirurgia", "capacidade_leitos": 5},
        ],
    )
    op.bulk_insert(
        procedimento,
        [
            {"id_procedimento": 1, "codigo": "PROC-001", "nome": "Raio-X de tórax", "tempo_medio_minutos": 15, "nivel_risco": "BAIXO"},
            {"id_procedimento": 2, "codigo": "PROC-002", "nome": "Medição de pressão arterial", "tempo_medio_minutos": 5, "nivel_risco": "BAIXO"},
            {"id_procedimento": 3, "codigo": "PROC-003", "nome": "Curativo simples", "tempo_medio_minutos": 10, "nivel_risco": "BAIXO"},
            {"id_procedimento": 4, "codigo": "PROC-004", "nome": "Coleta de sangue", "tempo_medio_minutos": 8, "nivel_risco": "BAIXO"},
            {"id_procedimento": 5, "codigo": "PROC-005", "nome": "Sutura de ferida", "tempo_medio_minutos": 25, "nivel_risco": "MEDIO"},
            {"id_procedimento": 6, "codigo": "PROC-006", "nome": "Sonda urinária", "tempo_medio_minutos": 20, "nivel_risco": "MEDIO"},
            {"id_procedimento": 7, "codigo": "PROC-007", "nome": "Eletrocardiograma", "tempo_medio_minutos": 10, "nivel_risco": "MEDIO"},
            {"id_procedimento": 8, "codigo": "PROC-008", "nome": "Tomografia computadorizada", "tempo_medio_minutos": 30, "nivel_risco": "ALTO"},
            {"id_procedimento": 9, "codigo": "PROC-009", "nome": "Intubação", "tempo_medio_minutos": 20, "nivel_risco": "ALTO"},
            {"id_procedimento": 10, "codigo": "PROC-010", "nome": "Desfibrilação", "tempo_medio_minutos": 15, "nivel_risco": "ALTO"},
            {"id_procedimento": 11, "codigo": "PROC-011", "nome": "Aplicação de band-aid com sopro", "tempo_medio_minutos": 3, "nivel_risco": "BAIXO"},
            {"id_procedimento": 12, "codigo": "PROC-012", "nome": "Medição de temperatura no sovaco", "tempo_medio_minutos": 5, "nivel_risco": "BAIXO"},
        ],
    )
    op.bulk_insert(
        atendimento,
        [
            {"id_atendimento": i, "data_hora": datetime(2025, 6, day, hour, minute), "duracao_minutos": duration, "id_paciente": patient, "id_residente": resident, "id_preceptor": preceptor_id}
            for i, day, hour, minute, duration, patient, resident, preceptor_id in [
                (1, 1, 8, 0, 45, 11, 1, 6), (2, 2, 10, 30, 60, 12, 2, 7),
                (3, 3, 14, 0, 30, 13, 3, 8), (4, 4, 9, 15, 90, 14, 4, 9),
                (5, 5, 11, 0, 50, 15, 5, 10), (6, 6, 16, 45, 35, 16, 1, 7),
                (7, 7, 8, 30, 120, 17, 2, 6), (8, 8, 13, 0, 25, 18, 3, 10),
                (9, 9, 7, 45, 75, 19, 4, 8), (10, 10, 15, 20, 40, 20, 5, 9),
                (11, 11, 8, 0, 30, 11, 1, 6), (12, 12, 9, 0, 40, 12, 2, 6),
                (13, 13, 10, 0, 25, 13, 3, 6), (14, 14, 11, 0, 55, 14, 4, 6),
                (15, 15, 12, 0, 20, 15, 5, 6), (16, 16, 13, 0, 35, 16, 1, 6),
                (17, 17, 14, 0, 45, 17, 2, 6),
            ]
        ],
    )
    performed = [
        (1, 5, 28, "Sutura na mão direita, 4 pontos", False), (1, 4, 8, "Coleta de sangue pré-sutura", True),
        (2, 1, 12, None, False), (3, 9, 22, "Intubação de urgência, paciente agitado", False),
        (4, 7, 10, None, False), (4, 8, 35, "TC do crânio", False),
        (5, 6, 14, "Sondagem de alívio", True), (6, 3, 10, None, False),
        (7, 10, 18, "Desfibrilação", False), (7, 9, 20, "Intubação pós-desfibrilação", False),
        (8, 2, 5, None, True), (9, 11, 4, "Band-aid no dedão com direito a sopro", False),
        (10, 12, 6, "Termômetro quebrou no meio", False), (11, 4, 8, "Coleta de rotina", True),
        (12, 1, 12, None, False), (13, 3, 9, "Curativo pós-procedimento", False),
        (14, 7, 11, "ECG de rotina", True), (15, 2, 5, None, False),
        (16, 5, 26, "Sutura em antebraço", False), (17, 6, 19, "Sondagem vesical", True),
        (11, 2, 5, "Aferição de pressão", False), (14, 4, 7, "Coleta pré-ECG", True),
        (17, 9, 21, "Intubação de emergência", False),
    ]
    op.bulk_insert(procedimento_realizado, [{"id_atendimento": a, "id_procedimento": p, "quantidade": 1, "tempo_real_minutos": t, "observacao": o, "faturado": f} for a, p, t, o, f in performed])
    schedules = [
        (1, "Segunda", "Manha", 1, 6), (1, "Terca", "Noite", 2, 6), (1, "Quarta", "Tarde", 3, 8), (1, "Quinta", "Manha", 4, 9), (1, "Sexta", "Noite", 5, 10),
        (2, "Segunda", "Tarde", 2, 7), (2, "Terca", "Manha", 4, 6), (2, "Quarta", "Noite", 1, 8), (2, "Sabado", "Manha", 3, 9),
        (3, "Segunda", "Manha", 5, 10), (3, "Terca", "Tarde", 1, 7), (3, "Quinta", "Noite", 2, 9), (3, "Sabado", "Tarde", 4, 8), (3, "Domingo", "Manha", 3, 6),
        (4, "Segunda", "Manha", 3, 9), (4, "Quarta", "Tarde", 5, 7), (4, "Sexta", "Noite", 2, 10), (4, "Sabado", "Manha", 1, 8),
        (5, "Terca", "Manha", 4, 6), (5, "Quarta", "Manha", 1, 9), (5, "Quinta", "Tarde", 5, 8), (5, "Sexta", "Manha", 3, 7),
    ]
    op.bulk_insert(escala, [{"id_escala": i, "id_unidade": u, "dia_semana": d, "turno": t, "id_residente": r, "id_preceptor": p} for i, (u, d, t, r, p) in enumerate(schedules, 1)])

    for table_name, id_column in [
        ("pessoa", "id_pessoa"), ("alergia", "id_alergia"), ("unidade", "id_unidade"),
        ("procedimento", "id_procedimento"), ("atendimento", "id_atendimento"), ("escala", "id_escala"),
    ]:
        op.execute(
            sa.text(
                f"SELECT setval(pg_get_serial_sequence('{table_name}', '{id_column}'), "
                f"(SELECT MAX({id_column}) FROM {table_name}), true)"
            )
        )


def downgrade() -> None:
    for table_name, id_column, ids in [
        ("escala", "id_escala", range(1, 23)),
        ("procedimento_realizado", "id_atendimento", range(1, 18)),
        ("atendimento", "id_atendimento", range(1, 18)),
        ("procedimento", "id_procedimento", range(1, 13)),
        ("unidade", "id_unidade", range(1, 6)),
        ("paciente_alergia", "id_pessoa", range(11, 21)),
        ("alergia", "id_alergia", range(1, 7)),
        ("paciente", "id_pessoa", range(11, 21)),
        ("preceptor", "id_profissional", range(6, 11)),
        ("residente", "id_profissional", range(1, 6)),
        ("profissional", "id_pessoa", range(1, 11)),
        ("pessoa", "id_pessoa", range(1, 21)),
    ]:
        seed_ids = ", ".join(str(seed_id) for seed_id in ids)
        op.execute(
            sa.text(f"DELETE FROM {table_name} WHERE {id_column} IN ({seed_ids})")
        )
