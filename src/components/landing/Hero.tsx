import { Link } from "react-router-dom";
import { ArrowRight, Users, CalendarCheck, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation("landing");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Decorative radial gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-blue-600/[0.03] blur-3xl" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div
              className="animate-fade-in-up inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-50 backdrop-blur-xl border border-zinc-200 text-sm font-medium text-zinc-700 mb-8"
              style={{ animationDelay: "0s" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              {t("hero.badge")}
            </div>

            {/* Title */}
            <h1
              className="animate-fade-in-up font-[family-name:var(--font-display)] text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-950 leading-[1.08] tracking-tight"
              style={{ animationDelay: "0.1s" }}
            >
              {t("hero.title")}{" "}
              <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            {/* Description */}
            <p
              className="animate-fade-in-up mt-6 text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-lg mx-auto lg:mx-0"
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
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white font-semibold font-[family-name:var(--font-display)] hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
              >
                {t("hero.cta")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-zinc-50 backdrop-blur-xl border border-zinc-200 text-zinc-700 font-semibold font-[family-name:var(--font-display)] hover:bg-zinc-100 hover:border-zinc-300 transition-all duration-200"
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
              <div className="absolute -inset-4 bg-blue-600/[0.07] rounded-3xl blur-2xl" />

              {/* Main card */}
              <div className="relative bg-zinc-50 backdrop-blur-xl border border-zinc-200 rounded-2xl p-6 shadow-2xl shadow-black/40">
                {/* Window controls + title */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  </div>
                  <span className="ml-2 text-xs text-zinc-500 font-[family-name:var(--font-display)]">
                    Dashboard
                  </span>
                  <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-600/10 border border-blue-600/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs text-blue-500 font-medium">
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
                      className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-center"
                    >
                      <stat.Icon
                        className={`w-5 h-5 mx-auto mb-2 ${
                          stat.accent === "blue"
                            ? "text-blue-500"
                            : stat.accent === "emerald"
                            ? "text-emerald-400"
                            : "text-sky-400"
                        }`}
                      />
                      <p className="text-2xl font-bold text-zinc-950 font-[family-name:var(--font-display)]">
                        {stat.value}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Schedule preview */}
                <div className="space-y-2.5">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 font-[family-name:var(--font-display)]">
                    {t("hero.mockup.scheduleTitle")}
                  </p>
                  {[
                    {
                      name: "Spanish A1",
                      teacher: "Prof. Garcia",
                      room: "Room A",
                      time: "09:00 - 10:30",
                      color: "bg-blue-500",
                    },
                    {
                      name: "Spanish B1",
                      teacher: "Prof. Martinez",
                      room: "Room B",
                      time: "10:30 - 12:00",
                      color: "bg-emerald-400",
                    },
                    {
                      name: "Conversation Club",
                      teacher: "Prof. Lopez",
                      room: "Room C",
                      time: "14:00 - 15:30",
                      color: "bg-sky-400",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-zinc-50/50 border border-white/[0.04] rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1.5 h-8 rounded-full ${item.color}`}
                        />
                        <div>
                          <p className="text-sm font-medium text-zinc-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {item.teacher} — {item.room}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification card */}
              <div className="absolute -bottom-5 -left-6 bg-zinc-100 backdrop-blur-xl border border-zinc-200 rounded-xl p-3.5 shadow-xl shadow-black/30 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 text-sm font-bold">
                      +
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {t("hero.mockup.newBooking")}
                    </p>
                    <p className="text-xs text-zinc-500">2 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
