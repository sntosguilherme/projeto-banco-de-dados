'use client';

import { useState, useEffect } from 'react';
// Importa a função e a interface unificada direto do api.ts (usando caminho relativo seguro)
import { buscarRankingResidentes, ResidenteRanking } from '../../../services/api'; 
import { Trophy, Medal, Award, AlertTriangle, RefreshCw } from 'lucide-react';

export default function RankingPage() {
  const [ranking, setRanking] = useState<ResidenteRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Função para buscar os dados do FastAPI
  const carregarRanking = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarRankingResidentes();
      setRanking(dados);
    } catch (err: any) {
      console.error('Erro ao buscar o ranking:', err);
      setErro(err.message || 'Não foi possível carregar o ranking de residentes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRanking();
  }, []);

  // Helper para renderizar os ícones de pódio para os 3 primeiros colocados
  const renderizarTrofeu = (posicao: number) => {
    switch (posicao) {
      case 0:
        return (
          <span title="1º Lugar">
            <Trophy className="h-6 w-6 text-amber-500 inline-block" />
          </span>
        );
      default:
        return <span className="text-sm font-medium text-neutral-500">{posicao + 1}º</span>;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Ranking de Residentes
          </h1>
          <p className="text-sm text-neutral-500">
            Produtividade analítica baseada no volume total de atendimentos realizados.
          </p>
        </div>
        <button
          onClick={carregarRanking}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </button>
      </div>

      {/* Estado de Carregamento */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">Buscando métricas no back-end conteinerizado...</p>
          <p className="text-xs text-neutral-400 mt-1">Processando agrupamentos do banco Postgres...</p>
        </div>
      )}

      {/* Estado de Erro */}
      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Falha na comunicação com a API</h4>
            <p className="text-xs text-red-700">{erro}</p>
            <p className="text-xs text-red-600 font-medium mt-2">
              Verifique se o seu container FastAPI está ativo e se a consulta SQL possui as colunas agrupadas corretamente.
            </p>
          </div>
        </div>
      )}

      {/* Estado Vazio (Sem dados retornados) */}
      {!loading && !erro && ranking.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum registro de atendimento encontrado.</p>
          <p className="text-xs text-neutral-400 mt-1">Os residentes aparecerão aqui assim que novos atendimentos forem inseridos no banco.</p>
        </div>
      )}

      {/* Tabela de Dados (Renderizada com Sucesso) */}
      {!loading && !erro && ranking.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4 w-20 text-center">Posição</th>
                  <th scope="col" className="px-6 py-4">Nome do Residente</th>
                  <th scope="col" className="px-6 py-4">Especialidade</th>
                  <th scope="col" className="px-6 py-4 text-center w-32">Ano</th>
                  <th scope="col" className="px-6 py-4 text-right w-44">Total de Atendimentos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {ranking.map((item, index) => {
                  const isFirst = index == 0; // Destacar o primeiro colocado
                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        isFirst ? 'bg-amber-50/10 font-medium text-neutral-900' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {renderizarTrofeu(index)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={isFirst ? 'font-semibold' : 'text-neutral-900'}>
                          {item.residente}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-500">
                        {item.especialidade || 'Geral'}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-neutral-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                          {item.ano_residencia || 'R1'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-neutral-900 pr-12">
                        {item.total_atendimentos}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}