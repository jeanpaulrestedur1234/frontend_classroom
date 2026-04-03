import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const id = props.id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            block w-full rounded-xl px-4 py-2.5 text-sm
            bg-white/5 border border-white/10 text-zinc-100 placeholder:text-zinc-600
            transition-all duration-200
            hover:border-white/20
            focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
