from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import case, func, select

from app.database import get_db
from app.models.models import (
    Atendimento,
    Paciente,
    Preceptor,
    Procedimento,
    ProcedimentoRealizado,
    Residente,
    Escala,
    Unidade,
)
from app.schemas.relatorios import (
    PacienteSemProcedimentoAltoRiscoOut,
    PlantaoPorUnidadeOut,
    PreceptorSupervisorOut,
    RankingResidenteOut,
    UltimoAtendimentoOut,
    ProcedimentoResumoOut,
    PercentualAltoRiscoOut,
    PreceptorFlamenguistaOut,
)

router = APIRouter(tags=["Relatórios"])
def executar_consulta(db: Session, statement):
    return db.execute(statement).mappings().all()


@router.get("/residentes/ranking", response_model=list[RankingResidenteOut])
def ranking_residentes(db: Session = Depends(get_db)):
    try:
        total_atendimentos = func.count(Atendimento.id_atendimento)
        statement = (
            select(
                Residente.nome.label("residente"),
                total_atendimentos.label("total_atendimentos"),
            )
            .select_from(Residente)
            .outerjoin(Residente.atendimento)
            .group_by(Residente.nome)
            .order_by(total_atendimentos.desc())
        )
        return executar_consulta(db, statement)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preceptores/supervisao", response_model=list[PreceptorSupervisorOut])
def preceptores_mais_de_5_atendimentos(db: Session = Depends(get_db)):
    try:
        mes = func.date_trunc("month", Atendimento.data_hora)
        total_atendimentos = func.count(Atendimento.id_atendimento)
        statement = (
            select(
                Preceptor.nome.label("preceptor"),
                mes.label("mes"),
                total_atendimentos.label("total_atendimentos"),
            )
            .select_from(Atendimento)
            .join(Atendimento.preceptor)
            .group_by(Preceptor.nome, mes)
            .having(total_atendimentos > 5)
            .order_by(mes, total_atendimentos.desc())
        )
        return executar_consulta(db, statement)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unidades/plantoes", response_model=list[PlantaoPorUnidadeOut])
def plantoes_por_unidade(db: Session = Depends(get_db)):
    try:
        total_plantoes = func.count(Escala.id_escala)
        statement = (
            select(
                Unidade.nome.label("unidade"),
                Residente.nome.label("residente"),
                total_plantoes.label("qtd_plantoes_semanais"),
            )
            .select_from(Escala)
            .join(Escala.unidade)
            .join(Escala.residente)
            .group_by(Unidade.nome, Residente.nome)
            .order_by(Unidade.nome, total_plantoes.desc())
        )
        return executar_consulta(db, statement)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/pacientes/sem-procedimento-alto-risco",
    response_model=list[PacienteSemProcedimentoAltoRiscoOut],
)
def pacientes_sem_procedimento_alto_risco(db: Session = Depends(get_db)):
    try:
        pacientes_com_alto_risco = (
            select(Atendimento.id_paciente)
            .join(ProcedimentoRealizado, ProcedimentoRealizado.id_atendimento == Atendimento.id_atendimento)
            .join(Procedimento, Procedimento.id_procedimento == ProcedimentoRealizado.id_procedimento)
            .where(Procedimento.nivel_risco == "ALTO")
        )
        statement = (
            select(Paciente.nome.label("paciente"))
            .select_from(Paciente)
            .where(Paciente.id_pessoa.not_in(pacientes_com_alto_risco))
            .order_by(Paciente.nome)
        )
        return executar_consulta(db, statement)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/preceptores/supervisionaram-pacientes-flamenguistas",
    response_model=list[PreceptorFlamenguistaOut],
)
def preceptores_de_pacientes_flamenguistas(db: Session = Depends(get_db)):
    try:
        # Preceptor.atendimento e Atendimento.paciente ja foram definidos em models.py
        preceptores = (
            db.query(Preceptor)
            .join(Preceptor.atendimento)
            .join(Atendimento.paciente)
            .filter(Paciente.is_flamengo.is_(True))
            # um preceptor pode aparecer em vários atendimentos de pacientes flamenguistas
            .distinct()
            .all()
        )
        return preceptores
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pacientes/ultimo-atendimento", response_model=list[UltimoAtendimentoOut])
def ultimo_atendimento_por_paciente(db: Session = Depends(get_db)):
    try:
        # subquery de apoio: para cada paciente qual a maior data_hora de atendimento?
        subquery_ultima_data = (
            db.query(
                Atendimento.id_paciente,
                func.max(Atendimento.data_hora).label("ultima_data_hora"),
            )
            .group_by(Atendimento.id_paciente)
            .subquery()
        )
        # busca o atendimento que id_paciente e data_hora batem com o resultado da subquery
        atendimentos = (
            db.query(Atendimento)
            .join(
                subquery_ultima_data,
                (Atendimento.id_paciente == subquery_ultima_data.c.id_paciente)
                & (Atendimento.data_hora == subquery_ultima_data.c.ultima_data_hora),
            )
            .all()
        )
        resultado = []
        for atendimento in atendimentos:
            procedimentos = [
                ProcedimentoResumoOut(
                    nome_procedimento=pr.procedimento.nome,
                    quantidade=pr.quantidade,
                    tempo_real_minutos=pr.tempo_real_minutos,
                )
                for pr in atendimento.procedimento_realizado
            ]
            resultado.append(
                UltimoAtendimentoOut(
                    id_atendimento=atendimento.id_atendimento,
                    data_hora=atendimento.data_hora,
                    paciente=atendimento.paciente.nome,
                    residente=atendimento.residente.nome,
                    preceptor=atendimento.preceptor.nome,
                    procedimentos=procedimentos,
                )
            )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/residentes/percentual-alto-risco", response_model=list[PercentualAltoRiscoOut])
def percentual_procedimentos_alto_risco_por_residente(db: Session = Depends(get_db)):
    try:
        contagem_por_residente = (
            db.query(
                Atendimento.id_residente.label("id_residente"),
                func.count(ProcedimentoRealizado.id_procedimento).label("total_procedimentos"),
                func.sum(
                    case((Procedimento.nivel_risco == "ALTO", 1), else_=0)
                ).label("total_alto_risco"),
            )
            .join(ProcedimentoRealizado, ProcedimentoRealizado.id_atendimento == Atendimento.id_atendimento)
            .join(Procedimento, Procedimento.id_procedimento == ProcedimentoRealizado.id_procedimento)
            .group_by(Atendimento.id_residente)
            .subquery()
        )
        resultados = (
            db.query(Residente, contagem_por_residente.c.total_procedimentos, contagem_por_residente.c.total_alto_risco)
            .join(contagem_por_residente, contagem_por_residente.c.id_residente == Residente.id_profissional)
            .all()
        )
        resposta = []
        for residente, total_procedimentos, total_alto_risco in resultados:
            percentual = round((total_alto_risco / total_procedimentos) * 100, 2) if total_procedimentos else 0.0
            resposta.append(
                PercentualAltoRiscoOut(
                    id_residente=residente.id_profissional,
                    nome_residente=residente.nome,
                    total_procedimentos=total_procedimentos,
                    total_alto_risco=total_alto_risco,
                    percentual_alto_risco=percentual,
                )
            )
        return resposta
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
