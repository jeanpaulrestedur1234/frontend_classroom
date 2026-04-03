import { CheckCircle2, Zap, Shield, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const statIcons = [Zap, Shield, Globe] as const;
const statKeys = ["uptime", "support", "academies"] as const;

export default function Benefits() {
  const { t } = useTranslation("landing");
  const benefitItems = t("benefits.items", { returnObjects: true }) as string[];

  return (
    <section id="benefits" className="relative py-24 sm:py-32 bg-zinc-950">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            className="animate-fade-in-up text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3 font-[family-name:var(--font-display)]"
            style={{ animationDelay: "0s" }}
          >
            {t("benefits.sectionLabel")}
          </p>
          <h2
            className="animate-fade-in-up font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-50 tracking-tight"
            style={{ animationDelay: "0.1s" }}
          >
            {t("benefits.title")}
          </h2>
          <p
            className="animate-fade-in-up mt-4 text-lg text-zinc-400 leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            {t("benefits.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: benefits list */}
          <div
            className="animate-fade-in-up bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8"
            style={{ animationDelay: "0.2s" }}
          >
            <ul className="space-y-5">
              {benefitItems.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-zinc-300 text-base leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <a
                href="#features"
                className="group inline-flex items-center gap-2 text-amber-400 font-medium hover:text-amber-300 transition-colors font-[family-name:var(--font-display)] text-sm"
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
            <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/[0.08] rounded-2xl p-8 sm:p-10 overflow-hidden">
              {/* Decorative elements inside card */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.06] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/[0.04] rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

              <div className="relative">
                <h3 className="text-xl font-semibold text-zinc-100 mb-8 font-[family-name:var(--font-display)]">
                  {t("benefits.statsCardTitle")}
                </h3>

                <div className="space-y-4">
                  {statKeys.map((key, index) => {
                    const Icon = statIcons[index];
                    return (
                      <div
                        key={key}
                        className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors duration-200"
                      >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-zinc-50 font-[family-name:var(--font-display)]">
                            {t(`benefits.stats.${key}.value`)}
                          </p>
                          <p className="text-zinc-400 text-sm">
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
