import { Link } from "react-router-dom";
import { ArrowRight, Users, CalendarCheck, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation("landing");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[var(--bg-main)]">
      {/* Decorative radial gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-[var(--primary)]/[0.03] blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div
              className="animate-fade-in-up inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)] text-sm font-medium text-[var(--text-body)] mb-8"
              style={{ animationDelay: "0s" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
              </span>
              {t("hero.badge")}
            </div>

            {/* Title */}
            <h1
              className="animate-fade-in-up font-[family-name:var(--font-display)] text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--text-heading)] leading-[1.08] tracking-tight"
              style={{ animationDelay: "0.1s" }}
            >
              {t("hero.title")}{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] to-blue-700 bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            {/* Description */}
            <p
              className="animate-fade-in-up mt-6 text-lg sm:text-xl text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto lg:mx-0"
              style={{ animationDelay: "0.2s" }}
            >
              {t("hero.description")}
            </p>

            {/* CTAs */}
            <div
              className="animate-fade-in-up mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              style={{ animationDelay: "0.3s" }}
            >
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--primary)] text-white font-semibold font-[family-name:var(--font-display)] hover:opacity-90 transition-all duration-200 shadow-lg shadow-[var(--primary)]/20 hover:shadow-xl hover:shadow-[var(--primary)]/30"
              >
                {t("hero.cta")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-body)] font-semibold font-[family-name:var(--font-display)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200"
              >
                {t("hero.ctaSecondary")}
              </a>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div
            className="hidden lg:block animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="relative">
              {/* Ambient glow behind card */}
              <div className="absolute -inset-4 bg-[var(--primary)]/[0.07] rounded-3xl blur-2xl" />

              {/* Main card */}
              <div className="relative bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-6 shadow-2xl shadow-black/20">
                {/* Window controls + title */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-main)]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="ml-2 text-xs text-[var(--text-muted)] font-[family-name:var(--font-display)]">
                    Dashboard
                  </span>
                  <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    <span className="text-xs text-[var(--primary)] font-medium">
                      Live
                    </span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    {
                      Icon: Users,
                      value: "248",
                      label: t("hero.mockup.students"),
                      accent: "blue",
                    },
                    {
                      Icon: CalendarCheck,
                      value: "56",
                      label: t("hero.mockup.classesToday"),
                      accent: "emerald",
                    },
                    {
                      Icon: BookOpen,
                      value: "12",
                      label: t("hero.mockup.teachers"),
                      accent: "sky",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-xl p-4 text-center"
                    >
                      <stat.Icon
                        className={`w-5 h-5 mx-auto mb-2 ${
                          stat.accent === "blue"
                            ? "text-blue-500"
                            : stat.accent === "emerald"
                            ? "text-emerald-500"
                            : "text-sky-500"
                        }`}
                      />
                      <p className="text-2xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
                        {stat.value}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Schedule preview */}
                <div className="space-y-2.5">
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 font-[family-name:var(--font-display)]">
                    {t("hero.mockup.scheduleTitle")}
                  </p>
                  {[
                    {
                      name: "Spanish A1",
                      teacher: "Prof. Garcia",
                      room: "Room A",
                      time: "09:00 - 10:30",
                      color: "bg-[var(--primary)]",
                    },
                    {
                      name: "Spanish B1",
                      teacher: "Prof. Martinez",
                      room: "Room B",
                      time: "10:30 - 12:00",
                      color: "bg-emerald-500",
                    },
                    {
                      name: "Conversation Club",
                      teacher: "Prof. Lopez",
                      room: "Room C",
                      time: "14:00 - 15:30",
                      color: "bg-sky-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1.5 h-8 rounded-full ${item.color}`}
                        />
                        <div>
                          <p className="text-sm font-medium text-[var(--text-main)]">
                            {item.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {item.teacher} — {item.room}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-muted)] font-mono">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification card */}
              <div className="absolute -bottom-5 -left-6 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl p-3.5 shadow-xl shadow-black/20 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-500 text-sm font-bold">
                      +
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-main)]">
                      {t("hero.mockup.newBooking")}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">2 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-main)] to-transparent pointer-events-none" />
    </section>
  );
}
