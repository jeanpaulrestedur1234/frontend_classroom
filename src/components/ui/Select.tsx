import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    const { t } = useTranslation();
    const id = props.id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            block w-full rounded-xl px-4 py-2.5 text-sm appearance-none
            bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)]
            transition-all duration-200
            hover:border-[var(--primary)]/50
            focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="" className="bg-[var(--bg-surface)] text-[var(--text-dim)]">{t('select.placeholder')}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--bg-surface)] text-[var(--text-main)]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
