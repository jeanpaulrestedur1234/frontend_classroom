import { CheckCircle2, Zap, Shield, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const statIcons = [Zap, Shield, Globe] as const;
const statKeys = ["uptime", "support", "academies"] as const;

export default function Benefits() {
  const { t } = useTranslation("landing");
  const benefitItems = t("benefits.items", { returnObjects: true }) as string[];

  return (
    <section id="benefits" className="relative py-24 sm:py-32 bg-[var(--bg-main)]">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            className="animate-fade-in-up text-[var(--primary)] font-semibold text-sm uppercase tracking-widest mb-3 font-[family-name:var(--font-display)]"
            style={{ animationDelay: "0s" }}
          >
            {t("benefits.sectionLabel")}
          </p>
          <h2
            className="animate-fade-in-up font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-heading)] tracking-tight"
            style={{ animationDelay: "0.1s" }}
          >
            {t("benefits.title")}
          </h2>
          <p
            className="animate-fade-in-up mt-4 text-lg text-[var(--text-muted)] leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            {t("benefits.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: benefits list */}
          <div
            className="animate-fade-in-up bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-8"
            style={{ animationDelay: "0.2s" }}
          >
            <ul className="space-y-5">
              {benefitItems.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <span className="text-[var(--text-body)] text-base leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-[var(--border-main)]">
              <a
                href="#features"
                className="group inline-flex items-center gap-2 text-[var(--primary)] font-medium hover:opacity-80 transition-colors font-[family-name:var(--font-display)] text-sm"
              >
                {t("benefits.exploreFeatures")}
                <span
                  aria-hidden="true"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  &rarr;
                </span>
              </a>
            </div>
          </div>

          {/* Right: stats card */}
          <div
            className="animate-fade-in-up relative"
            style={{ animationDelay: "0.35s" }}
          >
            <div className="relative bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)] to-[var(--bg-subtle)] border border-[var(--border-main)] rounded-2xl p-8 sm:p-10 overflow-hidden">
              {/* Decorative elements inside card */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--primary)]/[0.06] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-[var(--primary)]/[0.04] rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

              <div className="relative">
                <h3 className="text-xl font-semibold text-[var(--text-heading)] mb-8 font-[family-name:var(--font-display)]">
                  {t("benefits.statsCardTitle")}
                </h3>

                <div className="space-y-4">
                  {statKeys.map((key, index) => {
                    const Icon = statIcons[index];
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-4 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl p-4 hover:bg-[var(--bg-surface-hover)] transition-colors duration-200"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
                            {t(`benefits.stats.${key}.value`)}
                          </p>
                          <p className="text-[var(--text-muted)] text-sm">
                            {t(`benefits.stats.${key}.label`)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
