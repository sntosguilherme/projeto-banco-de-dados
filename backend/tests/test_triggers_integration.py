import os
import unittest
from datetime import datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import engine
from app.models.models import (
    Atendimento,
    AuditoriaAtendimento,
    Escala,
    Paciente,
    Preceptor,
    Procedimento,
    ProcedimentoRealizado,
    Residente,
    Unidade,
)
from app.routers.auditorias import listar_auditorias_atendimentos


@unittest.skipUnless(
    os.getenv("RUN_DB_INTEGRATION") == "1",
    "Defina RUN_DB_INTEGRATION=1 para testar com PostgreSQL.",
)
class TriggersIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.connection = engine.connect()
        self.transaction = self.connection.begin()
        self.db = Session(bind=self.connection)

    def tearDown(self):
        self.db.close()
        self.transaction.rollback()
        self.connection.close()

    def criar_atendimento(self):
        paciente = self.db.query(Paciente.id_pessoa).first()[0]
        residente = self.db.query(Residente.id_profissional).first()[0]
        preceptor = self.db.query(Preceptor.id_profissional).first()[0]
        atendimento = Atendimento(
            data_hora=datetime.now().replace(microsecond=0),
            duracao_minutos=90,
            id_paciente=paciente,
            id_residente=residente,
            id_preceptor=preceptor,
        )
        self.db.add(atendimento)
        self.db.flush()
        return atendimento

    def test_trigger_audita_novo_atendimento_e_rota_lista_registro(self):
        atendimento = self.criar_atendimento()
        auditoria = (
            self.db.query(AuditoriaAtendimento)
            .filter(AuditoriaAtendimento.id_atendimento == atendimento.id_atendimento)
            .one()
        )

        self.assertEqual(auditoria.operacao, "INSERT")
        self.assertEqual(
            auditoria.dados_novos["id_atendimento"],
            atendimento.id_atendimento,
        )

        resposta = listar_auditorias_atendimentos(
            operacao="INSERT",
            id_atendimento=atendimento.id_atendimento,
            limite=10,
            db=self.db,
        )
        self.assertEqual(len(resposta), 1)

    def test_trigger_recalcula_media_real_do_procedimento(self):
        atendimento = self.criar_atendimento()
        procedimento = self.db.query(Procedimento).first()
        tempo_novo = 37
        self.db.add(
            ProcedimentoRealizado(
                id_atendimento=atendimento.id_atendimento,
                id_procedimento=procedimento.id_procedimento,
                quantidade=1,
                tempo_real_minutos=tempo_novo,
                faturado=False,
                data_hora_inicio=atendimento.data_hora,
            )
        )
        self.db.flush()
        self.db.refresh(procedimento)

        tempos = [
            item[0]
            for item in self.db.query(ProcedimentoRealizado.tempo_real_minutos)
            .filter(
                ProcedimentoRealizado.id_procedimento
                == procedimento.id_procedimento
            )
            .all()
        ]
        self.assertAlmostEqual(
            float(procedimento.media_tempo_procedimento),
            sum(tempos) / len(tempos),
            places=2,
        )

    def test_trigger_bloqueia_sobreposicao_de_escala(self):
        escala_existente = self.db.query(Escala).first()
        outra_unidade = (
            self.db.query(Unidade)
            .filter(Unidade.id_unidade != escala_existente.id_unidade)
            .first()
        )
        savepoint = self.db.begin_nested()

        with self.assertRaises(IntegrityError) as contexto:
            self.db.add(
                Escala(
                    id_unidade=outra_unidade.id_unidade,
                    id_residente=escala_existente.id_residente,
                    id_preceptor=escala_existente.id_preceptor,
                    dia_semana=escala_existente.dia_semana,
                    turno=escala_existente.turno,
                )
            )
            self.db.flush()

        savepoint.rollback()
        self.assertEqual(getattr(contexto.exception.orig, "pgcode", None), "23505")


if __name__ == "__main__":
    unittest.main()
