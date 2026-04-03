import { CheckCircle2, Zap, Shield, Globe } from "lucide-react";

const benefits = [
  "Ahorra tiempo automatizando la gestión de reservas",
  "Evita conflictos de horario con validación inteligente",
  "Control financiero completo con flujo de pagos",
  "Acceso basado en roles para mayor seguridad",
  "Escalable: desde academias pequeñas hasta grandes instituciones",
];

const stats = [
  { label: "Uptime garantizado", value: "99.9%", icon: Zap },
  { label: "Soporte técnico", value: "24/7", icon: Shield },
  { label: "Academias activas", value: "500+", icon: Globe },
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-2">
            Ventajas
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            ¿Por qué elegir ClassRoom Pro?
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: benefits list */}
          <div>
            <ul className="space-y-5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-base leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              >
                Explorar todas las características
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>

          {/* Right: stats card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 sm:p-10 text-white shadow-2xl shadow-indigo-600/20">
              <h3 className="text-xl font-semibold mb-8">
                La confianza de cientos de academias
              </h3>

              <div className="space-y-6">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 bg-white/10 rounded-xl p-4"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-indigo-200 text-sm">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
