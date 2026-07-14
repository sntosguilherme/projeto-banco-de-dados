'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Save } from 'lucide-react';
import { criarAtendimento, CriarAtendimentoInput } from '@/services/api';

export default function NovoAtendimentoPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<CriarAtendimentoInput>({
    data_hora: '',
    duracao_minutos: 0,
    id_paciente: 0,
    id_residente: 0,
    id_preceptor: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const validarFormulario = (): string | null => {
    if (!formData.data_hora) return 'A data e hora do atendimento são obrigatórias.';
    if (formData.duracao_minutos <= 0) return 'A duração deve ser maior que zero.';
    if (formData.id_paciente <= 0) return 'ID do paciente inválido.';
    if (formData.id_residente <= 0) return 'ID do residente inválido.';
    if (formData.id_preceptor <= 0) return 'ID do preceptor inválido.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validacaoErro = validarFormulario();
    if (validacaoErro) {
      setError(validacaoErro);
      return;
    }

    try {
      setLoading(true);
      
      const response = await criarAtendimento({
        ...formData,
        data_hora: new Date(formData.data_hora).toISOString()
      });
      
      alert(`Atendimento registrado com sucesso! ID: #${response.id_atendimento}`);
      router.push(`/atendimentos/${response.id_atendimento}/procedimentos`);
    } catch (err: any) {
      let msgErro = err.message || 'Erro desconhecido ao tentar salvar.';
      if (msgErro.includes('paciente') && msgErro.includes('not found')) {
        msgErro = 'O paciente informado não foi encontrado. Verifique o ID.';
      } else if (msgErro.includes('residente') && msgErro.includes('not found')) {
        msgErro = 'O residente informado não foi encontrado. Verifique o ID.';
      } else if (msgErro.includes('preceptor') && msgErro.includes('not found')) {
        msgErro = 'O preceptor informado não foi encontrado. Verifique o ID.';
      }
      setError(msgErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-neutral-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
          Novo Atendimento
          <FileText className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Cadastro de atendimento hospitalar.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="data_hora" className="text-sm font-medium text-neutral-600">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                id="data_hora"
                name="data_hora"
                value={formData.data_hora}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-neutral-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="duracao_minutos" className="text-sm font-medium text-neutral-600">
                Duração (minutos) *
              </label>
              <input
                type="number"
                id="duracao_minutos"
                name="duracao_minutos"
                min="1"
                value={formData.duracao_minutos || ''}
                onChange={handleChange}
                placeholder="Ex: 45"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-neutral-400 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="id_paciente" className="text-sm font-medium text-neutral-600">
                ID do Paciente *
              </label>
              <input
                type="number"
                id="id_paciente"
                name="id_paciente"
                min="1"
                value={formData.id_paciente || ''}
                onChange={handleChange}
                placeholder="Ex: 1"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-neutral-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="id_residente" className="text-sm font-medium text-neutral-600">
                ID do Residente *
              </label>
              <input
                type="number"
                id="id_residente"
                name="id_residente"
                min="1"
                value={formData.id_residente || ''}
                onChange={handleChange}
                placeholder="Ex: 2"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-neutral-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="id_preceptor" className="text-sm font-medium text-neutral-600">
                ID do Preceptor *
              </label>
              <input
                type="number"
                id="id_preceptor"
                name="id_preceptor"
                min="1"
                value={formData.id_preceptor || ''}
                onChange={handleChange}
                placeholder="Ex: 3"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 outline-none focus:border-neutral-400 transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                loading 
                  ? 'bg-neutral-500 cursor-not-allowed' 
                  : 'bg-neutral-900 hover:bg-neutral-800'
              }`}
            >
              {loading ? 'Salvando...' : (
                <>
                  <Save className="w-4 h-4" />
                  Registrar Atendimento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}