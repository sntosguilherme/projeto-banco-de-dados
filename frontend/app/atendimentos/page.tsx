'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, FileText, User } from 'lucide-react';
import { 
  listarHistoricoAtendimentos, 
  Atendimento
} from '@/services/api';

export default function AtendimentosPage() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const atendimentosData = await listarHistoricoAtendimentos();
      setAtendimentos(atendimentosData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar os atendimentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatarData = (dataIso: string) => {
    const data = new Date(dataIso);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(data);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
            Histórico de Atendimentos
            <FileText className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">Visualização geral dos atendimentos registrados no sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar Lista
          </button>
          <Link 
            href="/atendimentos/novo" 
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Criar Atendimento
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 flex items-center gap-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl border border-neutral-200 animate-pulse flex justify-between">
              <div className="space-y-3 w-1/2">
                <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : atendimentos.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-neutral-200 text-center flex flex-col items-center">
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Nenhum atendimento</h3>
          <p className="text-neutral-500 mb-6 text-sm">Não há nenhum atendimento registrado no sistema ainda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="p-4 pl-6 text-xs font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Data / Hora</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Paciente</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Equipe Médica</th>
                  <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Duração</th>
                  <th className="p-4 pr-6 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm text-neutral-700">
                {atendimentos.map((atendimento) => (
                  <tr key={atendimento.id_atendimento} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-4 pl-6 whitespace-nowrap">
                      {formatarData(atendimento.data_hora)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-neutral-400" />
                        <span className="font-medium text-neutral-800">
                          {atendimento.nome_paciente}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-neutral-600">
                          Residente: {atendimento.nome_residente}
                        </span>
                        <span className="text-neutral-600">
                          Preceptor: {atendimento.nome_preceptor}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {atendimento.duracao_minutos} min
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link 
                        href={`/atendimentos/${atendimento.id_atendimento}/procedimentos`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Procedimentos
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Total de atendimentos listados: {atendimentos.length}
          </div>
        </div>
      )}
    </div>
  );
}