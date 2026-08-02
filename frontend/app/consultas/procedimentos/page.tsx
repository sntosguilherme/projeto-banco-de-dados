'use client';

import { Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { useConsulta } from '@/hooks/use-consulta';
import { listarProcedimentos, ProcedimentoBase } from '@/services/api';

const estiloRisco: Record<string, string> = {
  BAIXO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIO: 'bg-amber-50 text-amber-700 border-amber-200',
  ALTO: 'bg-red-50 text-red-700 border-red-200',
};

export default function CatalogoProcedimentosPage() {
  const { dados: procedimentos, loading, erro, atualizar } =
    useConsulta<ProcedimentoBase>(
      listarProcedimentos,
      'Não foi possível carregar o catálogo de procedimentos.',
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Médias dos Procedimentos
            </h1>
            <Activity className="h-6 w-6 text-neutral-500 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Comparação entre o tempo previsto e a média real recalculada pelo trigger.
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
          <p className="text-sm font-medium text-neutral-600">Carregando médias recalculadas...</p>
        </div>
      )}

      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-sm">Erro ao carregar os procedimentos</h2>
            <p className="text-xs text-red-700 mt-1">{erro}</p>
          </div>
        </div>
      )}

      {!loading && !erro && procedimentos.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum procedimento cadastrado.</p>
        </div>
      )}

      {!loading && !erro && procedimentos.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Código</th>
                  <th scope="col" className="px-6 py-4">Procedimento</th>
                  <th scope="col" className="px-6 py-4">Risco</th>
                  <th scope="col" className="px-6 py-4 text-right">Tempo previsto</th>
                  <th scope="col" className="px-6 py-4 text-right">Média real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {procedimentos.map((procedimento) => (
                  <tr key={procedimento.id_procedimento} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4 font-mono text-neutral-500">
                      {procedimento.codigo}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {procedimento.nome}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${estiloRisco[procedimento.nivel_risco] ?? 'bg-neutral-50 border-neutral-200'}`}>
                        {procedimento.nivel_risco}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-neutral-700">
                      {procedimento.tempo_medio_minutos} min
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-neutral-900">
                      {procedimento.media_tempo_procedimento == null
                        ? 'Sem amostras'
                        : `${procedimento.media_tempo_procedimento.toFixed(2)} min`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            A média real é atualizada após cada novo procedimento realizado.
          </div>
        </div>
      )}
    </div>
  );
}
