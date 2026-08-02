'use client';

import { AlertTriangle, BarChart3, RefreshCw } from 'lucide-react';
import { useConsulta } from '@/hooks/use-consulta';
import {
  buscarEstatisticasAtendimentosMensais,
  EstatisticaAtendimentoMensal,
} from '@/services/api';

function formatarMes(valor: string) {
  const correspondencia = /^(\d{4})-(\d{2})$/.exec(valor);
  if (!correspondencia) return valor;

  const data = new Date(Number(correspondencia[1]), Number(correspondencia[2]) - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(data);
}

export default function EstatisticasAtendimentosPage() {
  const { dados: estatisticas, loading, erro, atualizar } =
    useConsulta<EstatisticaAtendimentoMensal>(
      buscarEstatisticasAtendimentosMensais,
      'Não foi possível carregar as estatísticas mensais.',
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Estatísticas Mensais de Atendimentos
            </h1>
            <BarChart3 className="h-6 w-6 text-neutral-500 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Consolidação mensal por unidade fornecida pela view de estatísticas.
          </p>
        </div>
        <button
          type="button"
          onClick={atualizar}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">Consultando a view mensal...</p>
        </div>
      )}

      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-sm">Erro ao consultar a view</h2>
            <p className="text-xs text-red-700 mt-1">{erro}</p>
          </div>
        </div>
      )}

      {!loading && !erro && estatisticas.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhuma estatística mensal disponível.</p>
        </div>
      )}

      {!loading && !erro && estatisticas.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Mês</th>
                  <th scope="col" className="px-6 py-4">Unidade</th>
                  <th scope="col" className="px-6 py-4 text-right">Atendimentos</th>
                  <th scope="col" className="px-6 py-4 text-right">Duração média</th>
                  <th scope="col" className="px-6 py-4">Procedimento mais comum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {estatisticas.map((estatistica) => (
                  <tr
                    key={`${estatistica.mes}-${estatistica.unidade ?? 'sem-unidade'}`}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap capitalize font-medium text-neutral-900">
                      {formatarMes(estatistica.mes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {estatistica.unidade ?? (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 text-xs font-medium">
                          Sem unidade associada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-neutral-900">
                      {estatistica.total_atendimentos}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-neutral-900 whitespace-nowrap">
                      {estatistica.media_duracao.toFixed(2)} min
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      {estatistica.procedimento_mais_comum ?? 'Sem procedimento registrado'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Agrupamentos retornados: {estatisticas.length}
          </div>
        </div>
      )}
    </div>
  );
}
