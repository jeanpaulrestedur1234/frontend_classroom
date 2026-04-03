import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
            <AlertTriangle className="h-8 w-8 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-100 font-[family-name:var(--font-display)]">
              Algo salió mal
            </h2>
            <p className="max-w-md text-sm text-zinc-500">
              Ocurrió un error inesperado. Puedes intentar recargar esta sección.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 max-w-lg overflow-auto rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-left text-xs text-rose-400/80">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
