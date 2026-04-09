import { UserPlus, Settings, CalendarCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Step {
  number: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const steps: Step[] = [
  {
    number: "1",
    icon: UserPlus,
    titleKey: "howItWorks.steps.1.title",
    descKey: "howItWorks.steps.1.description",
  },
  {
    number: "2",
    icon: Settings,
    titleKey: "howItWorks.steps.2.title",
    descKey: "howItWorks.steps.2.description",
  },
  {
    number: "3",
    icon: CalendarCheck,
    titleKey: "howItWorks.steps.3.title",
    descKey: "howItWorks.steps.3.description",
  },
  {
    number: "4",
    icon: TrendingUp,
    titleKey: "howItWorks.steps.4.title",
    descKey: "howItWorks.steps.4.description",
  },
];

export default function HowItWorks() {
  const { t } = useTranslation("landing");

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-[var(--bg-main)]">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-violet-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p
            className="animate-fade-in-up text-[var(--primary)] font-semibold text-sm uppercase tracking-widest mb-3 font-[family-name:var(--font-display)]"
            style={{ animationDelay: "0s" }}
          >
            {t("howItWorks.sectionLabel")}
          </p>
          <h2
            className="animate-fade-in-up font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-heading)] tracking-tight"
            style={{ animationDelay: "0.1s" }}
          >
            {t("howItWorks.title")}
          </h2>
          <p
            className="animate-fade-in-up mt-4 text-lg text-[var(--text-muted)] leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            {t("howItWorks.subtitle")}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line - desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="animate-fade-in-up relative text-center"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Number circle */}
                <div className="relative inline-flex flex-col items-center">
                  <div className="relative">
                    {/* Outer glow ring */}
                    <div className="absolute -inset-2 rounded-full bg-[var(--primary)]/10 blur-md" />

                    {/* Glass circle */}
                    <div className="relative w-[104px] h-[104px] rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center">
                      <span className="text-3xl font-bold bg-gradient-to-b from-[var(--primary)] to-blue-700 bg-clip-text text-transparent font-[family-name:var(--font-display)]">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon badge */}
                    <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center shadow-lg">
                      <step.icon className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                  </div>
                </div>

                {/* Text */}
                <h3 className="mt-6 text-lg font-semibold text-[var(--text-main)] font-[family-name:var(--font-display)]">
                  {t(step.titleKey)}
                </h3>
                <p className="mt-2 text-[var(--text-muted)] text-sm leading-relaxed max-w-xs mx-auto">
                  {t(step.descKey)}
                </p>

                {/* Mobile connector arrow */}
                {index < steps.length - 1 && (
                  <div className="sm:hidden flex justify-center mt-6 mb-2">
                    <div className="w-px h-8 bg-gradient-to-b from-[var(--primary)]/20 to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
