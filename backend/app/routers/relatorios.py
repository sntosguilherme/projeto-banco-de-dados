from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.models import Pessoa, Residente, Preceptor, Profissional, Atendimento, Escala, Unidade, Paciente, ProcedimentoRealizado, Procedimento
from app.schemas.relatorios import (
    RankingResidenteOut,
    PreceptorSupervisorOut,
    PlantaoPorUnidadeOut,
    PacienteSemProcedimentoAltoRiscoOut,
)

router = APIRouter(tags=["Relatórios"])


@router.get("/residentes/ranking", response_model=list[RankingResidenteOut])
def ranking_residentes(db: Session = Depends(get_db)):
    try:
        resultados = (
            db.query(
                Pessoa.nome.label("residente"),
                func.count(Atendimento.id_atendimento).label("total_atendimentos")
            )
            .select_from(Residente)
            .join(Profissional, Profissional.id_pessoa == Residente.id_profissional)
            .join(Pessoa, Pessoa.id_pessoa == Profissional.id_pessoa)
            .outerjoin(Atendimento, Atendimento.id_residente == Residente.id_profissional)
            .group_by(Pessoa.nome)
            .order_by(func.count(Atendimento.id_atendimento).desc())
            .all()
        )
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preceptores/supervisao", response_model=list[PreceptorSupervisorOut])
def preceptores_mais_de_5_atendimentos(db: Session = Depends(get_db)):
    try:
        resultados = (
            db.query(
                Pessoa.nome.label("preceptor"),
                func.date_trunc('month', Atendimento.data_hora).label("mes"),
                func.count(Atendimento.id_atendimento).label("total_atendimentos")
            )
            .select_from(Atendimento)
            .join(Preceptor, Preceptor.id_profissional == Atendimento.id_preceptor)
            .join(Profissional, Profissional.id_pessoa == Preceptor.id_profissional)
            .join(Pessoa, Pessoa.id_pessoa == Profissional.id_pessoa)
            .group_by(Pessoa.nome, func.date_trunc('month', Atendimento.data_hora))
            .having(func.count(Atendimento.id_atendimento) > 5)
            .order_by(func.date_trunc('month', Atendimento.data_hora), func.count(Atendimento.id_atendimento).desc())
            .all()
        )
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unidades/plantoes", response_model=list[PlantaoPorUnidadeOut])
def plantoes_por_unidade(db: Session = Depends(get_db)):
    try:
        resultados = (
            db.query(
                Unidade.nome.label("unidade"),
                Pessoa.nome.label("residente"),
                func.count(Escala.id_escala).label("qtd_plantoes_semanais")
            )
            .select_from(Escala)
            .join(Unidade, Unidade.id_unidade == Escala.id_unidade)
            .join(Profissional, Profissional.id_pessoa == Escala.id_residente)
            .join(Pessoa, Pessoa.id_pessoa == Profissional.id_pessoa)
            .group_by(Unidade.nome, Pessoa.nome)
            .order_by(Unidade.nome, func.count(Escala.id_escala).desc())
            .all()
        )
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/pacientes/sem-procedimento-alto-risco",
    response_model=list[PacienteSemProcedimentoAltoRiscoOut],
)
def pacientes_sem_procedimento_alto_risco(db: Session = Depends(get_db)):
    try:
        subquery = (
            db.query(Atendimento.id_paciente)
            .join(ProcedimentoRealizado, ProcedimentoRealizado.id_atendimento == Atendimento.id_atendimento)
            .join(Procedimento, Procedimento.id_procedimento == ProcedimentoRealizado.id_procedimento)
            .filter(Procedimento.nivel_risco == 'ALTO')
        )
        
        resultados = (
            db.query(
                Pessoa.nome.label("paciente")
            )
            .select_from(Paciente)
            .join(Pessoa, Pessoa.id_pessoa == Paciente.id_pessoa)
            .filter(Paciente.id_pessoa.notin_(subquery))
            .order_by(Pessoa.nome)
            .all()
        )
        return resultados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))