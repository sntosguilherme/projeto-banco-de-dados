'use client';

import { AlertTriangle, Heart, RefreshCw, UserCheck } from 'lucide-react';
import { useConsulta } from '../../../hooks/use-consulta';
import {
  buscarPreceptoresDePacientesFlamenguistas,
  PreceptorFlamenguista,
} from '../../../services/api';

export default function PreceptoresFlamenguistasPage() {
  const { dados: preceptores, loading, erro, atualizar } =
    useConsulta<PreceptorFlamenguista>(
      buscarPreceptoresDePacientesFlamenguistas,
      'Não foi possível carregar os preceptores.',
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Preceptores de Pacientes Flamenguistas
            </h1>
            <Heart className="h-6 w-6 text-red-600 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Preceptores que já supervisionaram ao menos um atendimento de paciente flamenguista.
          </p>
        </div>
        <button
          type="button"
          onClick={atualizar}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">
            Consultando supervisões registradas...
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

      {!loading && !erro && preceptores.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum preceptor encontrado.</p>
          <p className="text-xs text-neutral-400 mt-1">
            O resultado aparecerá quando houver uma supervisão correspondente.
          </p>
        </div>
      )}

      {!loading && !erro && preceptores.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4 w-16 text-center">#</th>
                  <th scope="col" className="px-6 py-4">Preceptor</th>
                  <th scope="col" className="px-6 py-4">CRM</th>
                  <th scope="col" className="px-6 py-4">Titulação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {preceptores.map((preceptor, index) => (
                  <tr
                    key={preceptor.id_profissional}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-neutral-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-neutral-500" />
                        <span className="font-medium text-neutral-900">{preceptor.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-neutral-700">
                      {preceptor.crm}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">{preceptor.titulacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Total de preceptores: {preceptores.length}
          </div>
        </div>
      )}
    </div>
  );
}
