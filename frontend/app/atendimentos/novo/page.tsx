'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import {
  buscarPacientes,
  buscarProfissionais,
  criarAtendimentoCompleto,
  listarProcedimentos,
  PacienteGeral,
  ProcedimentoBase,
  ProfissionalGeral,
} from '@/services/api';

interface AtendimentoForm {
  data_hora: string;
  duracao_minutos: string;
  id_paciente: string;
  id_residente: string;
  id_preceptor: string;
}

interface ProcedimentoForm {
  id_procedimento: string;
  quantidade: string;
  tempo_real_minutos: string;
  faturado: boolean;
  observacao: string;
  data_hora_inicio: string;
}

const criarLinhaProcedimento = (): ProcedimentoForm => ({
  id_procedimento: '',
  quantidade: '1',
  tempo_real_minutos: '',
  faturado: false,
  observacao: '',
  data_hora_inicio: '',
});

function mensagemDoErro(erro: unknown) {
  return erro instanceof Error && erro.message
    ? erro.message
    : 'Não foi possível registrar o atendimento.';
}

function normalizarDataLocal(valor: string) {
  return valor.length === 16 ? `${valor}:00` : valor;
}

export default function NovoAtendimentoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AtendimentoForm>({
    data_hora: '',
    duracao_minutos: '',
    id_paciente: '',
    id_residente: '',
    id_preceptor: '',
  });
  const [procedimentos, setProcedimentos] = useState<ProcedimentoForm[]>([
    criarLinhaProcedimento(),
  ]);
  const [pacientes, setPacientes] = useState<PacienteGeral[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalGeral[]>([]);
  const [catalogo, setCatalogo] = useState<ProcedimentoBase[]>([]);
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    Promise.all([
      buscarPacientes(),
      buscarProfissionais(),
      listarProcedimentos(),
    ])
      .then(([pacientesRecebidos, profissionaisRecebidos, procedimentosRecebidos]) => {
        if (ativo) {
          setPacientes(pacientesRecebidos);
          setProfissionais(profissionaisRecebidos);
          setCatalogo(procedimentosRecebidos);
        }
      })
      .catch((erroConsulta: unknown) => {
        if (ativo) {
          setErro(mensagemDoErro(erroConsulta));
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregandoOpcoes(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  const residentes = useMemo(
    () => profissionais.filter((profissional) => profissional.papel === 'Residente'),
    [profissionais],
  );
  const preceptores = useMemo(
    () => profissionais.filter((profissional) => profissional.papel === 'Preceptor'),
    [profissionais],
  );
  const tempoTotalProcedimentos = procedimentos.reduce(
    (total, procedimento) => total + Number(procedimento.tempo_real_minutos || 0),
    0,
  );

  const atualizarAtendimento = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = evento.target;
    setFormData((atual) => ({ ...atual, [name]: value }));
  };

  const atualizarProcedimento = <K extends keyof ProcedimentoForm>(
    indice: number,
    campo: K,
    valor: ProcedimentoForm[K],
  ) => {
    setProcedimentos((atuais) =>
      atuais.map((procedimento, indiceAtual) =>
        indiceAtual === indice
          ? { ...procedimento, [campo]: valor }
          : procedimento,
      ),
    );
  };

  const adicionarLinha = () => {
    setProcedimentos((atuais) => [...atuais, criarLinhaProcedimento()]);
  };

  const removerLinha = (indice: number) => {
    setProcedimentos((atuais) => atuais.filter((_, indiceAtual) => indiceAtual !== indice));
  };

  const validarFormulario = () => {
    if (!formData.data_hora) return 'Informe a data e a hora do atendimento.';
    if (Number(formData.duracao_minutos) <= 0) return 'A duração deve ser maior que zero.';
    if (!formData.id_paciente) return 'Selecione o paciente.';
    if (!formData.id_residente) return 'Selecione o residente.';
    if (!formData.id_preceptor) return 'Selecione o preceptor.';
    if (procedimentos.length === 0) return 'Adicione ao menos um procedimento.';

    const ids = procedimentos.map((procedimento) => procedimento.id_procedimento);
    if (ids.some((id) => !id)) return 'Selecione todos os procedimentos.';
    if (new Set(ids).size !== ids.length) return 'Não repita o mesmo procedimento.';
    if (procedimentos.some((procedimento) => Number(procedimento.quantidade) <= 0)) {
      return 'A quantidade dos procedimentos deve ser maior que zero.';
    }
    if (procedimentos.some((procedimento) => Number(procedimento.tempo_real_minutos) <= 0)) {
      return 'O tempo dos procedimentos deve ser maior que zero.';
    }
    if (tempoTotalProcedimentos > Number(formData.duracao_minutos)) {
      return 'A soma do tempo dos procedimentos não pode exceder a duração do atendimento.';
    }

    const inicioAtendimento = new Date(formData.data_hora).getTime();
    const inicioInvalido = procedimentos.some(
      (procedimento) =>
        procedimento.data_hora_inicio
        && new Date(procedimento.data_hora_inicio).getTime() < inicioAtendimento,
    );
    if (inicioInvalido) {
      return 'O início de um procedimento não pode ser anterior ao atendimento.';
    }

    return null;
  };

  const enviarFormulario = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro(null);

    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setSalvando(true);
      const resposta = await criarAtendimentoCompleto({
        data_hora: normalizarDataLocal(formData.data_hora),
        duracao_minutos: Number(formData.duracao_minutos),
        id_paciente: Number(formData.id_paciente),
        id_residente: Number(formData.id_residente),
        id_preceptor: Number(formData.id_preceptor),
        procedimentos: procedimentos.map((procedimento) => ({
          id_procedimento: Number(procedimento.id_procedimento),
          quantidade: Number(procedimento.quantidade),
          tempo_real_minutos: Number(procedimento.tempo_real_minutos),
          faturado: procedimento.faturado,
          observacao: procedimento.observacao.trim() || undefined,
          data_hora_inicio: procedimento.data_hora_inicio
            ? normalizarDataLocal(procedimento.data_hora_inicio)
            : undefined,
        })),
      });

      alert(
        `Atendimento #${resposta.id_atendimento} registrado com ${resposta.procedimentos_registrados} procedimento(s).`,
      );
      router.push(`/atendimentos/${resposta.id_atendimento}/procedimentos`);
    } catch (erroEnvio: unknown) {
      setErro(mensagemDoErro(erroEnvio));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
          Novo Atendimento Completo
          <FileText className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          O atendimento e seus procedimentos serão registrados juntos em uma única transação.
        </p>
      </div>

      {erro && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-sm">
          {erro}
        </div>
      )}

      <form onSubmit={enviarFormulario} className="space-y-6">
        <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-neutral-900">Dados do atendimento</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Selecione os registros existentes para evitar erros de identificação.
            </p>
          </div>

          {carregandoOpcoes && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Carregando pacientes, profissionais e procedimentos...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="space-y-2 text-sm font-medium text-neutral-600">
              Data e hora de chegada *
              <input
                type="datetime-local"
                name="data_hora"
                value={formData.data_hora}
                onChange={atualizarAtendimento}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-neutral-900 outline-none focus:border-neutral-400"
                required
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-neutral-600">
              Duração total (minutos) *
              <input
                type="number"
                name="duracao_minutos"
                min="1"
                value={formData.duracao_minutos}
                onChange={atualizarAtendimento}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-neutral-900 outline-none focus:border-neutral-400"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <label className="space-y-2 text-sm font-medium text-neutral-600">
              Paciente *
              <select
                name="id_paciente"
                value={formData.id_paciente}
                onChange={atualizarAtendimento}
                disabled={carregandoOpcoes}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-400 disabled:opacity-60"
                required
              >
                <option value="">Selecione</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id_pessoa} value={paciente.id_pessoa}>
                    {paciente.nome} — #{paciente.id_pessoa}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-neutral-600">
              Residente *
              <select
                name="id_residente"
                value={formData.id_residente}
                onChange={atualizarAtendimento}
                disabled={carregandoOpcoes}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-400 disabled:opacity-60"
                required
              >
                <option value="">Selecione</option>
                {residentes.map((residente) => (
                  <option key={residente.id_pessoa} value={residente.id_pessoa}>
                    {residente.nome} — #{residente.id_pessoa}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-neutral-600">
              Preceptor *
              <select
                name="id_preceptor"
                value={formData.id_preceptor}
                onChange={atualizarAtendimento}
                disabled={carregandoOpcoes}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-400 disabled:opacity-60"
                required
              >
                <option value="">Selecione</option>
                {preceptores.map((preceptor) => (
                  <option key={preceptor.id_pessoa} value={preceptor.id_pessoa}>
                    {preceptor.nome} — #{preceptor.id_pessoa}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-neutral-900">Procedimentos realizados</h2>
              <p className="text-xs text-neutral-500 mt-1">
                O horário de início permite calcular o tempo de espera por unidade.
              </p>
            </div>
            <button
              type="button"
              onClick={adicionarLinha}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Plus className="h-4 w-4" />
              Adicionar procedimento
            </button>
          </div>

          <div className="space-y-4">
            {procedimentos.map((procedimento, indice) => (
              <div
                key={indice}
                className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-800">
                    Procedimento {indice + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removerLinha(indice)}
                    disabled={procedimentos.length === 1}
                    className="p-2 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={`Remover procedimento ${indice + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <label className="md:col-span-2 space-y-2 text-sm font-medium text-neutral-600">
                    Procedimento *
                    <select
                      value={procedimento.id_procedimento}
                      onChange={(evento) =>
                        atualizarProcedimento(indice, 'id_procedimento', evento.target.value)
                      }
                      disabled={carregandoOpcoes}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-400"
                      required
                    >
                      <option value="">Selecione</option>
                      {catalogo.map((itemCatalogo) => (
                        <option
                          key={itemCatalogo.id_procedimento}
                          value={itemCatalogo.id_procedimento}
                          disabled={procedimentos.some(
                            (outro, outroIndice) =>
                              outroIndice !== indice
                              && outro.id_procedimento === String(itemCatalogo.id_procedimento),
                          )}
                        >
                          {itemCatalogo.nome} — risco {itemCatalogo.nivel_risco}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-neutral-600">
                    Quantidade *
                    <input
                      type="number"
                      min="1"
                      value={procedimento.quantidade}
                      onChange={(evento) =>
                        atualizarProcedimento(indice, 'quantidade', evento.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-400"
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-neutral-600">
                    Tempo (min) *
                    <input
                      type="number"
                      min="1"
                      value={procedimento.tempo_real_minutos}
                      onChange={(evento) =>
                        atualizarProcedimento(indice, 'tempo_real_minutos', evento.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-400"
                      required
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-2 text-sm font-medium text-neutral-600">
                    Início do procedimento
                    <input
                      type="datetime-local"
                      value={procedimento.data_hora_inicio}
                      min={formData.data_hora || undefined}
                      onChange={(evento) =>
                        atualizarProcedimento(indice, 'data_hora_inicio', evento.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-400"
                    />
                    <span className="block text-xs font-normal text-neutral-400">
                      Em branco, será usado o horário de chegada.
                    </span>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-neutral-600">
                    Observação
                    <textarea
                      value={procedimento.observacao}
                      onChange={(evento) =>
                        atualizarProcedimento(indice, 'observacao', evento.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-400 resize-none"
                    />
                  </label>
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={procedimento.faturado}
                    onChange={(evento) =>
                      atualizarProcedimento(indice, 'faturado', evento.target.checked)
                    }
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  Procedimento já faturado
                </label>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-neutral-200 pt-5">
            <p className="text-sm text-neutral-600">
              Tempo dos procedimentos:{' '}
              <strong className="text-neutral-900">{tempoTotalProcedimentos} min</strong>
              {' / '}
              {Number(formData.duracao_minutos || 0)} min do atendimento
            </p>
            <button
              type="submit"
              disabled={salvando || carregandoOpcoes}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {salvando ? 'Registrando...' : 'Registrar atendimento completo'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
