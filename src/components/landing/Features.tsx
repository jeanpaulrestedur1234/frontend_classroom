import {
  ShieldCheck,
  CalendarDays,
  Package,
  CreditCard,
  Building2,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface FeatureItem {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

const features: FeatureItem[] = [
  {
    icon: ShieldCheck,
    titleKey: "features.items.users.title",
    descKey: "features.items.users.description",
    accentColor: "text-blue-500",
    accentBg: "bg-blue-600/10",
    accentBorder: "group-hover:border-blue-500/30",
  },
  {
    icon: CalendarDays,
    titleKey: "features.items.bookings.title",
    descKey: "features.items.bookings.description",
    accentColor: "text-emerald-500",
    accentBg: "bg-emerald-500/10",
    accentBorder: "group-hover:border-emerald-500/30",
  },
  {
    icon: Package,
    titleKey: "features.items.packages.title",
    descKey: "features.items.packages.description",
    accentColor: "text-sky-500",
    accentBg: "bg-sky-500/10",
    accentBorder: "group-hover:border-sky-500/30",
  },
  {
    icon: CreditCard,
    titleKey: "features.items.payments.title",
    descKey: "features.items.payments.description",
    accentColor: "text-rose-500",
    accentBg: "bg-rose-500/10",
    accentBorder: "group-hover:border-rose-500/30",
  },
  {
    icon: Building2,
    titleKey: "features.items.rooms.title",
    descKey: "features.items.rooms.description",
    accentColor: "text-purple-500",
    accentBg: "bg-purple-500/10",
    accentBorder: "group-hover:border-purple-500/30",
  },
  {
    icon: Clock,
    titleKey: "features.items.availability.title",
    descKey: "features.items.availability.description",
    accentColor: "text-cyan-500",
    accentBg: "bg-cyan-500/10",
    accentBorder: "group-hover:border-cyan-500/30",
  },
];

export default function Features() {
  const { t } = useTranslation("landing");

  return (
    <section id="features" className="relative py-24 sm:py-32 bg-[var(--bg-main)]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--primary)]/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p
            className="animate-fade-in-up text-[var(--primary)] font-semibold text-sm uppercase tracking-widest mb-3 font-[family-name:var(--font-display)]"
            style={{ animationDelay: "0s" }}
          >
            {t("features.sectionLabel")}
          </p>
          <h2
            className="animate-fade-in-up font-[family-name:var(--font-display)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-heading)] tracking-tight"
            style={{ animationDelay: "0.1s" }}
          >
            {t("features.title")}
          </h2>
          <p
            className="animate-fade-in-up mt-4 text-lg text-[var(--text-muted)] leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            {t("features.subtitle")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className={`group animate-fade-in-up relative bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-6 hover:bg-[var(--bg-surface-hover)] transition-all duration-300 ${feature.accentBorder}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.accentBg} ${feature.accentColor} mb-5 border border-[var(--border-main)]`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2 font-[family-name:var(--font-display)]">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
