'use client';

import { useState, useEffect } from 'react';
// Importa a função e a interface unificada direto do api.ts
import { buscarPreceptoresSupervisao, PreceptorSupervisao } from '../../../services/api'; 
import { CalendarDays, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export default function PreceptoresSupervisaoPage() {
  const [dadosSupervisao, setDadosSupervisao] = useState<PreceptorSupervisao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarSupervisao = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarPreceptoresSupervisao();
      setDadosSupervisao(dados);
    } catch (err: any) {
      console.error('Erro ao buscar supervisão de preceptores:', err);
      setErro(err.message || 'Não foi possível carregar o relatório de preceptores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSupervisao();
  }, []);

  // Helper para formatar a data que vem do DATE_TRUNC (ex: "2025-06-01T00:00:00" vira "junho de 2025")
  const formatarMes = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } catch (e) {
      return dataString;
    }
  };

  return (
    // Segue o padrão estrito max-w-5xl centralizado que você escolheu
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Preceptores com Alta Volumetria Mensal
          </h1>
          <p className="text-sm text-neutral-500">
            Filtro analítico exibindo apenas os preceptores que supervisionaram mais de 5 atendimentos dentro do mesmo mês corrente.
          </p>
        </div>
        <button
          onClick={carregarSupervisao}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Relatório
        </button>
      </div>

      {/* Estado de Carregamento */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">Calculando agrupamentos mensais...</p>
          <p className="text-xs text-neutral-400 mt-1">Avaliando cláusula HAVING no banco Postgres...</p>
        </div>
      )}

      {/* Estado de Erro */}
      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Erro ao processar dados agregados</h4>
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && !erro && dadosSupervisao.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum preceptor atingiu o corte de {`> 5`} atendimentos neste mês.</p>
        </div>
      )}

      {/* Tabela de Resultados */}
      {!loading && !erro && dadosSupervisao.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4 w-12 text-center">#</th>
                  <th scope="col" className="px-6 py-4">Nome do Preceptor</th>
                  <th scope="col" className="px-6 py-4 w-64">Período de Atuação</th>
                  <th scope="col" className="px-6 py-4 text-right pr-12 w-52">Total de Atendimentos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {dadosSupervisao.map((item, index) => {
                  // Fallback seguro caso mude a nomenclatura de chaves
                  const nomePreceptor = item.nome || (item as any).preceptor || "Não identificado";
                  const mesFormatado = item.mes ? formatarMes(item.mes) : "Período Geral";

                  return (
                    <tr key={index} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 text-center whitespace-nowrap text-neutral-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-neutral-500" />
                          <span className="font-medium text-neutral-900">{nomePreceptor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-500 capitalize">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-neutral-400" />
                          <span>{mesFormatado}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-neutral-900 pr-12">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {item.total_atendimentos} atendimentos
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Registros acima da média encontrados: {dadosSupervisao.length}
          </div>
        </div>
      )}
    </div>
  );
}