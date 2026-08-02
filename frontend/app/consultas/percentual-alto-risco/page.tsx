'use client';

import { AlertTriangle, RefreshCw, ShieldAlert, User } from 'lucide-react';
import { useConsulta } from '../../../hooks/use-consulta';
import {
  buscarPercentualAltoRiscoPorResidente,
  PercentualAltoRiscoResidente,
} from '../../../services/api';

function limitarPercentual(valor: number) {
  return Math.min(100, Math.max(0, valor));
}

export default function PercentualAltoRiscoPage() {
  const { dados: residentes, loading, erro, atualizar } =
    useConsulta<PercentualAltoRiscoResidente>(
      buscarPercentualAltoRiscoPorResidente,
      'Não foi possível carregar os percentuais de alto risco.',
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Procedimentos de Alto Risco por Residente
            </h1>
            <ShieldAlert className="h-6 w-6 text-amber-600 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Participação dos procedimentos de alto risco no total executado por cada residente.
          </p>
        </div>
        <button
          type="button"
          onClick={atualizar}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Percentuais
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">
            Calculando os percentuais por residente...
          </p>
        </div>
      )}

      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-semibold text-sm">Erro ao carregar a consulta</h2>
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        </div>
      )}

      {!loading && !erro && residentes.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum procedimento foi encontrado.</p>
          <p className="text-xs text-neutral-400 mt-1">
            Os percentuais serão exibidos após o registro de procedimentos em atendimentos.
          </p>
        </div>
      )}

      {!loading && !erro && residentes.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Residente</th>
                  <th scope="col" className="px-6 py-4 text-right">Total</th>
                  <th scope="col" className="px-6 py-4 text-right">Alto risco</th>
                  <th scope="col" className="px-6 py-4 min-w-64">Percentual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {residentes.map((residente) => {
                  const percentual = limitarPercentual(residente.percentual_alto_risco);

                  return (
                    <tr
                      key={residente.id_residente}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-neutral-500" />
                          <span className="font-medium text-neutral-900">
                            {residente.nome_residente}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-neutral-700">
                        {residente.total_procedimentos}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-amber-700">
                        {residente.total_alto_risco}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
                            <div
                              className="h-full rounded-full bg-amber-500"
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-mono font-semibold text-neutral-900">
                            {residente.percentual_alto_risco.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Residentes avaliados: {residentes.length}
          </div>
        </div>
      )}
    </div>
  );
}
