import { forwardRef } from 'react';
import { Loader } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)] disabled:opacity-40 disabled:cursor-not-allowed font-[family-name:var(--font-display)]';

    const variants: Record<string, string> = {
      primary: 'bg-[var(--primary)] text-white font-semibold shadow-lg shadow-black/10 hover:bg-[var(--primary-hover)] active:scale-[0.98]',
      secondary: 'bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] active:scale-[0.98]',
      danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/30 active:scale-[0.98]',
      ghost: 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] active:scale-[0.98]',
    };

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
