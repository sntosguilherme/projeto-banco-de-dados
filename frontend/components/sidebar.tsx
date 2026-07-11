'use client';

import Link from 'next/link';
import { 
  Menu, X, UserPlus, Users, GraduationCap, 
  BarChart3, ClipboardCheck, Clock, AlertTriangle, 
  FileText, History, Home, LucideIcon 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavigationSection {
  title: string;
  links: { label: string; href: string; icon: LucideIcon }[];
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const toggleSidebar = () => setIsOpen(!isOpen);

  const navigationData: NavigationSection[] = [
    {
      title: 'Cadastros',
      links: [
        // app/cadastros/pacientes/page.tsx
        { label: 'Paciente', href: '/cadastros/pacientes', icon: UserPlus },
        // app/cadastros/residentes/page.tsx
        { label: 'Residente', href: '/cadastros/residentes', icon: Users },
        // app/cadastros/preceptores/page.tsx
        { label: 'Preceptor', href: '/cadastros/preceptores', icon: GraduationCap },
      ],
    },
    {
      title: 'Consultas',
      links: [
        // app/consultas/pacientes/page.tsx
        { label: 'Visualizar Pacientes', href: '/consultas/pacientes', icon: Users },
        // app/consultas/profissionais/page.tsx
        { label: 'Visualizar Profissionais', href: '/consultas/profissionais', icon: GraduationCap },
        // app/consultas/ranking-residentes/page.tsx
        { label: 'Ranking de Residentes', href: '/consultas/ranking-residentes', icon: BarChart3 },
        // app/consultas/preceptores-supervisao/page.tsx
        { label: 'Supervisão de Preceptores', href: '/consultas/preceptores-supervisao', icon: ClipboardCheck },
        // app/consultas/plantoes-unidade/page.tsx
        { label: 'Plantões por Unidade', href: '/consultas/plantoes-unidade', icon: Clock },
        // app/consultas/pacientes-sem-risco-alto/page.tsx
        { label: 'Pacientes sem Risco Alto', href: '/consultas/pacientes-sem-risco-alto', icon: AlertTriangle },
      ],
    },
    {
      title: 'Atendimentos',
      links: [
        // app/atendimentos/novo/page.tsx
        { label: 'Criar Atendimento', href: '/atendimentos/novo', icon: FileText },
        // app/atendimentos/page.tsx (histórico é a raiz de /atendimentos)
        { label: 'Ver Histórico', href: '/atendimentos', icon: History },
      ],
    },
  ];

  return (
    <>
      {/* Botão Hambúrguer Fixo (Aparece quando fechado) */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Container da Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen border-r border-neutral-200 bg-white transition-transform duration-300 ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-100">
          <Link href="/" className="flex items-center gap-2 font-medium text-neutral-800 text-sm">
            <Home className="h-4 w-4 text-neutral-500" />
            <span>Painel Hospitalar</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-6">
          {navigationData.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="mt-2 space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 rounded-md hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-neutral-400" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}