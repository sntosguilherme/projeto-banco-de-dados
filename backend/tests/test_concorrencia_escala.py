import logging
import threading
import time
import os
import sys

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError

# Adiciona o diretório backend ao PYTHONPATH para conseguir importar o app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.models import Escala, Residente

logging.basicConfig(level=logging.INFO, format="%(message)s\n")
log = logging.getLogger(__name__)

RESIDENTE_ID = 1  # Residente: Guimas
PRECEPTOR_ID = 6  # Preceptor: Beca
UNIDADE_1 = 1     # Unidade: UTI Adulto
UNIDADE_2 = 2     # Unidade: Enfermaria
DIA = "Domingo"
TURNO = "Noite"

# Evento para dar o tiro de largada simultaneamente
start_gun = threading.Event()

def lock_resident(db):
    # Faz um SELECT simples no residente para uso futuro, mas a trava pesada (FOR UPDATE) 
    # está na trigger do banco sempre que um insert em escala ocorre.
    # Podemos também fazer o select explícito aqui se quisermos testar a trava na aplicação
    pass

def transaction_one():
    with SessionLocal() as db:
        try:
            # Aguarda o tiro de largada da main thread
            start_gun.wait()
            
            log.info("[T1] Iniciando transação 1 na unidade 1...")
            
            escala = Escala(
                id_unidade=UNIDADE_1,
                id_residente=RESIDENTE_ID,
                id_preceptor=PRECEPTOR_ID,
                dia_semana=DIA,
                turno=TURNO,
            )
            db.add(escala)
            db.flush() # Dispara a trigger no BD e tenta adquirir o lock no residente
            
            # Segura a trava (se conseguir) para simular tempo de processamento
            time.sleep(2) 
            log.info("[T1] Segurando a trava...")

            
            db.commit()
            log.info("[T1] VENCEDOR DA CORRIDA: Escala inserida com sucesso!")
        except IntegrityError as error:
            db.rollback()
            log.info("[T1] REJEITADA PELO BANCO: %s", str(error.orig))
        except Exception as e:
            db.rollback()
            log.info("[T1] OUTRO ERRO: %s", str(e))

def transaction_two():
    with SessionLocal() as db:
        try:
            # Aguarda o tiro de largada da main thread
            start_gun.wait()
            
            # Atraso mínimo para garantir que T1 entre 1 milissegundo antes
            # eu tirei isso porque tem momentos que vai dar certo tem momentos que vai dar errado
            # time.sleep(0.1)
            
            log.info("[T2] Iniciando transação 2 na unidade 2...")
            
            escala = Escala(
                id_unidade=UNIDADE_2,
                id_residente=RESIDENTE_ID,
                id_preceptor=PRECEPTOR_ID,
                dia_semana=DIA,
                turno=TURNO,
            )
            db.add(escala)
            
            # Ao fazer flush, tentará disparar a trigger e adquirir o lock
            db.flush() 
            
            # Segura a trava (se conseguir) para simular tempo de processamento
            time.sleep(2) 
            log.info("[T2] Segurando a trava...")
            
            db.commit()
            log.info("[T2] VENCEDOR DA CORRIDA: Escala inserida com sucesso!")
        except IntegrityError as error:
            db.rollback()
            log.info("[T2] REJEITADA PELO BANCO: %s", str(error.orig))
        except Exception as e:
            db.rollback()
            log.info("[T2] OUTRO ERRO: %s", str(e))

if __name__ == "__main__":
    # Remove registros de teste anteriores
    with SessionLocal.begin() as db:
        db.execute(
            delete(Escala).where(
                Escala.id_residente == RESIDENTE_ID,
                Escala.dia_semana == DIA,
                Escala.turno == TURNO,
            )
        )
    
    t1 = threading.Thread(target=transaction_one)
    t2 = threading.Thread(target=transaction_two)

    t1.start()
    t2.start()

    # Dá um tempinho minúsculo pro Python inicializar as duas threads no modo de espera
    time.sleep(0.1)

    # Tiro de largada, Libera ambas ao exato mesmo tempo
    start_gun.set()

    t1.join()
    t2.join()
