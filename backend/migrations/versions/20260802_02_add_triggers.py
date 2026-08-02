"""adiciona triggers

Revision ID: 20260802_02
Revises: 20260801_01
Create Date: 2026-07-31 
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = '20260802_02'
down_revision: Union[str, Sequence[str], None] = '20260801_01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, sa.Sequence[str], None] = None


def upgrade():

    # A coluna usada pelo trigger que recalcula a média dos procedimentos.
    op.add_column(
        "procedimento",
        sa.Column("media_tempo_procedimento", sa.Numeric(10, 2), nullable=True),
    )

    # Tabela de auditoria usada pelo trigger de atendimento.
    # Não há chave estrangeira para atendimento: os registros de auditoria
    # precisam sobreviver à exclusão do atendimento original.
    op.create_table(
        "auditoria_atendimento",
        sa.Column("id_auditoria", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("id_atendimento", sa.Integer(), nullable=False),
        sa.Column("operacao", sa.String(length=10), nullable=False),
        sa.Column("usuario", sa.String(length=255), nullable=False),
        sa.Column("dados_antigos", postgresql.JSONB(), nullable=True),
        sa.Column("dados_novos", postgresql.JSONB(), nullable=True),
        sa.Column(
            "data_hora",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id_auditoria", name="auditoria_atendimento_pkey"),
    )

    op.create_index(
        "ix_auditoria_atendimento_id_atendimento",
        "auditoria_atendimento",
        ["id_atendimento"],
    )

    # trg_check_sobreposicao_escala
    # Impede que um residente seja escalado no mesmo dia e turno em
    # unidades diferentes.

    op.execute("""
        CREATE OR REPLACE FUNCTION fn_check_sobreposicao_escala()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $$
        BEGIN

            -- Serializa alterações concorrentes de escala para o mesmo residente.
            -- Sem esse bloqueio, duas transações podem passar na verificação de sobreposição
            -- antes que qualquer uma delas seja confirmada.

            PERFORM 1
            FROM RESIDENTE r
            WHERE r.id_profissional = NEW.id_residente
            FOR UPDATE;

            IF EXISTS (
                SELECT 1
                FROM ESCALA e
                WHERE e.id_residente = NEW.id_residente
                  AND e.dia_semana = NEW.dia_semana
                  AND e.turno = NEW.turno
                  AND e.id_unidade <> NEW.id_unidade
                  AND e.id_escala <> COALESCE(NEW.id_escala, -1)
            ) THEN
                RAISE EXCEPTION
                    'Residente % já está escalado no dia % e turno % em outra unidade.',
                    NEW.id_residente,
                    NEW.dia_semana,
                    NEW.turno
                    USING ERRCODE = 'unique_violation';
            END IF;

            RETURN NEW;
        END;
        $$;
    """)

    op.execute("DROP TRIGGER IF EXISTS trg_check_sobreposicao_escala ON ESCALA;")

    op.execute("""
        CREATE TRIGGER trg_check_sobreposicao_escala
        BEFORE INSERT OR UPDATE ON ESCALA
        FOR EACH ROW
        EXECUTE FUNCTION fn_check_sobreposicao_escala();
    """)


    # trg_audita_atendimento
    # Registra inclusões, alterações e exclusões de atendimentos.
    # Depende da tabela AUDITORIA_ATENDIMENTO já existir.

    op.execute("""
        CREATE OR REPLACE FUNCTION fn_audita_atendimento()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $$
        BEGIN
            IF TG_OP = 'INSERT' THEN
                INSERT INTO AUDITORIA_ATENDIMENTO (
                    id_atendimento,
                    operacao,
                    usuario,
                    dados_antigos,
                    dados_novos
                )
                VALUES (
                    NEW.id_atendimento,
                    TG_OP,
                    CURRENT_USER,
                    NULL,
                    ROW_TO_JSON(NEW)
                );

                RETURN NEW;
            ELSIF TG_OP = 'UPDATE' THEN
                INSERT INTO AUDITORIA_ATENDIMENTO (
                    id_atendimento,
                    operacao,
                    usuario,
                    dados_antigos,
                    dados_novos
                )
                VALUES (
                    NEW.id_atendimento,
                    TG_OP,
                    CURRENT_USER,
                    ROW_TO_JSON(OLD),
                    ROW_TO_JSON(NEW)
                );

                RETURN NEW;
            ELSE
                INSERT INTO AUDITORIA_ATENDIMENTO (
                    id_atendimento,
                    operacao,
                    usuario,
                    dados_antigos,
                    dados_novos
                )
                VALUES (
                    OLD.id_atendimento,
                    TG_OP,
                    CURRENT_USER,
                    ROW_TO_JSON(OLD),
                    NULL
                );

                RETURN OLD;
            END IF;
        END;
        $$;
    """)

    op.execute("DROP TRIGGER IF EXISTS trg_audita_atendimento ON ATENDIMENTO;")

    op.execute("""
        CREATE TRIGGER trg_audita_atendimento
        AFTER INSERT OR UPDATE OR DELETE ON ATENDIMENTO
        FOR EACH ROW
        EXECUTE FUNCTION fn_audita_atendimento();
    """)


    # trg_atualiza_media_procedimentos
    # Recalcula a média do tempo real do procedimento recém-inserido.
    # Depende da coluna PROCEDIMENTO.media_tempo_procedimento já existir.

    op.execute("""
        CREATE OR REPLACE FUNCTION fn_atualiza_media_procedimentos()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        AS $$
        BEGIN
            UPDATE PROCEDIMENTO
            SET media_tempo_procedimento = (
                SELECT ROUND(AVG(pr.tempo_real_minutos), 2)
                FROM PROCEDIMENTO_REALIZADO pr
                WHERE pr.id_procedimento = NEW.id_procedimento
            )
            WHERE id_procedimento = NEW.id_procedimento;

            RETURN NEW;
        END;
        $$;
    """)

    op.execute("""
        DROP TRIGGER IF EXISTS trg_atualiza_media_procedimentos
            ON PROCEDIMENTO_REALIZADO;
    """)

    op.execute("""
        CREATE TRIGGER trg_atualiza_media_procedimentos
        AFTER INSERT ON PROCEDIMENTO_REALIZADO
        FOR EACH ROW
        EXECUTE FUNCTION fn_atualiza_media_procedimentos();
    """)


def downgrade():
    # Ordem inversa do upgrade: sempre trigger antes da function
    # (uma function não pode ser dropada enquanto um trigger a referencia).

    op.execute("DROP TRIGGER IF EXISTS trg_atualiza_media_procedimentos ON PROCEDIMENTO_REALIZADO;")
    op.execute("DROP FUNCTION IF EXISTS fn_atualiza_media_procedimentos();")

    op.execute("DROP TRIGGER IF EXISTS trg_audita_atendimento ON ATENDIMENTO;")
    op.execute("DROP FUNCTION IF EXISTS fn_audita_atendimento();")

    op.execute("DROP TRIGGER IF EXISTS trg_check_sobreposicao_escala ON ESCALA;")
    op.execute("DROP FUNCTION IF EXISTS fn_check_sobreposicao_escala();")

    op.drop_index(
        "ix_auditoria_atendimento_id_atendimento",
        table_name="auditoria_atendimento",
    )
    op.drop_table("auditoria_atendimento")
    op.drop_column("procedimento", "media_tempo_procedimento")
