const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL || "http://backend:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// helper para fazer requisições à API do backend, tratando erros de forma consistente.
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


// ---------------------------------------------------------------------
// ATENDIMENTOS
// ---------------------------------------------------------------------

// POST /atendimentos 
export function criarAtendimento(dados: {
  data_hora: string;
  duracao_minutos: number;
  id_paciente: number;
  id_residente: number;
  id_preceptor: number;
}) {
  return apiFetch<{ id_atendimento: number }>("/atendimentos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// GET /pacientes/{id}/atendimentos 
export function listarAtendimentosDoPaciente(idPaciente: number) {
  return apiFetch(`/pacientes/${idPaciente}/atendimentos`);
}

// GET /atendimentos — histórico geral AINDA NAO IMPLEMENTADO
export function listarHistoricoAtendimentos() {
  return apiFetch("/atendimentos");
}



// PROCEDIMENTOS

// GET /atendimentos/{id}/procedimentos 
export function listarProcedimentosDoAtendimento(idAtendimento: number) {
  return apiFetch(`/atendimentos/${idAtendimento}/procedimentos`);
}

// POST /atendimentos/{id}/procedimentos AINDA NAO IMPLEMENTADO
export function adicionarProcedimento(
  idAtendimento: number,
  dados: { id_procedimento: number; quantidade: number; tempo_real_minutos: number; observacao?: string }
) {
  return apiFetch(`/atendimentos/${idAtendimento}/procedimentos`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// DELETE /atendimentos/{id}/procedimentos/{id} 
export function removerProcedimento(idAtendimento: number, idProcedimento: number) {
  return apiFetch(`/atendimentos/${idAtendimento}/procedimentos/${idProcedimento}`, {
    method: "DELETE",
  });
}



// PACIENTES

// PATCH /pacientes/{id} — já implementado (apenas atualização de num_convenio e alergias)
export function atualizarPaciente(
  idPaciente: number,
  dados: { num_convenio?: string; alergias?: string }
) {
  return apiFetch(`/pacientes/${idPaciente}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

// POST /pacientes AINDA NAO IMPLEMENTADO
export function criarPaciente(dados: {
  nome: string;
  cpf: string;
  data_nascimento: string;
  is_flamengo: boolean;
  telefone?: string;
  num_convenio?: string;
  alergias?: string;
  grupo_sanguineo?: string;
}) {
  return apiFetch("/pacientes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// GET /pacientes — AINDA NAO IMPLEMENTADO 
export function listarPacientes() {
  return apiFetch("/pacientes");
}

// PROFISSIONAIS (residentes e preceptores)

// POST /residentes — AINDA NAO IMPLEMENTADO
export function criarResidente(dados: {
  nome: string;
  cpf: string;
  data_nascimento: string;
  is_flamengo: boolean;
  telefone?: string;
  crm: string;
  data_admissao: string;
  especialidade: string;
  ano_residencia: string;
}) {
  return apiFetch("/residentes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// POST /preceptores — AINDA NAO IMPLEMENTADO
export function criarPreceptor(dados: {
  nome: string;
  cpf: string;
  data_nascimento: string;
  is_flamengo: boolean;
  telefone?: string;
  crm: string;
  data_admissao: string;
  especialidade: string;
  titulacao: string;
}) {
  return apiFetch("/preceptores", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// GET /profissionais — AINDA NAO IMPLEMENTADO
export function listarProfissionais() {
  return apiFetch("/profissionais");
}

// RELATÓRIOS / CONSULTAS ANALÍTICAS 

// GET /residentes/ranking
export function buscarRankingResidentes() {
  return apiFetch("/residentes/ranking");
}

// GET /residentes/metricas/tempo-medio-atendimento
export function buscarTempoMedioPorResidente() {
  return apiFetch("/residentes/metricas/tempo-medio-atendimento");
}

// GET /preceptores/supervisao
export function buscarPreceptoresSupervisao() {
  return apiFetch("/preceptores/supervisao");
}

// GET /unidades/plantoes
export function buscarPlantoesPorUnidade() {
  return apiFetch("/unidades/plantoes");
}

// GET /pacientes/sem-procedimento-alto-risco
export function buscarPacientesSemRiscoAlto() {
  return apiFetch("/pacientes/sem-procedimento-alto-risco");
}