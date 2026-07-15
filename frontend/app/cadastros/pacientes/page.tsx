'use client';

import { useState } from 'react';
import { UserPlus, ShieldAlert, CheckCircle, Save } from 'lucide-react';
import { criarPaciente } from '../../../services/api';

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

export default function CadastrarPacientePage() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    num_convenio: '',
    alergias: '',
    grupo_sanguineo: '',
    is_flamengo: false // Padrão do backend
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    setLoading(true);
    setErro(null);
    setSucesso(false);

    try {
      await criarPaciente({
        nome: formData.nome,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        telefone: formData.telefone || undefined,
        is_flamengo: formData.is_flamengo,
        num_convenio: formData.num_convenio || undefined,
        alergias: formData.alergias || undefined,
        grupo_sanguineo: formData.grupo_sanguineo || undefined,
      });

      setSucesso(true);
      setFormData({ nome: '', cpf: '', data_nascimento: '', telefone: '', num_convenio: '', alergias: '', grupo_sanguineo: '', is_flamengo: false });
    } catch (err: any) {
      let mensagem = err.message;
      const msgLower = mensagem.toLowerCase();

      // Tratamento amigável para erros de CPF: duplicidade (UNIQUE) ou formato inválido (CHECK)
      if (msgLower.includes('cpf')) {
        if (msgLower.includes('unique')) {
          mensagem = 'Este CPF já está cadastrado no sistema.';
        } else if (msgLower.includes('check constraint')) {
          mensagem = 'CPF em formato inválido. Verifique se digitou corretamente (ex: 000.000.000-00).';
        }
      }

      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Novo Paciente</h1>
          <UserPlus className="h-6 w-6 text-neutral-500" />
        </div>
        <p className="text-sm text-neutral-500 mt-1">Cadastro de paciente do hospital.</p>
      </div>

      {/* Feedbacks Visuais */}
      {sucesso && (
        <div className="flex gap-3 items-start border border-green-200 bg-green-50 p-4 rounded-xl text-green-800 transition-all">
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
          <div>
            <h4 className="font-semibold text-sm">Sucesso!</h4>
            <p className="text-xs text-green-700">O paciente foi cadastrado com sucesso no sistema.</p>
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

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="border border-neutral-200 rounded-xl bg-white shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Nome Completo *</label>
            <input required type="text" name="nome" value={formData.nome} onChange={handleChange} 
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

        <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Convênio</label>
            <input type="text" name="num_convenio" value={formData.num_convenio} onChange={handleChange} placeholder="Ex: UNIMED-123" 
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Grupo Sanguíneo</label>
            <select
              name="grupo_sanguineo"
              value={formData.grupo_sanguineo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition"
            >
              <option value="">Selecione</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-3">
            <label className="text-sm font-medium text-neutral-700">Alergias</label>
            <input type="text" name="alergias" value={formData.alergias} onChange={handleChange} placeholder="Ex: Dipirona, Amendoim" 
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 transition" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50">
            {loading ? <span className="animate-pulse">Salvando...</span> : <><Save className="h-4 w-4" /> Cadastrar Paciente</>}
          </button>
        </div>
      </form>
    </div>
  );
}