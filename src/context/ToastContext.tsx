import {
  useCallback,
  useContext,
  createContext,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';

/* ───────────────────── Types ─────────────────────────────────────────────── */

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/* ───────────────────── Provider ───────────────────────────────────────────── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    switch (variant) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
      default:
        toast.info(message);
        break;
    }
  }, []);

  const value: ToastContextValue = {
    toast: showToast,
    success: useCallback((m: string) => toast.success(m), []),
    error: useCallback((m: string) => toast.error(m), []),
    warning: useCallback((m: string) => toast.warning(m), []),
    info: useCallback((m: string) => toast.info(m), []),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

/* ───────────────────── Hook ──────────────────────────────────────────────── */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  // If used outside of a provider, we can still fall back to direct sonner calls
  if (!ctx) {
     return {
      toast: (msg, variant) => {
        if (variant === 'success') toast.success(msg);
        else if (variant === 'error') toast.error(msg);
        else if (variant === 'warning') toast.warning(msg);
        else toast.info(msg);
      },
      success: (msg) => toast.success(msg),
      error: (msg) => toast.error(msg),
      warning: (msg) => toast.warning(msg),
      info: (msg) => toast.info(msg),
    };
  }
  return ctx;
}

