'use client';

import { useState, useEffect } from 'react';
import { buscarPacientesSemRiscoAlto, PacienteSemRisco } from '../../../services/api'; 
import { ShieldCheck, User, AlertTriangle, RefreshCw } from 'lucide-react';

export default function PacientesSemRiscoPage() {
  const [pacientes, setPacientes] = useState<PacienteSemRisco[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPacientes = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarPacientesSemRiscoAlto();
      setPacientes(dados);
    } catch (err: any) {
      console.error('Erro ao buscar pacientes:', err);
      setErro(err.message || 'Não foi possível carregar a lista de pacientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPacientes();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Pacientes Sem Procedimentos de Alto Risco
            </h1>
            <ShieldCheck className="h-6 w-6 text-emerald-600 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Filtro analítico de pacientes que nunca realizaram ou não possuem registros de procedimentos classificados como alto risco.
          </p>
        </div>
        <button
          onClick={carregarPacientes}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </button>
      </div>

      {/* Estado de Carregamento */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">Filtrando dados no banco de dados...</p>
        </div>
      )}

      {/* Estado de Erro */}
      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Erro na API do FastAPI</h4>
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && !erro && pacientes.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum paciente elegível encontrado.</p>
        </div>
      )}

      {/* Tabela de Resultados Otimizada para o seu SQL */}
      {!loading && !erro && pacientes.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4 w-16 text-center">#</th>
                  <th scope="col" className="px-6 py-4">Nome do Paciente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {pacientes.map((paciente, index) => {
                  const nomeExibicao = paciente.nome || (paciente as any).paciente || "Nome Indisponível";

                  return (
                    <tr key={index} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 text-center whitespace-nowrap text-neutral-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded-md">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-neutral-900">
                            {nomeExibicao}
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
            Total de pacientes listados: {pacientes.length}
          </div>
        </div>
      )}
    </div>
  );
}