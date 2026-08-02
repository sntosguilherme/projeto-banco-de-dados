'use client';

import { AlertTriangle, Clock, RefreshCw, Stethoscope, User } from 'lucide-react';
import { useConsulta } from '../../../hooks/use-consulta';
import {
  buscarUltimosAtendimentosPorPaciente,
  UltimoAtendimentoPaciente,
} from '../../../services/api';

function formatarDataHora(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

export default function UltimosAtendimentosPage() {
  const { dados: atendimentos, loading, erro, atualizar } =
    useConsulta<UltimoAtendimentoPaciente>(
      buscarUltimosAtendimentosPorPaciente,
      'Não foi possível carregar os últimos atendimentos.',
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Último Atendimento por Paciente
            </h1>
            <Clock className="h-6 w-6 text-neutral-500 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Atendimento mais recente de cada paciente, com equipe responsável e procedimentos realizados.
          </p>
        </div>
        <button
          type="button"
          onClick={atualizar}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Atendimentos
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">
            Localizando o atendimento mais recente de cada paciente...
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

      {!loading && !erro && atendimentos.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum atendimento encontrado.</p>
        </div>
      )}

      {!loading && !erro && atendimentos.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Paciente</th>
                  <th scope="col" className="px-6 py-4 whitespace-nowrap">Data e hora</th>
                  <th scope="col" className="px-6 py-4">Equipe</th>
                  <th scope="col" className="px-6 py-4 min-w-80">Procedimentos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {atendimentos.map((atendimento) => (
                  <tr
                    key={atendimento.id_atendimento}
                    className="hover:bg-neutral-50/50 transition-colors align-top"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-500" />
                        <span className="font-medium text-neutral-900">{atendimento.paciente}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-700">
                      {formatarDataHora(atendimento.data_hora)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-2">
                        <Stethoscope className="h-4 w-4 text-neutral-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-neutral-900">{atendimento.residente}</p>
                          <p className="text-xs text-neutral-500">
                            Preceptor: {atendimento.preceptor}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {atendimento.procedimentos.length === 0 ? (
                        <span className="text-neutral-400 italic">Nenhum procedimento</span>
                      ) : (
                        <ul className="space-y-2">
                          {atendimento.procedimentos.map((procedimento) => (
                            <li
                              key={procedimento.nome_procedimento}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
                            >
                              <span className="font-medium text-neutral-800">
                                {procedimento.nome_procedimento}
                              </span>
                              <span className="text-xs text-neutral-500 whitespace-nowrap">
                                {procedimento.quantidade} un. · {procedimento.tempo_real_minutos} min
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Pacientes com atendimento registrado: {atendimentos.length}
          </div>
        </div>
      )}
    </div>
  );
}
