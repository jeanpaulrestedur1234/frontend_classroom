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
          <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            block w-full rounded-xl px-4 py-2.5 text-sm appearance-none
            bg-white/5 border border-white/10 text-zinc-900
            transition-all duration-200
            hover:border-white/20
            focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="" className="bg-zinc-50 text-zinc-400">{t('select.placeholder')}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-50 text-zinc-900">
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
