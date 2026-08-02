'use client';

import { Fragment, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useConsulta } from '@/hooks/use-consulta';
import {
  AuditoriaAtendimento,
  buscarAuditoriasAtendimentos,
  OperacaoAuditoria,
} from '@/services/api';

const estilosOperacao: Record<OperacaoAuditoria, string> = {
  INSERT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-sky-50 text-sky-700 border-sky-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
};

const rotulosOperacao: Record<OperacaoAuditoria, string> = {
  INSERT: 'Inclusão',
  UPDATE: 'Alteração',
  DELETE: 'Exclusão',
};

function formatarDataHora(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleString('pt-BR');
}

function JsonAuditoria({
  titulo,
  dados,
}: {
  titulo: string;
  dados: Record<string, unknown> | null;
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
        {titulo}
      </h3>
      <pre className="max-h-64 overflow-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100 whitespace-pre-wrap break-words">
        {dados ? JSON.stringify(dados, null, 2) : 'Sem dados'}
      </pre>
    </div>
  );
}

export default function AuditoriasAtendimentosPage() {
  const { dados: auditorias, loading, erro, atualizar } =
    useConsulta<AuditoriaAtendimento>(
      buscarAuditoriasAtendimentos,
      'Não foi possível carregar a auditoria dos atendimentos.',
    );
  const [operacao, setOperacao] = useState<OperacaoAuditoria | ''>('');
  const [idAtendimento, setIdAtendimento] = useState('');
  const [auditoriaAberta, setAuditoriaAberta] = useState<number | null>(null);

  const auditoriasFiltradas = useMemo(() => {
    const id = Number(idAtendimento);
    return auditorias.filter(
      (auditoria) =>
        (!operacao || auditoria.operacao === operacao)
        && (!idAtendimento || auditoria.id_atendimento === id),
    );
  }, [auditorias, idAtendimento, operacao]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Auditoria de Atendimentos
            </h1>
            <FileText className="h-6 w-6 text-neutral-500 hidden sm:block" />
          </div>
          <p className="text-sm text-neutral-500">
            Inclusões, alterações e exclusões registradas automaticamente pelo trigger.
          </p>
        </div>
        <button
          type="button"
          onClick={atualizar}
          disabled={loading}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {!loading && !erro && auditorias.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <label className="space-y-2 text-sm font-medium text-neutral-600">
            Operação
            <select
              value={operacao}
              onChange={(evento) =>
                setOperacao(evento.target.value as OperacaoAuditoria | '')
              }
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900"
            >
              <option value="">Todas</option>
              <option value="INSERT">Inclusões</option>
              <option value="UPDATE">Alterações</option>
              <option value="DELETE">Exclusões</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-neutral-600">
            ID do atendimento
            <span className="relative block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="number"
                min="1"
                value={idAtendimento}
                onChange={(evento) => setIdAtendimento(evento.target.value)}
                placeholder="Filtrar por ID"
                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-neutral-900"
              />
            </span>
          </label>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-neutral-200 rounded-xl bg-neutral-50/50">
          <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-neutral-600">Carregando registros de auditoria...</p>
        </div>
      )}

      {erro && !loading && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-sm">Erro ao consultar a auditoria</h2>
            <p className="text-xs text-red-700 mt-1">{erro}</p>
          </div>
        </div>
      )}

      {!loading && !erro && auditoriasFiltradas.length === 0 && (
        <div className="text-center p-12 border border-dashed border-neutral-300 rounded-xl text-neutral-500">
          <p className="text-sm font-medium">Nenhum registro de auditoria encontrado.</p>
        </div>
      )}

      {!loading && !erro && auditoriasFiltradas.length > 0 && (
        <div className="overflow-hidden border border-neutral-200 rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Auditoria</th>
                  <th scope="col" className="px-6 py-4">Atendimento</th>
                  <th scope="col" className="px-6 py-4">Operação</th>
                  <th scope="col" className="px-6 py-4">Usuário do banco</th>
                  <th scope="col" className="px-6 py-4">Data e hora</th>
                  <th scope="col" className="px-6 py-4 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {auditoriasFiltradas.map((auditoria) => {
                  const aberta = auditoriaAberta === auditoria.id_auditoria;
                  return (
                    <Fragment key={auditoria.id_auditoria}>
                      <tr className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-neutral-500">
                          #{auditoria.id_auditoria}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-neutral-900">
                          #{auditoria.id_atendimento}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${estilosOperacao[auditoria.operacao]}`}>
                            {rotulosOperacao[auditoria.operacao]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-700">{auditoria.usuario}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatarDataHora(auditoria.data_hora)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setAuditoriaAberta(aberta ? null : auditoria.id_auditoria)
                            }
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                          >
                            {aberta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {aberta ? 'Ocultar' : 'Visualizar'}
                          </button>
                        </td>
                      </tr>
                      {aberta && (
                        <tr>
                          <td colSpan={6} className="bg-neutral-50 p-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <JsonAuditoria titulo="Dados anteriores" dados={auditoria.dados_antigos} />
                              <JsonAuditoria titulo="Dados novos" dados={auditoria.dados_novos} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200 text-xs text-neutral-500 font-medium">
            Registros exibidos: {auditoriasFiltradas.length} de {auditorias.length}
          </div>
        </div>
      )}
    </div>
  );
}
