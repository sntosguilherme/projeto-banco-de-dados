# Teste para o módulo sql_loader.py
from app.sql_loader import load_query, _load_all_queries

# Lista todas as queries encontradas no arquivo
queries = _load_all_queries.__wrapped__ if hasattr(_load_all_queries, "__wrapped__") else None

print("--- Testando inserir_atendimento ---")
print(load_query("03_crud_and_basic_queries.sql", "inserir_atendimento"))

print("\n--- Testando listar_atendimentos ---")
print(load_query("03_crud_and_basic_queries.sql", "listar_atendimentos"))

print("\n--- Testando query inexistente (deve dar erro) ---")
try:
    load_query("03_crud_and_basic_queries.sql", "query_que_nao_existe")
except KeyError as e:
    print(f"Erro esperado: {e}")