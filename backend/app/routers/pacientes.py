from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import insert
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Pessoa, Paciente, Alergia, Atendimento
from app.schemas.paciente import (
    PacienteCreate,
    PacienteCreateOut,
    PacienteOut,
    PacienteUpdate,
    PacienteUpdateOut
)
from app.schemas.atendimento import AtendimentoOut

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


# Função auxiliar para salvar alergias de um paciente.
# Recebe a lista ou string separada por vírgula)de alergias, garante que
# cada uma exista na tabela alergias (get-or-create) e associa ao paciente
def salvar_alergias(db: Session, paciente: Paciente, alergias: list[str] | str | None) -> None:
    if alergias is None:
        return

    if isinstance(alergias, str):
        alergias = [item.strip() for item in alergias.split(",") if item.strip()]

    for nome_alergia in alergias:
        nome_alergia = nome_alergia.strip()
        if not nome_alergia:
            continue

        # Tenta encontrar a alergia já existente, senão cria
        alergia = db.query(Alergia).filter(Alergia.nome == nome_alergia).first()
        if alergia is None:
            alergia = Alergia(nome=nome_alergia)
            db.add(alergia)
            db.flush()  # garante que id_alergia seja gerado antes de associar

        paciente.alergia.append(alergia)


@router.post("", response_model=PacienteCreateOut, status_code=201)
# o response model ele formata a saida final usando o schemas definido para isso
# o 201 é o codigo de status HTTP que significa criado
def criar_paciente(paciente: PacienteCreate, db: Session = Depends(get_db)):
    # valida a entrada do usuario com o response model antes já definido
    try:
        # Inserir a Pessoa
        nova_pessoa = Pessoa(
            nome=paciente.nome,
            cpf=paciente.cpf,
            data_nascimento=paciente.data_nascimento,
            is_flamengo=paciente.is_flamengo,
            telefone=paciente.telefone,
        )
        db.add(nova_pessoa)
        db.flush()  # gera o id_pessoa antes de criar o Paciente

        # Insere somente na tabela filha. Instanciar Paciente aqui faria o
        # SQLAlchemy tentar inserir a mesma pessoa novamente por heranca.
        db.execute(
            insert(Paciente.__table__).values(
                id_pessoa=nova_pessoa.id_pessoa,
                num_convenio=paciente.num_convenio,
                grupo_sanguineo=paciente.grupo_sanguineo,
            )
        )
        db.flush()

        id_pessoa = nova_pessoa.id_pessoa
        db.expunge(nova_pessoa)
        novo_paciente = db.get(Paciente, id_pessoa)
        if novo_paciente is None:
            raise RuntimeError("Paciente criado, mas nao foi possivel carrega-lo.")

        salvar_alergias(db, novo_paciente, paciente.alergias)

        db.commit()
        return PacienteCreateOut(id_pessoa=id_pessoa)

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=list[PacienteOut])
def listar_pacientes(db: Session = Depends(get_db)):
    try:
        return db.query(Paciente).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# rota para listar os atendimentos de um paciente específico
@router.get("/{id_paciente}/atendimentos", response_model=list[AtendimentoOut])
def listar_atendimentos_do_paciente(id_paciente: int, db: Session = Depends(get_db)):
    try:
        return (
            db.query(Atendimento)
            .filter(Atendimento.id_paciente == id_paciente)
            .all()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# rota para atualizar os dados de um paciente específico
# Atende tanto a atualização do número do convênio quanto das alergias
# Os demais dados do paciente não podem ser atualizados através desta rota pois não estao no schema pydantic
@router.patch("/{id_paciente}", response_model=PacienteUpdateOut)
def atualizar_paciente(id_paciente: int, dados: PacienteUpdate, db: Session = Depends(get_db)):
    try:
        paciente = db.query(Paciente).filter(Paciente.id_pessoa == id_paciente).first()
        if paciente is None:
            raise HTTPException(status_code=404, detail="Paciente não encontrado.")

        if dados.num_convenio is not None:
            paciente.num_convenio = dados.num_convenio

        if dados.alergias is not None:
            # Remove as alergias atuais e insere as novas
            paciente.alergia.clear()
            salvar_alergias(db, paciente, dados.alergias)

        db.commit()
        return PacienteUpdateOut(id_pessoa=id_paciente)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
