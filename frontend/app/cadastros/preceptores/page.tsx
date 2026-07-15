'use client';

import { useState } from 'react';
import { UserPlus, ShieldAlert, CheckCircle, Save } from 'lucide-react';

function formatarCpf(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);

  if (digitos.length <= 2) {
    return digitos.length ? `(${digitos}` : '';
  }

  if (digitos.length <= 6) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }

  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export default function CadastrarPreceptorPage() {
  const [formData, setFormData] = useState({
    nome: '', cpf: '', data_nascimento: '', telefone: '', is_flamengo: false,
    crm: '', especialidade: '', data_admissao: '', titulacao: ''
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      setFormData({ ...formData, cpf: formatarCpf(value) });
      return;
    }

    if (name === 'telefone') {
      setFormData({ ...formData, telefone: formatarTelefone(value) });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErro(null); setSucesso(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/preceptores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erro ao cadastrar preceptor.');
      }

      setSucesso(true);
      setFormData({ nome: '', cpf: '', data_nascimento: '', telefone: '', is_flamengo: false, crm: '', especialidade: '', data_admissao: '', titulacao: '' });
    } catch (err: any) {
      let mensagem = err.message;
      const msgLower = mensagem.toLowerCase();

      if (msgLower.includes('cpf')) {
        if (msgLower.includes('unique')) {
          mensagem = 'Este CPF já está cadastrado no sistema.';
        } else if (msgLower.includes('check constraint')) {
          mensagem = 'CPF em formato inválido. Verifique se digitou corretamente (ex: 000.000.000-00).';
        }
      } else if (msgLower.includes('crm') && msgLower.includes('unique')) {
        mensagem = 'Este CRM já pertence a outro profissional no sistema.';
      }

      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Novo Preceptor</h1>
          <UserPlus className="h-6 w-6 text-neutral-500" />
        </div>
        <p className="text-sm text-neutral-500 mt-1">Cadastro de médico supervisor (Preceptor).</p>
      </div>

      {sucesso && (
        <div className="flex gap-3 items-start border border-green-200 bg-green-50 p-4 rounded-xl text-green-800 transition-all">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
          <div>
            <h4 className="font-semibold text-sm">Sucesso!</h4>
            <p className="text-xs text-green-700">Preceptor cadastrado com sucesso.</p>
          </div>
        </div>
      )}

      {erro && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800 transition-all">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
          <div>
            <h4 className="font-semibold text-sm">Atenção</h4>
            <p className="text-xs text-red-700">{erro}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border border-neutral-200 rounded-xl bg-white shadow-sm p-6 space-y-6">
        {/* Dados Pessoais */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">Nome Completo *</label>
              <input required type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: João Souza"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">CPF *</label>
              <input required type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition font-mono" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">Data de Nascimento *</label>
              <input required type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} 
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">Telefone</label>
              <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition" 
              />
            </div>
          </div>
        </div>

        {/* Dados Profissionais */}
        <div className="pt-4 border-t border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wider">Dados Profissionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">CRM *</label>
              <input required type="text" name="crm" value={formData.crm} onChange={handleChange} placeholder="Ex: CRM-PB-123"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">Especialidade *</label>
              <input required type="text" name="especialidade" value={formData.especialidade} onChange={handleChange} placeholder="Ex: Cirurgia Geral"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">Data de Admissão *</label>
              <input required type="date" name="data_admissao" value={formData.data_admissao} onChange={handleChange} 
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">Titulação *</label>
              <input required type="text" name="titulacao" value={formData.titulacao} onChange={handleChange} placeholder="Ex: Mestre, Doutor" 
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50">
            {loading ? <span className="animate-pulse">Salvando...</span> : <><Save className="h-4 w-4" /> Cadastrar Preceptor</>}
          </button>
        </div>
      </form>
    </div>
  );
}