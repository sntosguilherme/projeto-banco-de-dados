'use client';

import { AlertTriangle, ClipboardCheck, RefreshCw, UserCheck } from 'lucide-react';
import { useConsulta } from '@/hooks/use-consulta';
import {
  buscarResidentesSemSupervisor,
  ResidenteSemSupervisor,
} from '@/services/api';

export default function ResidentesSemSupervisorPage() {
  const { dados: supervisoes, loading, erro, atualizar } =
    useConsulta<ResidenteSemSupervisor>(
      buscarResidentesSemSupervisor,
      'Não foi possível carregar as pendências de supervisão.',
    );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Supervisões Pendentes
            </h1>
            <ClipboardCheck className="h-6 w-6 text-neutral-500 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Residentes associados a preceptores sem doutorado ou com supervisão inativa.
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
          <p className="text-sm font-medium text-neutral-600">Consultando pendências...</p>
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

      {!loading && !erro && supervisoes.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <UserCheck className="h-8 w-8 mx-auto text-emerald-500 mb-3" />
          <p className="text-sm font-medium">Nenhuma pendência de supervisão encontrada.</p>
        </div>
      )}

      {!loading && !erro && supervisoes.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Residente</th>
                  <th scope="col" className="px-6 py-4">Preceptor</th>
                  <th scope="col" className="px-6 py-4">Titulação</th>
                  <th scope="col" className="px-6 py-4">Motivo da pendência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {supervisoes.map((supervisao) => (
                  <tr
                    key={`${supervisao.residente_nome}-${supervisao.preceptor_nome}`}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {supervisao.residente_nome}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      {supervisao.preceptor_nome}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700">
                        {supervisao.preceptor_titulacao}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-800">
                        {supervisao.supervisao_ativa
                          ? 'Titulação diferente de Doutor'
                          : 'Supervisão inativa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Pendências encontradas: {supervisoes.length}
          </div>
        </div>
      )}
    </div>
  );
}
