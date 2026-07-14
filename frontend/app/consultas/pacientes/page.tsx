'use client';

import { useState, useEffect } from 'react';
import { buscarPacientes, PacienteGeral, atualizarPaciente } from '../../../services/api'; 
import { Users, User, CreditCard, ShieldAlert, HeartPulse, RefreshCw, Search, X, CheckCircle2 } from 'lucide-react';

export default function ListarPacientesPage() {
  const [pacientes, setPacientes] = useState<PacienteGeral[]>([]);
  const [filtro, setFiltro] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados do Modal de Edição
  const [pacienteEditando, setPacienteEditando] = useState<PacienteGeral | null>(null);
  const [editConvenio, setEditConvenio] = useState<string>('');
  const [editAlergias, setEditAlergias] = useState<string>('');
  const [salvando, setSalvando] = useState(false);
  const [editErro, setEditErro] = useState<string | null>(null);

  const abrirModal = (paciente: PacienteGeral) => {
    setPacienteEditando(paciente);
    setEditConvenio(paciente.num_convenio || '');
    setEditAlergias(paciente.alergias || '');
    setEditErro(null);
  };

  const fecharModal = () => {
    setPacienteEditando(null);
    setEditErro(null);
  };

  const handleSalvar = async () => {
    if (!pacienteEditando) return;
    setSalvando(true);
    setEditErro(null);
    try {
      // Envia a string vazia ('') em vez de undefined para forçar o backend a atualizar no banco
      const payload = {
        num_convenio: editConvenio.trim(),
        alergias: editAlergias.trim(),
      };
      await atualizarPaciente(pacienteEditando.id_pessoa, payload);
      fecharModal();
      carregarPacientes();
    } catch (err: any) {
      setEditErro(err.message || 'Erro ao atualizar paciente.');
    } finally {
      setSalvando(false);
    }
  };

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
                  <tr 
                    key={paciente.id_pessoa} 
                    className="hover:bg-neutral-50 transition-colors cursor-pointer group"
                    onClick={() => abrirModal(paciente)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-neutral-100 text-neutral-700 p-2 rounded-md">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-medium text-neutral-900 block">{paciente.nome}</span>
                          <span className="text-[11px] font-mono font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            ID: {paciente.id_pessoa}
                          </span>
                        </div>
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

      {/* Modal de Edição */}
      {pacienteEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Atualizar Dados Médicos</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Edite o convênio e/ou alergias do paciente</p>
              </div>
              <button 
                onClick={fecharModal}
                className="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Corpo do Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Card do Paciente */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                <div className="bg-white border border-neutral-200 p-2.5 rounded-lg shadow-sm">
                  <User className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">{pacienteEditando.nome}</p>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">CPF: {pacienteEditando.cpf}</p>
                </div>
              </div>

              {editErro && (
                <div className="flex gap-2 items-start p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{editErro}</p>
                </div>
              )}

              {/* Formulário */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700 block">Número do Convênio</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input 
                      type="text" 
                      value={editConvenio}
                      onChange={(e) => setEditConvenio(e.target.value)}
                      placeholder="Deixe em branco se for particular..."
                      className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm bg-white placeholder-neutral-400 text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700 block">Alergias (Separadas por vírgula)</label>
                  <div className="relative">
                    <HeartPulse className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <textarea 
                      value={editAlergias}
                      onChange={(e) => setEditAlergias(e.target.value)}
                      placeholder="Ex: Dipirona, Amendoim..."
                      rows={3}
                      className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm bg-white placeholder-neutral-400 text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition resize-none"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500">Deixe em branco se o paciente não possuir alergias conhecidas.</p>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-100 mt-auto">
              <button 
                onClick={fecharModal}
                disabled={salvando}
                className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSalvar}
                disabled={salvando}
                className="px-4 py-2 text-sm font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
              >
                {salvando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}