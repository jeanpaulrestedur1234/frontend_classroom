import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, ArrowLeft, Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Login() {
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation('common');
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/app', { replace: true });
    }
  }, [user, authLoading, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join('. '));
      } else {
        setError(t('login.error'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-zinc-800" />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden px-4">
      {/* ── Decorative background orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Amber orb — top right */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
        {/* Purple orb — bottom left */}
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/5 blur-[140px]" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Language switcher — top right corner ── */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      {/* ── Main content ── */}
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 mb-4">
              <GraduationCap className="w-7 h-7 text-zinc-950" />
            </div>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              {tc('appName')}
            </h1>
          </div>

          {/* Title & subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold font-[family-name:var(--font-display)] text-zinc-100">
              {t('login.title')}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 mb-6 rounded-xl bg-rose-500/[0.07] backdrop-blur border border-rose-500/15 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

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
              <Mail className="absolute left-3 top-[38px] w-4 h-4 text-zinc-600 pointer-events-none" />
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
              <Lock className="absolute left-3 top-[38px] w-4 h-4 text-zinc-600 pointer-events-none" />
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
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-amber-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('login.backToHome')}
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-zinc-700 mt-6">
          &copy; {new Date().getFullYear()} {tc('appName')}
        </p>
      </div>
    </div>
  );
}
