import os
import unittest

from sqlalchemy.orm import Session

from app.database import engine
from app.routers.views import (
    listar_estatisticas_atendimentos_mensais,
    listar_pacientes_internados,
    listar_residentes_sem_supervisor,
)


@unittest.skipUnless(
    os.getenv("RUN_DB_INTEGRATION") == "1",
    "Defina RUN_DB_INTEGRATION=1 para testar com PostgreSQL.",
)
class ViewsIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.connection = engine.connect()
        self.transaction = self.connection.begin()
        self.db = Session(bind=self.connection)

    def tearDown(self):
        self.db.close()
        self.transaction.rollback()
        self.connection.close()

    def test_lista_estatisticas_atendimentos_mensais(self):
        resposta = listar_estatisticas_atendimentos_mensais(self.db)
        self.assertIsInstance(resposta, list)
        self.assertGreater(len(resposta), 0)
        self.assertIn("mes", resposta[0])
        self.assertIn("total_atendimentos", resposta[0])

    def test_lista_pacientes_internados(self):
        resposta = listar_pacientes_internados(self.db)
        self.assertIsInstance(resposta, list)

    def test_lista_residentes_sem_supervisor(self):
        resposta = listar_residentes_sem_supervisor(self.db)
        self.assertIsInstance(resposta, list)
        self.assertGreater(len(resposta), 0)
        self.assertIn("residente_nome", resposta[0])
        self.assertIn("supervisao_ativa", resposta[0])


if __name__ == "__main__":
    unittest.main()
