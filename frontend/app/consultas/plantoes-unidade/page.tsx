'use client';

import { useState, useEffect } from 'react';
// Importa a função e a interface unificada direto do api.ts
import { buscarPlantoesPorUnidade, PlantoesUnidade } from '../../../services/api'; 
import { Calendar, Building2, User, AlertTriangle, RefreshCw } from 'lucide-react';

export default function PlantoesUnidadePage() {
  const [plantoes, setPlantoes] = useState<PlantoesUnidade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPlantoes = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarPlantoesPorUnidade();
      setPlantoes(dados);
    } catch (err: any) {
      console.error('Erro ao buscar plantões:', err);
      setErro(err.message || 'Não foi possível carregar a escala de plantões.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPlantoes();
  }, []);

  return (
    // Mantido o padrão max-w-5xl fixo que você prefere
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Plantões Escalados por Unidade
          </h1>
          <p className="text-sm text-neutral-500">
            Contagem de plantões fixos semanais definidos na escala para cada combinação de residente e unidade.
          </p>
        </div>
        <button
          onClick={carregarPlantoes}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Escala
        </button>
      </div>

      {/* Estado de Carregamento */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">Carregando escala de plantões...</p>
          <p className="text-xs text-neutral-400 mt-1">Processando junções de tabelas no Postgres...</p>
        </div>
      )}

      {/* Estado de Erro */}
      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Erro ao consultar back-end</h4>
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && !erro && plantoes.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum plantão fixo localizado na escala.</p>
        </div>
      )}

      {/* Tabela de Resultados */}
      {!loading && !erro && plantoes.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4 w-12 text-center">#</th>
                  <th scope="col" className="px-6 py-4">Unidade Hospitalar</th>
                  <th scope="col" className="px-6 py-4">Residente Escalado</th>
                  <th scope="col" className="px-6 py-4 text-right pr-12 w-56">Plantões Semanais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {plantoes.map((item, index) => {
                  // Mapeia de forma segura aceitando 'nome' ou 'residente' baseado no retorno
                  const nomeResidente = item.nome || (item as any).residente || "Não identificado";
                  const nomeUnidade = item.unidade || "Unidade Geral";

                  return (
                    <tr key={index} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 text-center whitespace-nowrap text-neutral-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-neutral-400" />
                          <span className="font-medium text-neutral-900">{nomeUnidade}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-neutral-400" />
                          <span>{nomeResidente}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-neutral-900 pr-12">
                        <div className="flex items-center justify-end gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{item.qtd_plantoes_semanais}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Total de combinações em escala: {plantoes.length}
          </div>
        </div>
      )}
    </div>
  );
}