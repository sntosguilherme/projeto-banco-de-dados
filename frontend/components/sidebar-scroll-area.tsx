import { ReactNode } from 'react';

interface SidebarScrollAreaProps {
  children: ReactNode;
}

export default function SidebarScrollArea({ children }: SidebarScrollAreaProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain p-4 pb-8 space-y-6 [scrollbar-gutter:stable]"
    >
      {children}
    </nav>
  );
}
