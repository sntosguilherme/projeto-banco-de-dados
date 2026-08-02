'use client';

import { AlertTriangle, Building2, Clock, RefreshCw } from 'lucide-react';
import { useConsulta } from '../../../hooks/use-consulta';
import {
  buscarTempoMedioEsperaPorUnidade,
  TempoMedioEsperaUnidade,
} from '../../../services/api';

function formatarTempo(minutos: number) {
  if (minutos < 60) {
    return `${minutos.toFixed(2)} min`;
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = Math.round(minutos % 60);
  return `${horas}h ${minutosRestantes}min`;
}

export default function TempoEsperaUnidadePage() {
  const { dados: unidades, loading, erro, atualizar } =
    useConsulta<TempoMedioEsperaUnidade>(
      buscarTempoMedioEsperaPorUnidade,
      'Não foi possível calcular o tempo médio de espera.',
    );

  const maiorTempo = Math.max(
    ...unidades.map((unidade) => unidade.tempo_medio_espera_minutos),
    1,
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Tempo Médio de Espera por Unidade
            </h1>
            <Clock className="h-6 w-6 text-neutral-500 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Intervalo médio entre a chegada do paciente e o início do primeiro procedimento.
          </p>
        </div>
        <button
          type="button"
          onClick={atualizar}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recalcular
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">
            Calculando o tempo de espera nas unidades...
          </p>
        </div>
      )}

      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-semibold text-sm">Erro ao executar o cálculo</h2>
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        </div>
      )}

      {!loading && !erro && unidades.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Ainda não há dados de espera calculáveis.</p>
          <p className="text-xs text-neutral-400 mt-1">
            Registre o horário de início dos procedimentos para alimentar este indicador.
          </p>
        </div>
      )}

      {!loading && !erro && unidades.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="divide-y divide-neutral-200">
            {unidades.map((unidade) => {
              const largura = Math.max(
                2,
                (unidade.tempo_medio_espera_minutos / maiorTempo) * 100,
              );

              return (
                <div key={unidade.unidade} className="p-5 hover:bg-neutral-50/50">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-neutral-500" />
                      <span className="font-medium text-neutral-900">{unidade.unidade}</span>
                    </div>
                    <span className="font-mono font-semibold text-neutral-900 whitespace-nowrap">
                      {formatarTempo(unidade.tempo_medio_espera_minutos)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${Math.min(largura, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Unidades avaliadas: {unidades.length}
          </div>
        </div>
      )}
    </div>
  );
}
