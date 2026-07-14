'use client';

import { useState, useEffect } from 'react';
import { buscarTempoMedioPorResidente } from '../../../services/api';
import { Clock, User, Award, RefreshCw, Search, ShieldAlert, TrendingUp } from 'lucide-react';

// Interface para estruturar o retorno do cálculo analítico
interface TempoMedioResidente {
  nome_residente: string;
  ano_residencia: string;
  tempo_medio_atendimento: number;
}

export default function TempoMedioAtendimentoPage() {
  const [metricas, setMetricas] = useState<TempoMedioResidente[]>([]);
  const [filtro, setFiltro] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarMetricas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await buscarTempoMedioPorResidente();
      // Garante que os dados sejam tratados como um array da interface proposta
      setMetricas(dados || []);
    } catch (err: any) {
      console.error('Erro ao buscar tempo médio:', err);
      setErro(err.message || 'Não foi possível carregar as métricas de tempo médio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMetricas();
  }, []);

const metricasFiltradas = metricas.filter(item =>
  item.nome_residente?.toLowerCase().includes(filtro.toLowerCase()) 
);

  // Helper para formatar visualmente a duração
  const formatarMinutos = (minutos: number) => {
    const minArredondado = Math.round(minutos);
    if (minArredondado < 60) {
      return `${minArredondado} min`;
    }
    const horas = Math.floor(minArredondado / 60);
    const minsRestantes = minArredondado % 60;
    return minsRestantes > 0 ? `${horas}h ${minsRestantes}m` : `${horas}h`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              Tempo Médio de Atendimento
            </h1>
            <Clock className="h-6 w-6 text-neutral-500 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Análise de performance e tempo de atendimento por médico residente.
          </p>
        </div>
        <button
          onClick={carregarMetricas}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Métricas
        </button>
      </div>

      {/* Filtro Rápido */}
      {!erro && !loading && metricas.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Filtrar por residente"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition"
          />
        </div>
      )}

      {/* Estado de Carregamento */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">Calculando tempo médio de atendimento por residente...</p>
        </div>
      )}

      {/* Estado de Erro */}
      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Erro na API (Métricas / Tempo Médio)</h4>
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && !erro && metricasFiltradas.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum registro de tempo médio encontrado.</p>
        </div>
      )}

      {/* Grid de Cards & Tabela */}
      {!loading && !erro && metricasFiltradas.length > 0 && (
        <div className="space-y-6">
          {/* Tabela de Resultados */}
          <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th scope="col" className="px-6 py-4">Residente</th>
                    <th scope="col" className="px-6 py-4 w-32 text-center">Ano Residência</th>
                    <th scope="col" className="px-6 py-4 w-44 text-right">Tempo Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {metricasFiltradas.map((item, index) => (
                    <tr key={index} className="hover:bg-neutral-50/50 transition-colors">
                      {/* Nome do Residente */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-neutral-100 text-neutral-700 p-1.5 rounded-md">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-neutral-900">{item.nome_residente}</span>
                        </div>
                      </td>

                      {/* Ano de Residência */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                          <Award className="h-3 w-3 text-neutral-500" />
                          {item.ano_residencia}º Ano
                        </span>
                      </td>

                      {/* Tempo Médio Formatado */}
                      <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                        <div className="flex items-center justify-end gap-1.5 text-neutral-900">
                          <Clock className="h-4 w-4 text-neutral-400" />
                          <span className="font-mono">{formatarMinutos(item.tempo_medio_atendimento)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium flex items-center justify-between">
              <span>Total de residentes avaliados: {metricasFiltradas.length}</span>
              <span className="flex items-center gap-1 text-neutral-600">
                <TrendingUp className="h-3.5 w-3.5 text-neutral-500" />
                Métricas atualizadas em tempo real
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}