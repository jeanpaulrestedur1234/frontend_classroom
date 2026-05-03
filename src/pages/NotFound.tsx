import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-main)] px-4 text-center">
      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-[var(--primary)]/5 blur-[120px] pointer-events-none" />

      <p className="text-8xl font-bold font-[family-name:var(--font-display)] bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
        Página no encontrada
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
        La página que buscas no existe o fue movida.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:opacity-90 active:scale-[0.98] font-[family-name:var(--font-display)]"
        >
          <Home className="h-4 w-4" />
          Inicio
        </Link>
        <button
          onClick={() => history.back()}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] px-5 py-2.5 text-sm font-medium text-[var(--text-body)] transition-all hover:bg-[var(--bg-surface-hover)] active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>
    </div>
  );
}
