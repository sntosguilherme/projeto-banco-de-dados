import os
import unittest
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.database import engine
from app.models.models import (
    Atendimento,
    Escala,
    Paciente,
    Preceptor,
    Procedimento,
    ProcedimentoRealizado,
    Residente,
)
from app.routers.stored_procedures import (
    calcular_tempo_medio_espera,
    reajustar_escala,
    registrar_atendimento_completo,
)
from app.schemas.stored_procedures import (
    AtendimentoCompletoIn,
    ReajusteEscalaIn,
)


@unittest.skipUnless(
    os.getenv("RUN_DB_INTEGRATION") == "1",
    "Defina RUN_DB_INTEGRATION=1 para testar com PostgreSQL.",
)
class StoredProceduresIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.connection = engine.connect()
        self.transaction = self.connection.begin()
        self.db = Session(bind=self.connection)
        self.db.commit = self.db.flush

    def tearDown(self):
        self.db.close()
        self.transaction.rollback()
        self.connection.close()

    def test_registra_atendimento_completo_e_retorna_id(self):
        paciente = self.db.query(Paciente.id_pessoa).first()
        residente = self.db.query(Residente.id_profissional).first()
        preceptor = self.db.query(Preceptor.id_profissional).first()
        procedimento = self.db.query(Procedimento.id_procedimento).first()
        self.assertIsNotNone(paciente)
        self.assertIsNotNone(residente)
        self.assertIsNotNone(preceptor)
        self.assertIsNotNone(procedimento)

        chegada = datetime.now().replace(microsecond=0)
        resposta = registrar_atendimento_completo(
            AtendimentoCompletoIn(
                data_hora=chegada,
                duracao_minutos=60,
                id_paciente=paciente[0],
                id_residente=residente[0],
                id_preceptor=preceptor[0],
                procedimentos=[
                    {
                        "id_procedimento": procedimento[0],
                        "quantidade": 1,
                        "tempo_real_minutos": 20,
                        "data_hora_inicio": chegada + timedelta(minutes=8),
                    }
                ],
            ),
            self.db,
        )

        atendimento = self.db.get(Atendimento, resposta.id_atendimento)
        realizado = self.db.get(
            ProcedimentoRealizado,
            (resposta.id_atendimento, procedimento[0]),
        )
        self.assertIsNotNone(atendimento)
        self.assertIsNotNone(realizado)
        self.assertEqual(resposta.procedimentos_registrados, 1)

    def test_calcula_tempo_medio_espera(self):
        resposta = calcular_tempo_medio_espera(self.db)
        self.assertIsInstance(resposta, list)

    def test_reajusta_escala(self):
        escala = self.db.query(Escala).first()
        self.assertIsNotNone(escala)

        dias = [
            "Segunda",
            "Terca",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sabado",
            "Domingo",
        ]
        turnos = ["Manha", "Tarde", "Noite"]
        destino = next(
            (dia, turno)
            for dia in dias
            for turno in turnos
            if (dia, turno) != (escala.dia_semana, escala.turno)
            and not self.db.query(Escala)
            .filter(
                Escala.id_residente == escala.id_residente,
                Escala.dia_semana == dia,
                Escala.turno == turno,
            )
            .first()
        )

        resposta = reajustar_escala(
            ReajusteEscalaIn(
                id_residente=escala.id_residente,
                dia_origem=escala.dia_semana,
                turno_origem=escala.turno,
                dia_destino=destino[0],
                turno_destino=destino[1],
            ),
            self.db,
        )

        self.assertGreaterEqual(resposta.escalas_reajustadas, 1)
        self.assertEqual(resposta.conflitos_ignorados, 0)


if __name__ == "__main__":
    unittest.main()
