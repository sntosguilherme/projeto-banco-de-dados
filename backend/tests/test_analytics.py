# Teste para o módulo sql_loader.py (consultas analíticas)
from app.sql_loader import load_query, _load_all_queries
from app.sql_loader import SQL_DIR

ARQUIVO = "04_analytical_queries.sql"

print("--- Testando ranking_residentes_atendimentos ---")
print(load_query(ARQUIVO, "ranking_residentes_atendimentos"))

print("\n--- Testando preceptores_mais_de_5_atendimentos_mes ---")
print(load_query(ARQUIVO, "preceptores_mais_de_5_atendimentos_mes"))

print("\n--- Testando plantoes_por_residente_unidade ---")
print(load_query(ARQUIVO, "plantoes_por_residente_unidade"))

print("\n--- Testando pacientes_sem_procedimento_alto_risco ---")
print(load_query(ARQUIVO, "pacientes_sem_procedimento_alto_risco"))

print("\n--- Testando query inexistente (deve dar erro) ---")
try:
    load_query(ARQUIVO, "query_que_nao_existe")
except KeyError as e:
    print(f"Erro esperado: {e}")

print("\n--- Conferindo quantidade total de queries encontradas ---")
caminho = SQL_DIR / ARQUIVO
todas = _load_all_queries(caminho)
print(f"Total encontrado: {len(todas)} -> {list(todas.keys())}")