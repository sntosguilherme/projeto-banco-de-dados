const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL || "http://backend:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper para fazer requisições à API do backend, tratando erros de forma consistente.
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => null);
    const detalhe = erro?.detail;

    if (Array.isArray(detalhe)) {
      const mensagem = detalhe
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object") {
            const localizacao = Array.isArray(item.loc) ? item.loc.join(".") : "campo";
            const mensagemItem = item.msg || JSON.stringify(item);
            return `${localizacao}: ${mensagemItem}`;
          }

          return String(item);
        })
        .join("; ");

      throw new Error(mensagem || `Erro na requisição (${res.status})`);
    }

    if (typeof detalhe === "object" && detalhe !== null) {
      throw new Error((detalhe as { msg?: string }).msg || JSON.stringify(detalhe));
    }

    throw new Error(detalhe || `Erro na requisição (${res.status})`);
  }

  return res.json();
}

function normalizarAlergiasParaEnvio(alergias?: string | string[]) {
  if (Array.isArray(alergias)) {
    const itens = alergias.map((alergia) => alergia.trim()).filter(Boolean);
    return itens.length > 0 ? itens : undefined;
  }

  const valor = alergias?.trim();
  if (!valor) {
    return undefined;
  }

  return valor
    .split(",")
    .map((alergia) => alergia.trim())
    .filter(Boolean);
}

// =====================================================================
// 1. INTERFACES BASE E INPUTS DE FORMULÁRIO (CRUD)
// =====================================================================

export interface Pessoa {
  nome: string;
  cpf: string;
  data_nascimento: string;
  is_flamengo: boolean;
  telefone?: string;
}

export interface Paciente extends Pessoa {
  id_paciente: number;
  num_convenio?: string;
  alergias?: string;
  grupo_sanguineo?: string;
}
export type CriarPacienteInput = Pessoa & {
  num_convenio?: string;
  alergias?: string | string[];
  grupo_sanguineo?: string;
};
export type AtualizarPacienteInput = {
  num_convenio?: string;
  alergias?: string | string[];
};

export interface Profissional extends Pessoa {
  crm: string;
  data_admissao: string;
  especialidade: string;
}

export interface Residente extends Profissional {
  id_residente: number;
  ano_residencia: string;
}
export type CriarResidenteInput = Omit<Residente, 'id_residente'>;

export interface Preceptor extends Profissional {
  id_preceptor: number;
  titulacao: string;
}
export type CriarPreceptorInput = Omit<Preceptor, 'id_preceptor'>;

export interface Atendimento {
  id_atendimento: number;
  data_hora: string;
  duracao_minutos: number;
  nome_paciente: string;
  nome_residente: string;
  nome_preceptor: string;
}

export interface CriarAtendimentoInput {
  data_hora: string;
  duracao_minutos: number;
  id_paciente: number;
  id_residente: number;
  id_preceptor: number;
}

export interface ProcedimentoAtendimentoOut {
  id_procedimento: number;
  nome_procedimento: string;
  quantidade: number;
  tempo_real_minutos: number;
  observacao?: string;
}

export interface ProcedimentoBase {
  id_procedimento: number;
  codigo: string;
  nome: string;
  tempo_medio_minutos: number;
  nivel_risco: string;
}

export interface AdicionarProcedimentoInput {
  id_procedimento: number;
  quantidade: number;
  tempo_real_minutos: number;
  observacao?: string;
}

// =====================================================================
// 2. INTERFACES EXATAS DAS QUERIES DE LISTAGEM GERAL
// =====================================================================

export interface PacienteGeral {
  id_pessoa: number;
  nome: string;
  cpf: string;
  num_convenio?: string;
  alergias?: string;
  grupo_sanguineo?: string;
}

export interface ProfissionalGeral {
  id_pessoa: number;
  nome: string;
  crm: string;
  especialidade: string;
  papel: 'Residente' | 'Preceptor' | null;
  ano_residencia?: number;
  titulacao?: string;
}

// =====================================================================
// 3. INTERFACES DAS QUERIES ANALÍTICAS / RELATÓRIOS
// =====================================================================

export interface ResidenteRanking {
  nome: string;
  total_atendimentos: number;
}

export interface PreceptorSupervisao {
  nome: string;
  mes: string;
  total_atendimentos: number;
}

export interface PlantoesUnidade {
  unidade: string;
  nome: string;
  qtd_plantoes_semanais: number;
}

export interface PacienteSemRisco {
  nome: string;
  cpf?: string;
  num_convenio?: string;
  alergias?: string;
}

export interface CriarPacienteOut {
  id_pessoa: number;
  id_paciente?: number;
  detail?: string;
}

export interface AtualizarPacienteOut {
  id_pessoa: number;
  id_paciente?: number;
  detail?: string;
}

// =====================================================================
// 4. MÉTODOS DE CHAMADA DA API (ROTAS)
// =====================================================================

// --- PACIENTES ---
export function criarPaciente(dados: CriarPacienteInput) {
  return apiFetch<CriarPacienteOut>("/pacientes", {
    method: "POST",
    body: JSON.stringify({
      ...dados,
      alergias: normalizarAlergiasParaEnvio(dados.alergias),
    }),
  });
}

export function atualizarPaciente(idPaciente: number, dados: AtualizarPacienteInput) {
  return apiFetch<AtualizarPacienteOut>(`/pacientes/${idPaciente}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...dados,
      alergias: normalizarAlergiasParaEnvio(dados.alergias),
    }),
  });
}

export function buscarPacientes() {
  return apiFetch<PacienteGeral[]>("/pacientes");
}

// --- PROFISSIONAIS ---
export function criarResidente(dados: CriarResidenteInput) {
  return apiFetch<{ id_residente: number }>("/residentes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function criarPreceptor(dados: CriarPreceptorInput) {
  return apiFetch<{ id_preceptor: number }>("/preceptores", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function buscarProfissionais() {
  return apiFetch<ProfissionalGeral[]>("/profissionais");
}

// --- ATENDIMENTOS ---
export function criarAtendimento(dados: CriarAtendimentoInput) {
  return apiFetch<{ id_atendimento: number }>("/atendimentos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function listarAtendimentosDoPaciente(idPaciente: number) {
  return apiFetch<Atendimento[]>(`/pacientes/${idPaciente}/atendimentos`);
}

export function listarHistoricoAtendimentos() {
  return apiFetch<Atendimento[]>("/atendimentos");
}

// --- PROCEDIMENTOS DO ATENDIMENTO ---
export function listarProcedimentosDoAtendimento(idAtendimento: number) {
  return apiFetch<ProcedimentoAtendimentoOut[]>(`/atendimentos/${idAtendimento}/procedimentos`);
}

export function adicionarProcedimento(idAtendimento: number, dados: AdicionarProcedimentoInput) {
  return apiFetch<any>(`/atendimentos/${idAtendimento}/procedimentos`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function removerProcedimento(idAtendimento: number, idProcedimento: number) {
  return apiFetch<any>(`/atendimentos/${idAtendimento}/procedimentos/${idProcedimento}`, {
    method: "DELETE",
  });
}

// --- CATÁLOGO DE PROCEDIMENTOS ---
export function listarProcedimentos() {
  return apiFetch<ProcedimentoBase[]>('/procedimentos');
}

// --- RELATÓRIOS / CONSULTAS ANALÍTICAS ---
export function buscarRankingResidentes() {
  return apiFetch<ResidenteRanking[]>("/residentes/ranking");
}

export function buscarPreceptoresSupervisao() {
  return apiFetch<PreceptorSupervisao[]>("/preceptores/supervisao");
}

export function buscarPlantoesPorUnidade() {
  return apiFetch<PlantoesUnidade[]>("/unidades/plantoes");
}

export function buscarPacientesSemRiscoAlto() {
  return apiFetch<PacienteSemRisco[]>("/pacientes/sem-procedimento-alto-risco");
}

export function buscarTempoMedioPorResidente() {
  return apiFetch<any>("/residentes/metricas/tempo-medio-atendimento");
}