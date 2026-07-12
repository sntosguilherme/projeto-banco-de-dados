export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold text-neutral-800 tracking-tight sm:text-4xl">
          Sistema Hospitalar Dra. Yuska Maritan Brito
        </h1>
        <p className="text-neutral-500 mt-4 text-base sm:text-lg leading-relaxed">
          Use o menu lateral para gerenciar cadastros de profissionais, emitir relatórios de consultas avançadas ou iniciar novos atendimentos.
        </p>
      </div>
    </div>
  );
}