'use client';

import { useState, useEffect } from 'react';
import { buscarProfissionais, ProfissionalGeral } from '../../../services/api'; 
import { Stethoscope, User, GraduationCap, Award, Search, RefreshCw, AlertTriangle } from 'lucide-react';

export default function ListarProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<ProfissionalGeral[]>([]);
  const [filtro, setFiltro] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarProfissionais = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarProfissionais();
      setProfissionais(dados);
    } catch (err: any) {
      console.error('Erro ao buscar profissionais:', err);
      setErro(err.message || 'Não foi possível carregar a lista de profissionais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProfissionais();
  }, []);

  const profissionaisFiltrados = profissionais.filter(prof => 
    prof.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (prof.especialidade && prof.especialidade.toLowerCase().includes(filtro.toLowerCase())) ||
    (prof.papel && prof.papel.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Corpo Profissional
            </h1>
            <Stethoscope className="h-6 w-6 text-neutral-500 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Visualização geral de residentes e preceptores ativos no sistema com seus respectivos registros e titulações.
          </p>
        </div>
        <button
          onClick={carregarProfissionais}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </button>
      </div>

      {/* Filtro */}
      {!erro && !loading && profissionais.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome, especialidade ou papel..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition"
          />
        </div>
      )}

      {/* Estados */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">Mapeando hierarquias de profissionais...</p>
        </div>
      )}

      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Erro na API (GET /profissionais)</h4>
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        </div>
      )}

      {!loading && !erro && profissionaisFiltrados.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum profissional cadastrado ou encontrado.</p>
        </div>
      )}

      {/* Tabela */}
      {!loading && !erro && profissionaisFiltrados.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Nome</th>
                  <th scope="col" className="px-6 py-4 w-32">CRM</th>
                  <th scope="col" className="px-6 py-4 w-48">Especialidade</th>
                  <th scope="col" className="px-6 py-4 w-36">Vínculo/Papel</th>
                  <th scope="col" className="px-6 py-4">Informação Específica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {profissionaisFiltrados.map((prof) => (
                  <tr key={prof.id_pessoa} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="bg-neutral-100 text-neutral-700 p-1.5 rounded-md">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-neutral-900">{prof.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-neutral-500">
                      {prof.crm || 'Não informado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {prof.especialidade || <span className="text-neutral-400 italic">Clínica Geral</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {prof.papel === 'Residente' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <GraduationCap className="h-3 w-3" />
                          Residente
                        </span>
                      ) : prof.papel === 'Preceptor' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                          <Award className="h-3 w-3" />
                          Preceptor
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                          Médico Assistente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500 text-xs font-medium">
                      {prof.papel === 'Residente' && prof.ano_residencia && (
                        <span>Ano de Residência: <strong className="text-neutral-700 font-mono">{prof.ano_residencia}º Ano</strong></span>
                      )}
                      {prof.papel === 'Preceptor' && prof.titulacao && (
                        <span className="bg-neutral-50 px-2 py-1 rounded border border-neutral-200 text-neutral-600">
                          Titulação: {prof.titulacao}
                        </span>
                      )}
                      {!prof.ano_residencia && !prof.titulacao && (
                        <span className="text-neutral-400 italic">Sem extensões</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Total de profissionais listados: {profissionaisFiltrados.length}
          </div>
        </div>
      )}
    </div>
  );
}