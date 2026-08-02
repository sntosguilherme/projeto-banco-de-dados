'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useConsulta } from '@/hooks/use-consulta';
import {
  buscarProfissionais,
  DiaSemana,
  ProfissionalGeral,
  reajustarEscala,
  ReajustarEscalaOut,
  Turno,
} from '@/services/api';

const dias: { valor: DiaSemana; rotulo: string }[] = [
  { valor: 'Segunda', rotulo: 'Segunda-feira' },
  { valor: 'Terca', rotulo: 'Terça-feira' },
  { valor: 'Quarta', rotulo: 'Quarta-feira' },
  { valor: 'Quinta', rotulo: 'Quinta-feira' },
  { valor: 'Sexta', rotulo: 'Sexta-feira' },
  { valor: 'Sabado', rotulo: 'Sábado' },
  { valor: 'Domingo', rotulo: 'Domingo' },
];

const turnos: { valor: Turno; rotulo: string }[] = [
  { valor: 'Manha', rotulo: 'Manhã' },
  { valor: 'Tarde', rotulo: 'Tarde' },
  { valor: 'Noite', rotulo: 'Noite' },
];

function mensagemDoErro(erro: unknown) {
  return erro instanceof Error && erro.message
    ? erro.message
    : 'Não foi possível reajustar a escala.';
}

export default function ReajusteEscalaPage() {
  const {
    dados: profissionais,
    loading: carregandoProfissionais,
    erro: erroProfissionais,
  } = useConsulta<ProfissionalGeral>(
    buscarProfissionais,
    'Não foi possível carregar os residentes.',
  );
  const [idResidente, setIdResidente] = useState('');
  const [diaOrigem, setDiaOrigem] = useState<DiaSemana>('Segunda');
  const [turnoOrigem, setTurnoOrigem] = useState<Turno>('Manha');
  const [diaDestino, setDiaDestino] = useState<DiaSemana>('Terca');
  const [turnoDestino, setTurnoDestino] = useState<Turno>('Manha');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ReajustarEscalaOut | null>(null);

  const residentes = useMemo(
    () => profissionais.filter((profissional) => profissional.papel === 'Residente'),
    [profissionais],
  );

  const enviarReajuste = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro(null);
    setResultado(null);

    if (!idResidente) {
      setErro('Selecione o residente.');
      return;
    }
    if (diaOrigem === diaDestino && turnoOrigem === turnoDestino) {
      setErro('A escala de destino deve ser diferente da escala de origem.');
      return;
    }

    try {
      setEnviando(true);
      setResultado(
        await reajustarEscala({
          id_residente: Number(idResidente),
          dia_origem: diaOrigem,
          turno_origem: turnoOrigem,
          dia_destino: diaDestino,
          turno_destino: turnoDestino,
        }),
      );
    } catch (erroEnvio: unknown) {
      setErro(mensagemDoErro(erroEnvio));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Reajuste de Escala
          </h1>
          <CalendarClock className="h-6 w-6 text-neutral-500" />
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          Transfira as escalas de um residente entre dias e turnos, preservando conflitos existentes.
        </p>
      </div>

      {(erro || erroProfissionais) && (
        <div className="flex gap-3 items-start border border-red-200 bg-red-50 p-4 rounded-xl text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">{erro || erroProfissionais}</p>
        </div>
      )}

      {resultado && (
        <div className="flex gap-3 items-start border border-emerald-200 bg-emerald-50 p-4 rounded-xl text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold">{resultado.detail}</h2>
            <p className="text-xs mt-1">
              {resultado.escalas_reajustadas} de {resultado.escalas_encontradas} escala(s) reajustada(s).
              {resultado.conflitos_ignorados > 0
                ? ` ${resultado.conflitos_ignorados} conflito(s) foi(ram) preservado(s).`
                : ''}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 items-start border border-sky-200 bg-sky-50 p-4 rounded-xl text-sky-800">
        <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          Sobreposições no mesmo dia e turno são bloqueadas automaticamente pelo trigger do banco.
        </p>
      </div>

      <form
        onSubmit={enviarReajuste}
        className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6"
      >
        <label className="block space-y-2 text-sm font-medium text-neutral-600">
          Residente *
          <select
            value={idResidente}
            onChange={(evento) => setIdResidente(evento.target.value)}
            disabled={carregandoProfissionais}
            className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none focus:border-neutral-400 disabled:opacity-60"
            required
          >
            <option value="">
              {carregandoProfissionais ? 'Carregando residentes...' : 'Selecione'}
            </option>
            {residentes.map((residente) => (
              <option key={residente.id_pessoa} value={residente.id_pessoa}>
                {residente.nome} — #{residente.id_pessoa}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <fieldset className="rounded-lg border border-neutral-200 p-4 space-y-4">
            <legend className="px-2 text-sm font-semibold text-neutral-800">Escala de origem</legend>
            <label className="block space-y-2 text-sm font-medium text-neutral-600">
              Dia
              <select
                value={diaOrigem}
                onChange={(evento) => setDiaOrigem(evento.target.value as DiaSemana)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900"
              >
                {dias.map((dia) => (
                  <option key={dia.valor} value={dia.valor}>{dia.rotulo}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm font-medium text-neutral-600">
              Turno
              <select
                value={turnoOrigem}
                onChange={(evento) => setTurnoOrigem(evento.target.value as Turno)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900"
              >
                {turnos.map((turno) => (
                  <option key={turno.valor} value={turno.valor}>{turno.rotulo}</option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset className="rounded-lg border border-neutral-200 p-4 space-y-4">
            <legend className="px-2 text-sm font-semibold text-neutral-800">Escala de destino</legend>
            <label className="block space-y-2 text-sm font-medium text-neutral-600">
              Dia
              <select
                value={diaDestino}
                onChange={(evento) => setDiaDestino(evento.target.value as DiaSemana)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900"
              >
                {dias.map((dia) => (
                  <option key={dia.valor} value={dia.valor}>{dia.rotulo}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm font-medium text-neutral-600">
              Turno
              <select
                value={turnoDestino}
                onChange={(evento) => setTurnoDestino(evento.target.value as Turno)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900"
              >
                {turnos.map((turno) => (
                  <option key={turno.valor} value={turno.valor}>{turno.rotulo}</option>
                ))}
              </select>
            </label>
          </fieldset>
        </div>

        <div className="flex justify-end border-t border-neutral-200 pt-5">
          <button
            type="submit"
            disabled={enviando || carregandoProfissionais}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50"
          >
            {enviando && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {enviando ? 'Reajustando...' : 'Confirmar reajuste'}
          </button>
        </div>
      </form>
    </div>
  );
}
