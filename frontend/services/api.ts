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
    throw new Error(erro?.detail || `Erro na requisição (${res.status})`);
  }

  return res.json();
}

// BASE 
export interface Pessoa {
  nome: string;
  cpf: string;
  data_nascimento: string;
  is_flamengo: boolean;
  telefone?: string;
}

// PACIENTES 
export interface Paciente extends Pessoa {
  id_paciente: number;
  num_convenio?: string;
  alergias?: string;
  grupo_sanguineo?: string;
}
export type CriarPacienteInput = Omit<Paciente, 'id_paciente'>;
export type AtualizarPacienteInput = Pick<Paciente, 'num_convenio' | 'alergias'>;

// PROFISSIONAIS
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

// ATENDIMENTOS
export interface Atendimento {
  id_atendimento: number;
  data_hora: string;
  duracao_minutos: number;
  id_paciente: number;
  id_residente: number;
  id_preceptor: number;
}
export type CriarAtendimentoInput = Omit<Atendimento, 'id_atendimento'>;

// PROCEDIMENTOS 
export interface ProcedimentoAtendimento {
  id_procedimento: number;
  quantidade: number;
  tempo_real_minutos: number;
  observacao?: string;
}

// ATENDIMENTOS

// POST /atendimentos 
export function criarAtendimento(dados: CriarAtendimentoInput) {
  return apiFetch<{ id_atendimento: number }>("/atendimentos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// GET /pacientes/{id}/atendimentos 
export function listarAtendimentosDoPaciente(idPaciente: number) {
  return apiFetch<Atendimento[]>(`/pacientes/${idPaciente}/atendimentos`);
}

// GET /atendimentos — histórico geral
export function listarHistoricoAtendimentos() {
  return apiFetch<Atendimento[]>("/atendimentos");
}

// PROCEDIMENTOS DO ATENDIMENTO

// GET /atendimentos/{id}/procedimentos 
export function listarProcedimentosDoAtendimento(idAtendimento: number) {
  return apiFetch<ProcedimentoAtendimento[]>(`/atendimentos/${idAtendimento}/procedimentos`);
}

// POST /atendimentos/{id}/procedimentos
export function adicionarProcedimento(idAtendimento: number, dados: ProcedimentoAtendimento) {
  return apiFetch<ProcedimentoAtendimento>(`/atendimentos/${idAtendimento}/procedimentos`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// DELETE /atendimentos/{id}/procedimentos/{id} 
export function removerProcedimento(idAtendimento: number, idProcedimento: number) {
  return apiFetch<{ sucesso: boolean }>(`/atendimentos/${idAtendimento}/procedimentos/${idProcedimento}`, {
    method: "DELETE",
  });
}

// PACIENTES

// PATCH /pacientes/{id} — Atualização parcial
export function atualizarPaciente(idPaciente: number, dados: AtualizarPacienteInput) {
  return apiFetch<Paciente>(`/pacientes/${idPaciente}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

// POST /pacientes
export function criarPaciente(dados: CriarPacienteInput) {
  return apiFetch<{ id_paciente: number }>("/pacientes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// GET /pacientes
export function listarPacientes() {
  return apiFetch<Paciente[]>("/pacientes");
}

// PROFISSIONAIS (Residentes e Preceptores)

// POST /residentes
export function criarResidente(dados: CriarResidenteInput) {
  return apiFetch<{ id_residente: number }>("/residentes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// POST /preceptores
export function criarPreceptor(dados: CriarPreceptorInput) {
  return apiFetch<{ id_preceptor: number }>("/preceptores", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// GET /profissionais
export function listarProfissionais() {
  return apiFetch<Profissional[]>("/profissionais");
}

// RELATÓRIOS / CONSULTAS ANALÍTICAS 

export interface ResidenteRanking {
  residente: string;
  especialidade: string;
  ano_residencia: string;
  total_atendimentos: number;
}

export interface PacienteSemRisco {
  id_paciente: number;
  nome: string;
  cpf?: string;
  num_convenio?: string;
  alergias?: string;
}

// ---------------------------------------------------------------------
// RELATÓRIOS / CONSULTAS ANALÍTICAS 
// ---------------------------------------------------------------------

// Query 1: Retorna 'nome' e 'total_atendimentos'
export interface ResidenteRanking {
  nome: string;
  total_atendimentos: number;
}

// Query 2: Retorna 'nome', 'mes' e 'total_atendimentos'
export interface PreceptorSupervisao {
  nome: string;
  mes: string;
  total_atendimentos: number;
}

// Query 3: Retorna 'unidade', 'nome' e 'qtd_plantoes_semanais'
export interface PlantoesUnidade {
  unidade: string;
  nome: string;
  qtd_plantoes_semanais: number;
}

// Query 4: Retorna apenas 'nome' (as outras colunas opcionais ficam blindadas)
export interface PacienteSemRisco {
  nome: string;
  cpf?: string;
  num_convenio?: string;
  alergias?: string;
}

// --- Funções da API com os tipos acoplados ---

// 1) GET /residentes/ranking
export function buscarRankingResidentes() {
  return apiFetch<ResidenteRanking[]>("/residentes/ranking");
}

// 2) GET /preceptores/supervisao (Preceptores com mais de 5 atendimentos/mês)
export function buscarPreceptoresSupervisao() {
  return apiFetch<PreceptorSupervisao[]>("/preceptores/supervisao");
}

// 3) GET /unidades/plantoes (Plantões por residente e unidade)
export function buscarPlantoesPorUnidade() {
  return apiFetch<PlantoesUnidade[]>("/unidades/plantoes");
}

// 4) GET /pacientes/sem-procedimento-alto-risco
export function buscarPacientesSemRiscoAlto() {
  return apiFetch<PacienteSemRisco[]>("/pacientes/sem-procedimento-alto-risco");
}

// Extra: Caso use a rota de tempo médio futuramente
export function buscarTempoMedioPorResidente() {
  return apiFetch<any>("/residentes/metricas/tempo-medio-atendimento");
}

