import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Login() {
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation('common');
  const { user, login, loading: authLoading } = useAuth();
  const { toast: toastNotify } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, authLoading, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
      // Success toast is optional here as we redirect, but let's add it for feedback
      toastNotify(t('login.successMessage') || 'Login successful', 'success');
      navigate('/app', { replace: true });
    } catch (err: any) {
      // The global interceptor will handle most errors, 
      // but we can add specific handling here if needed.
      // Since we want to avoid double toasts, we can check if it's already handled.
      // Actually, for Login, the 401 might NOT be caught by the global interceptor 
      // because it's a "known" error case for login.
      // Let's assume the global interceptor handled it, or we can use the _quiet flag if we want manual control.
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-main)]">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-[var(--border-strong)]" />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-[var(--primary)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg-main)] overflow-hidden px-4">
      {/* ── Decorative background orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[var(--primary)]/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/5 blur-[140px]" />
      </div>

      {/* ── Language switcher ── */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* ── Main content ── */}
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-8 shadow-2xl shadow-black/10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/valley-logo.png" alt="Valley Spanish School" className="h-12 mb-4" />
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] bg-gradient-to-r from-[var(--primary)] via-blue-500 to-violet-500 bg-clip-text text-transparent">
              {tc('appName')}
            </h1>
          </div>

          {/* Title & subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-[var(--text-heading)]">
              {t('login.title')}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                id="email"
                type="email"
                required
                label={t('login.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                className="pl-10"
              />
              <Mail className="absolute left-3 top-[38px] w-4 h-4 text-[var(--text-dim)] pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                id="password"
                type="password"
                required
                label={t('login.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                className="pl-10"
              />
              <Lock className="absolute left-3 top-[38px] w-4 h-4 text-[var(--text-dim)] pointer-events-none" />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              size="lg"
              className="w-full"
            >
              {t('login.submit')}
            </Button>
          </form>
        </div>

        {/* Back to home link */}
        <div className="flex justify-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('login.backToHome')}
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-[var(--text-dim)] mt-6">
          &copy; {new Date().getFullYear()} {tc('appName')}
        </p>
      </div>
    </div>
  );
}
