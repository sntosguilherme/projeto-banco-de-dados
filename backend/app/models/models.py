from typing import Optional
import datetime

from sqlalchemy import BigInteger, Boolean, CheckConstraint, Column, Date, DateTime, ForeignKeyConstraint, Integer, MetaData, Numeric, PrimaryKeyConstraint, String, Table, Text, UniqueConstraint, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

# Tabela alergia com todas a restrição de nome único.
class Alergia(Base):
    __tablename__ = 'alergia'
    __table_args__ = (
        PrimaryKeyConstraint('id_alergia', name='alergia_pkey'),
        UniqueConstraint('nome', name='alergia_nome_key')
    )

    id_alergia: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)

    paciente: Mapped[list['Paciente']] = relationship('Paciente', secondary='paciente_alergia', back_populates='alergia')

# Tabela pessoa com todas as restrições de integridade, incluindo CPF, data de nascimento e telefone.
class Pessoa(Base):
    __tablename__ = 'pessoa'
    __table_args__ = (
        CheckConstraint("cpf::text ~ '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$'::text", name='pessoa_cpf_check'),
        CheckConstraint("data_nascimento >= '1900-01-01'::date AND data_nascimento <= CURRENT_DATE", name='pessoa_data_nascimento_check'),
        CheckConstraint("telefone::text ~ '^\\(\\d{2}\\) \\d{5}-\\d{4}$'::text", name='pessoa_telefone_check'),
        PrimaryKeyConstraint('id_pessoa', name='pessoa_pkey'),
        UniqueConstraint('cpf', name='pessoa_cpf_key')
    )

    id_pessoa: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    cpf: Mapped[str] = mapped_column(String(14), nullable=False)
    data_nascimento: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    is_flamengo: Mapped[bool] = mapped_column(Boolean, nullable=False)
    telefone: Mapped[Optional[str]] = mapped_column(String(15))

# Tabela procedimento com todas as restrições de integridade, incluindo tempo médio e nível de risco.
class Procedimento(Base):
    __tablename__ = 'procedimento'
    __table_args__ = (
        CheckConstraint("nivel_risco::text = ANY (ARRAY['BAIXO'::character varying, 'MEDIO'::character varying, 'ALTO'::character varying]::text[])", name='procedimento_nivel_risco_check'),
        CheckConstraint('tempo_medio_minutos > 0', name='procedimento_tempo_medio_minutos_check'),
        PrimaryKeyConstraint('id_procedimento', name='procedimento_pkey'),
        UniqueConstraint('codigo', name='procedimento_codigo_key')
    )

    id_procedimento: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(String(20), nullable=False)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    tempo_medio_minutos: Mapped[int] = mapped_column(Integer, nullable=False)
    nivel_risco: Mapped[Optional[str]] = mapped_column(String(20), server_default=text("'BAIXO'::character varying"))

    procedimento_realizado: Mapped[list['ProcedimentoRealizado']] = relationship('ProcedimentoRealizado', back_populates='procedimento')

# Tabela unidade com todas a restrição de capacidade de leitos.
class Unidade(Base):
    __tablename__ = 'unidade'
    __table_args__ = (
        CheckConstraint('capacidade_leitos >= 0', name='unidade_capacidade_leitos_check'),
        PrimaryKeyConstraint('id_unidade', name='unidade_pkey')
    )

    id_unidade: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo: Mapped[str] = mapped_column(String(50), nullable=False)
    capacidade_leitos: Mapped[int] = mapped_column(Integer, nullable=False)

    internacao: Mapped[list['Internacao']] = relationship('Internacao', back_populates='unidade')
    escala: Mapped[list['Escala']] = relationship('Escala', back_populates='unidade')

# view de estatísticas de atendimentos mensais, incluindo total de atendimentos, média de duração e procedimento mais comum.
t_vw_estatisticas_atendimentos_mensal = Table(
    'vw_estatisticas_atendimentos_mensal', Base.metadata,
    Column('mes', Text),
    Column('unidade', String(100)),
    Column('total_atendimentos', BigInteger),
    Column('media_duracao', Numeric),
    Column('procedimento_mais_comum', String)
)

# view de pacientes internados, incluindo nome do paciente, data e hora de entrada e unidade de internação.
t_vw_pacientes_internados = Table(
    'vw_pacientes_internados', Base.metadata,
    Column('paciente_nome', String(100)),
    Column('data_hora_entrada', DateTime),
    Column('unidade_internacao', String(100))
)

# view de residentes sem supervisor, incluindo nome do residente, nome do preceptor, titulação do preceptor e se a supervisão está ativa.
t_vw_residentes_sem_supervisor = Table(
    'vw_residentes_sem_supervisor', Base.metadata,
    Column('residente_nome', String(100)),
    Column('preceptor_nome', String(100)),
    Column('preceptor_titulacao', String(50)),
    Column('supervisao_ativa', Boolean)
)

# Tabela paciente com todas as restrições de integridade, incluindo grupo sanguíneo e número de convênio.
class Paciente(Pessoa):
    __tablename__ = 'paciente'
    __table_args__ = (
        CheckConstraint("grupo_sanguineo::text = ANY (ARRAY['A+'::character varying, 'A-'::character varying, 'B+'::character varying, 'B-'::character varying, 'AB+'::character varying, 'AB-'::character varying, 'O+'::character varying, 'O-'::character varying]::text[])", name='paciente_grupo_sanguineo_check'),
        ForeignKeyConstraint(['id_pessoa'], ['pessoa.id_pessoa'], ondelete='CASCADE', name='paciente_id_pessoa_fkey'),
        PrimaryKeyConstraint('id_pessoa', name='paciente_pkey')
    )

    id_pessoa: Mapped[int] = mapped_column(Integer, primary_key=True)
    num_convenio: Mapped[Optional[str]] = mapped_column(String(50))
    grupo_sanguineo: Mapped[Optional[str]] = mapped_column(String(3))

    alergia: Mapped[list['Alergia']] = relationship('Alergia', secondary='paciente_alergia', back_populates='paciente')
    internacao: Mapped[list['Internacao']] = relationship('Internacao', back_populates='paciente')
    atendimento: Mapped[list['Atendimento']] = relationship('Atendimento', back_populates='paciente')

# Tabela profissional com todas as restrições de integridade, incluindo CRM, data de admissão e especialidade.
class Profissional(Pessoa):
    __tablename__ = 'profissional'
    __table_args__ = (
        ForeignKeyConstraint(['id_pessoa'], ['pessoa.id_pessoa'], ondelete='CASCADE', name='profissional_id_pessoa_fkey'),
        PrimaryKeyConstraint('id_pessoa', name='profissional_pkey'),
        UniqueConstraint('crm', name='profissional_crm_key')
    )

    id_pessoa: Mapped[int] = mapped_column(Integer, primary_key=True)
    crm: Mapped[str] = mapped_column(String(20), nullable=False)
    data_admissao: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    especialidade: Mapped[str] = mapped_column(String(50), nullable=False)

# Tabela internacao com todas as restrições de integridade, incluindo data e hora de entrada e saída, paciente e unidade.
class Internacao(Base):
    __tablename__ = 'internacao'
    __table_args__ = (
        ForeignKeyConstraint(['id_paciente'], ['paciente.id_pessoa'], ondelete='CASCADE', name='internacao_id_paciente_fkey'),
        ForeignKeyConstraint(['id_unidade'], ['unidade.id_unidade'], ondelete='CASCADE', name='internacao_id_unidade_fkey'),
        PrimaryKeyConstraint('id_internacao', name='internacao_pkey')
    )

    id_internacao: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_paciente: Mapped[int] = mapped_column(Integer, nullable=False)
    id_unidade: Mapped[int] = mapped_column(Integer, nullable=False)
    data_hora_entrada: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    data_hora_saida: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)

    paciente: Mapped['Paciente'] = relationship('Paciente', back_populates='internacao')
    unidade: Mapped['Unidade'] = relationship('Unidade', back_populates='internacao')

# Tabela relacional entre paciente e alergia, com restrições de integridade referencial e chave primária composta.
t_paciente_alergia = Table(
    'paciente_alergia', Base.metadata,
    Column('id_pessoa', Integer, primary_key=True),
    Column('id_alergia', Integer, primary_key=True),
    ForeignKeyConstraint(['id_alergia'], ['alergia.id_alergia'], ondelete='CASCADE', name='paciente_alergia_id_alergia_fkey'),
    ForeignKeyConstraint(['id_pessoa'], ['paciente.id_pessoa'], ondelete='CASCADE', name='paciente_alergia_id_pessoa_fkey'),
    PrimaryKeyConstraint('id_pessoa', 'id_alergia', name='paciente_alergia_pkey')
)

# Tabela preceptor com todas as restrições de integridade, incluindo titulação e supervisão ativa.
class Preceptor(Profissional):
    __tablename__ = 'preceptor'
    __table_args__ = (
        ForeignKeyConstraint(['id_profissional'], ['profissional.id_pessoa'], ondelete='CASCADE', name='preceptor_id_profissional_fkey'),
        PrimaryKeyConstraint('id_profissional', name='preceptor_pkey')
    )

    id_profissional: Mapped[int] = mapped_column(Integer, primary_key=True)
    titulacao: Mapped[str] = mapped_column(String(50), nullable=False)
    supervisao_ativa: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('true'))

    atendimento: Mapped[list['Atendimento']] = relationship('Atendimento', back_populates='preceptor')
    escala: Mapped[list['Escala']] = relationship('Escala', back_populates='preceptor')

# Tabela residente com todas as restrições de integridade, incluindo ano de residência e relacionamento com atendimento e escala.
class Residente(Profissional):
    __tablename__ = 'residente'
    __table_args__ = (
        CheckConstraint("ano_residencia::text = ANY (ARRAY['R1'::character varying, 'R2'::character varying, 'R3'::character varying]::text[])", name='residente_ano_residencia_check'),
        ForeignKeyConstraint(['id_profissional'], ['profissional.id_pessoa'], ondelete='CASCADE', name='residente_id_profissional_fkey'),
        PrimaryKeyConstraint('id_profissional', name='residente_pkey')
    )

    id_profissional: Mapped[int] = mapped_column(Integer, primary_key=True)
    ano_residencia: Mapped[Optional[str]] = mapped_column(String(2))

    atendimento: Mapped[list['Atendimento']] = relationship('Atendimento', back_populates='residente')
    escala: Mapped[list['Escala']] = relationship('Escala', back_populates='residente')

# Tabela atendimento com todas as restrições de integridade, incluindo data e hora, duração, paciente, residente e preceptor.
class Atendimento(Base):
    __tablename__ = 'atendimento'
    __table_args__ = (
        CheckConstraint('duracao_minutos > 0', name='atendimento_duracao_minutos_check'),
        ForeignKeyConstraint(['id_paciente'], ['paciente.id_pessoa'], name='atendimento_id_paciente_fkey'),
        ForeignKeyConstraint(['id_preceptor'], ['preceptor.id_profissional'], name='atendimento_id_preceptor_fkey'),
        ForeignKeyConstraint(['id_residente'], ['residente.id_profissional'], name='atendimento_id_residente_fkey'),
        PrimaryKeyConstraint('id_atendimento', name='atendimento_pkey')
    )

    id_atendimento: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    data_hora: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    duracao_minutos: Mapped[int] = mapped_column(Integer, nullable=False)
    id_paciente: Mapped[int] = mapped_column(Integer, nullable=False)
    id_residente: Mapped[int] = mapped_column(Integer, nullable=False)
    id_preceptor: Mapped[int] = mapped_column(Integer, nullable=False)

    paciente: Mapped['Paciente'] = relationship('Paciente', back_populates='atendimento')
    preceptor: Mapped['Preceptor'] = relationship('Preceptor', back_populates='atendimento')
    residente: Mapped['Residente'] = relationship('Residente', back_populates='atendimento')
    procedimento_realizado: Mapped[list['ProcedimentoRealizado']] = relationship('ProcedimentoRealizado', back_populates='atendimento')

# Tabela escala com todas as restrições de integridade, incluindo dia da semana, turno, preceptor, residente e unidade.
class Escala(Base):
    __tablename__ = 'escala'
    __table_args__ = (
        CheckConstraint("dia_semana::text = ANY (ARRAY['Segunda'::character varying, 'Terca'::character varying, 'Quarta'::character varying, 'Quinta'::character varying, 'Sexta'::character varying, 'Sabado'::character varying, 'Domingo'::character varying]::text[])", name='escala_dia_semana_check'),
        CheckConstraint("turno::text = ANY (ARRAY['Manha'::character varying, 'Tarde'::character varying, 'Noite'::character varying]::text[])", name='escala_turno_check'),
        ForeignKeyConstraint(['id_preceptor'], ['preceptor.id_profissional'], name='escala_id_preceptor_fkey'),
        ForeignKeyConstraint(['id_residente'], ['residente.id_profissional'], name='escala_id_residente_fkey'),
        ForeignKeyConstraint(['id_unidade'], ['unidade.id_unidade'], name='escala_id_unidade_fkey'),
        PrimaryKeyConstraint('id_escala', name='escala_pkey'),
        UniqueConstraint('id_unidade', 'dia_semana', 'turno', 'id_residente', name='unique_escala_residente')
    )

    id_escala: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_unidade: Mapped[int] = mapped_column(Integer, nullable=False)
    id_residente: Mapped[int] = mapped_column(Integer, nullable=False)
    id_preceptor: Mapped[int] = mapped_column(Integer, nullable=False)
    dia_semana: Mapped[Optional[str]] = mapped_column(String(15))
    turno: Mapped[Optional[str]] = mapped_column(String(10))

    preceptor: Mapped['Preceptor'] = relationship('Preceptor', back_populates='escala')
    residente: Mapped['Residente'] = relationship('Residente', back_populates='escala')
    unidade: Mapped['Unidade'] = relationship('Unidade', back_populates='escala')

# Tabela procedimento_realizado com todas as restrições de integridade, incluindo quantidade, tempo real, faturamento e observação.
class ProcedimentoRealizado(Base):
    __tablename__ = 'procedimento_realizado'
    __table_args__ = (
        CheckConstraint('quantidade > 0', name='procedimento_realizado_quantidade_check'),
        CheckConstraint('tempo_real_minutos > 0', name='procedimento_realizado_tempo_real_minutos_check'),
        ForeignKeyConstraint(['id_atendimento'], ['atendimento.id_atendimento'], ondelete='CASCADE', name='procedimento_realizado_id_atendimento_fkey'),
        ForeignKeyConstraint(['id_procedimento'], ['procedimento.id_procedimento'], name='procedimento_realizado_id_procedimento_fkey'),
        PrimaryKeyConstraint('id_atendimento', 'id_procedimento', name='procedimento_realizado_pkey')
    )

    id_atendimento: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_procedimento: Mapped[int] = mapped_column(Integer, primary_key=True)
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False)
    tempo_real_minutos: Mapped[int] = mapped_column(Integer, nullable=False)
    faturado: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('false'))
    observacao: Mapped[Optional[str]] = mapped_column(Text)

    atendimento: Mapped['Atendimento'] = relationship('Atendimento', back_populates='procedimento_realizado')
    procedimento: Mapped['Procedimento'] = relationship('Procedimento', back_populates='procedimento_realizado')
