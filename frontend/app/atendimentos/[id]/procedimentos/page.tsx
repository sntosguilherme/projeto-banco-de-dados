'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Plus, Activity, AlertCircle, FileText, Trash2 } from 'lucide-react';
import { 
  listarProcedimentosDoAtendimento, 
  adicionarProcedimento,
  removerProcedimento,
  ProcedimentoAtendimento
} from '@/services/api';

export default function ProcedimentosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const atendimentoId = parseInt(id, 10);

  const [procedimentos, setProcedimentos] = useState<ProcedimentoAtendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id_procedimento: '',
    quantidade: 1,
    tempo_real_minutos: 0,
    observacao: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const carregarProcedimentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarProcedimentosDoAtendimento(atendimentoId);
      setProcedimentos(data);
    } catch (err: any) {
      if (err.message?.includes('404')) {
        setError('Atendimento não encontrado. Verifique se o ID está correto.');
      } else {
        setError(err.message || 'Erro ao carregar os procedimentos.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProcedimentos();
  }, [atendimentoId]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleAddProcedimento = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.id_procedimento) {
      setFormError('Informe o ID do procedimento.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adicionarProcedimento(atendimentoId, {
        id_procedimento: Number(formData.id_procedimento),
        quantidade: formData.quantidade,
        tempo_real_minutos: formData.tempo_real_minutos,
        observacao: formData.observacao || undefined
      });
      
      setFormData({
        id_procedimento: '',
        quantidade: 1,
        tempo_real_minutos: 0,
        observacao: ''
      });
      await carregarProcedimentos();
    } catch (err: any) {
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('409') || msg.includes('already') || msg.includes('já cadastrado')) {
        setFormError('Este procedimento já está registrado neste atendimento.');
      } else if (msg.includes('404')) {
        setFormError('Procedimento não encontrado. Verifique o ID do procedimento.');
      } else {
        setFormError(err.message || 'Erro ao adicionar o procedimento.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveProcedimento = async (idProcedimento: number) => {
    if (!confirm('Tem certeza que deseja remover este procedimento?')) return;
    
    try {
      await removerProcedimento(atendimentoId, idProcedimento);
      await carregarProcedimentos();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover procedimento');
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-red-50 text-red-600 p-8 rounded-xl border border-red-100 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">Ops! Algo deu errado.</h2>
          <p className="mb-6 text-sm">{error}</p>
          <Link 
            href="/atendimentos"
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            Voltar para Atendimentos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-neutral-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
          Procedimentos do Atendimento
          <Activity className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Gerencie os procedimentos realizados para o atendimento #{atendimentoId}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulário de Adicionar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 sticky top-24">
            <h2 className="text-base font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <Plus className="w-4 h-4 text-neutral-500" />
              Novo Procedimento
            </h2>

            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddProcedimento} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600">ID do Procedimento *</label>
                <input
                  type="number"
                  name="id_procedimento"
                  value={formData.id_procedimento}
                  onChange={handleFormChange}
                  placeholder="Ex: 102"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-neutral-400 transition-all text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-600">Quantidade *</label>
                  <input
                    type="number"
                    name="quantidade"
                    min="1"
                    value={formData.quantidade}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-neutral-400 transition-all text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-600">Tempo (min) *</label>
                  <input
                    type="number"
                    name="tempo_real_minutos"
                    min="0"
                    value={formData.tempo_real_minutos}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-neutral-400 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600">Observação</label>
                <textarea
                  name="observacao"
                  value={formData.observacao}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-neutral-400 transition-all resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all mt-2 ${
                  isSubmitting 
                    ? 'bg-neutral-500 cursor-not-allowed' 
                    : 'bg-neutral-900 hover:bg-neutral-800'
                }`}
              >
                {isSubmitting ? 'Adicionando...' : 'Cadastrar Procedimento'}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Procedimentos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-white">
                    <th className="p-4 pl-6 text-xs font-bold text-neutral-500 uppercase tracking-wider">Procedimento</th>
                    <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Qtd</th>
                    <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Tempo</th>
                    <th className="p-4 pr-6 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-sm text-neutral-700">
                  {loading ? (
                    <tr key="loading">
                      <td colSpan={4} className="p-8 text-center text-neutral-500">
                        Carregando procedimentos...
                      </td>
                    </tr>
                  ) : procedimentos.length === 0 ? (
                    <tr key="empty">
                      <td colSpan={4} className="p-12 text-center text-neutral-500">
                        Nenhum procedimento registrado neste atendimento.
                      </td>
                    </tr>
                  ) : (
                    procedimentos.map((proc) => (
                      <tr key={proc.id_procedimento} className="hover:bg-neutral-50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex flex-col">
                            <span className="font-medium text-neutral-800">
                              {proc.nome_procedimento} <span className="text-neutral-400 font-normal text-xs">(ID {proc.id_procedimento})</span>
                            </span>
                            {/* @ts-ignore */}
                            {proc.observacao && (
                              <span className="text-xs text-neutral-500 mt-1 italic flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {/* @ts-ignore */}
                                {proc.observacao}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {proc.quantidade}
                        </td>
                        <td className="p-4">
                          {proc.tempo_real_minutos} min
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleRemoveProcedimento(proc.id_procedimento)}
                            className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors inline-flex"
                            title="Remover procedimento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}