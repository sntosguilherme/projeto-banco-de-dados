'use client';

import { useCallback, useEffect, useState } from 'react';

function obterMensagemErro(erro: unknown, mensagemPadrao: string) {
  return erro instanceof Error && erro.message ? erro.message : mensagemPadrao;
}

export function useConsulta<T>(
  consultar: () => Promise<T[]>,
  mensagemErro: string,
) {
  const [dados, setDados] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    consultar()
      .then((resultado) => {
        if (ativo) {
          setDados(resultado);
        }
      })
      .catch((erroConsulta: unknown) => {
        if (ativo) {
          setErro(obterMensagemErro(erroConsulta, mensagemErro));
        }
      })
      .finally(() => {
        if (ativo) {
          setLoading(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, [consultar, mensagemErro]);

  const atualizar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      setDados(await consultar());
    } catch (erroConsulta: unknown) {
      setErro(obterMensagemErro(erroConsulta, mensagemErro));
    } finally {
      setLoading(false);
    }
  }, [consultar, mensagemErro]);

  return { dados, loading, erro, atualizar };
}
