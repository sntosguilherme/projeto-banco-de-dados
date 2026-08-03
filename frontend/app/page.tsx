import styles from './page.module.css';
import { Shield, Activity, Users, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Grid pattern background */}
      <div className={styles.backgroundGrid}></div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.badge}>
          <Shield size={14} />
          <span>Gestão de Excelência</span>
        </div>
        
        <h1 className={styles.title}>
          Sistema Hospitalar
          <span className={styles.titleHighlight}>Dra. Yuska Maritan Brito</span>
        </h1>
        
        <p className={styles.description}>
          Projeto prático desenvolvido para a disciplina de Banco de Dados, simulando o gerenciamento completo de um hospital com alta eficiência.
        </p>

        {/* The joke requested by the user */}
        <div className={styles.corinthiansJoke}>
          🦅 Aqui é trabalho, saúde e VAI CORINTHIANS! 🦅
        </div>

        <div className={styles.featuresGrid}>
          <Link href="/cadastros/pacientes" className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Users size={24} />
            </div>
            <h3 className={styles.featureTitle}>Cadastros Rápidos</h3>
            <p className={styles.featureText}>Gerencie pacientes, preceptores e residentes de forma unificada.</p>
          </Link>

          <Link href="/atendimentos" className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Activity size={24} />
            </div>
            <h3 className={styles.featureTitle}>Atendimentos Clínicos</h3>
            <p className={styles.featureText}>Acompanhamento em tempo real e avaliação de risco de pacientes.</p>
          </Link>

          <Link href="/consultas/ranking-residentes" className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FileText size={24} />
            </div>
            <h3 className={styles.featureTitle}>Relatórios e Escalas</h3>
            <p className={styles.featureText}>Geração de auditorias, escalas e rankings de produtividade.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}