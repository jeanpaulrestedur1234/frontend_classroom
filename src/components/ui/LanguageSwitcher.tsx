import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es';

  const toggle = () => {
    i18n.changeLanguage(currentLang === 'es' ? 'en' : 'es');
  };

  if (compact) {
    return (
      <button
        onClick={toggle}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all duration-200"
        title={currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      >
        <span className="text-xs font-semibold font-[family-name:var(--font-display)] uppercase">
          {currentLang === 'es' ? 'EN' : 'ES'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-sm text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all duration-200"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{currentLang === 'es' ? 'EN' : 'ES'}</span>
    </button>
  );
}
