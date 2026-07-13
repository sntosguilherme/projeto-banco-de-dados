'use client';

import { useState, useEffect } from 'react';
import { buscarPacientes, PacienteGeral } from '../../../services/api'; 
import { Users, User, CreditCard, ShieldAlert, HeartPulse, RefreshCw, Search } from 'lucide-react';

export default function ListarPacientesPage() {
  const [pacientes, setPacientes] = useState<PacienteGeral[]>([]);
  const [filtro, setFiltro] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPacientes = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarPacientes();
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

  const pacientesFiltrados = pacientes.filter(paciente => 
    paciente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (paciente.cpf && paciente.cpf.includes(filtro))
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Pacientes Cadastrados
            </h1>
            <Users className="h-6 w-6 text-neutral-500 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Consulta geral de pacientes cadastrados no sistema.
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

      {/* Barra de Filtro Rápido */}
      {!erro && !loading && pacientes.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition"
          />
        </div>
      )}

      {/* Estados da Tela */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">Buscando registros na tabela PACIENTE...</p>
        </div>
      )}

      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Erro na API (GET /pacientes)</h4>
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        </div>
      )}

      {!loading && !erro && pacientesFiltrados.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum registro de paciente encontrado.</p>
        </div>
      )}

      {/* Tabela */}
      {!loading && !erro && pacientesFiltrados.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Nome</th>
                  <th scope="col" className="px-6 py-4 w-36">CPF</th>
                  <th scope="col" className="px-6 py-4 w-36">Convênio</th>
                  <th scope="col" className="px-6 py-4 w-24 text-center">Tipo Sanguíneo</th>
                  <th scope="col" className="px-6 py-4">Alergias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {pacientesFiltrados.map((paciente) => (
                  <tr key={paciente.id_pessoa} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="bg-neutral-100 text-neutral-700 p-1.5 rounded-md">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-neutral-900">{paciente.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-neutral-500">
                      {paciente.cpf || 'Não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {paciente.num_convenio ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <CreditCard className="h-3 w-3" />
                          {paciente.num_convenio}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Particular</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {paciente.grupo_sanguineo ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                          <HeartPulse className="h-3 w-3 text-red-500" />
                          {paciente.grupo_sanguineo}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 max-w-xs truncate">
                      {paciente.alergias ? (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 block truncate font-medium" title={paciente.alergias}>
                           {paciente.alergias}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">Nenhuma registrada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Total de pacientes listados: {pacientesFiltrados.length}
          </div>
        </div>
      )}
    </div>
  );
}