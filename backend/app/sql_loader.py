from pathlib import Path
from functools import lru_cache
import re

# Carrega queries SQL nomeadas de um arquivo .sql.
#
# Convenção do arquivo SQL:
#     -- nome_da_query
#     -- (comentários extras de documentação, ignorados)
#     SELECT ...;
#
# Cada bloco de query é identificado por uma linha de comentário que
# contém APENAS o nome da âncora, em snake_case (letras minúsculas,
# números e underscore, começando por letra — ex: "listar_atendimentos").
# Comentários que não seguem esse padrão (com espaços, maiúsculas, etc.)
# são tratados como documentação e ignorados na extração do SQL.
#
# Nomes de âncora duplicados no mesmo arquivo geram erro ao carregar.

# path da pasta onde estão as queries SQL.

SQL_DIR = Path(__file__).parent.parent.parent / "sql" / "queries"

# Nome de âncora válido: minúsculas, números e underscore, começando por letra
NOME_VALIDO = re.compile(r"^[a-z][a-z0-9_]*$")

def eh_nome_de_query(comentario: str) -> bool:
    return bool(NOME_VALIDO.match(comentario))

@lru_cache(maxsize=None)
def _load_all_queries(caminho_arquivo: Path) -> dict[str, str]:
    linhas = caminho_arquivo.read_text(encoding="utf-8").splitlines()

    queries: dict[str, str] = {}
    nome_atual: str | None = None
    corpo_atual: list[str] = []

    def fechar_bloco():
        if nome_atual is not None:
            texto = "\n".join(corpo_atual).strip()
            if texto:
                queries[nome_atual] = texto

    for linha in linhas:
        stripped = linha.strip()

        if stripped.startswith("--"):
            comentario = stripped[2:].strip()

            if eh_nome_de_query(comentario):
                if nome_atual is not None and corpo_atual:
                    fechar_bloco()
                if comentario in queries:
                    raise ValueError(
                        f"Query '{comentario}' duplicada em {caminho_arquivo.name}"
                    )
                nome_atual = comentario
                corpo_atual = []
                continue
            else:
                # comentário de documentação (com espaço, maiúscula, etc.) -> ignora
                continue

        if stripped == "":
            continue

        corpo_atual.append(linha)

    fechar_bloco()
    return queries


def load_query(nome_arquivo: str, nome_query: str) -> str:
    caminho = SQL_DIR / nome_arquivo
    if not caminho.exists():
        raise FileNotFoundError(f"Arquivo '{nome_arquivo}' não encontrado em {SQL_DIR}")

    queries = _load_all_queries(caminho)
    if nome_query not in queries:
        raise KeyError(
            f"Query '{nome_query}' não encontrada em {nome_arquivo}. "
            f"Disponíveis: {list(queries.keys())}"
        )
    return queries[nome_query]