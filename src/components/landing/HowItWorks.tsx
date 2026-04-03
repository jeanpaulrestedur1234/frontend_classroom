import { UserPlus, Settings, CalendarCheck, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Registra tu equipo",
    description:
      "Los administradores crean cuentas para profesores y estudiantes.",
  },
  {
    number: "2",
    icon: Settings,
    title: "Configura tu oferta",
    description:
      "Define paquetes educativos, salones y horarios disponibles.",
  },
  {
    number: "3",
    icon: CalendarCheck,
    title: "Los estudiantes reservan",
    description:
      "Los alumnos adquieren paquetes y reservan sus clases.",
  },
  {
    number: "4",
    icon: TrendingUp,
    title: "Gestiona y crece",
    description:
      "Monitorea pagos, ocupación y rendimiento desde el dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-2">
            Proceso
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            ¿Cómo funciona?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Cuatro simples pasos para transformar la gestión de tu academia.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-0.5 bg-indigo-200" />
              )}

              {/* Number circle */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-600 text-white text-2xl font-bold mb-6 shadow-lg shadow-indigo-600/25">
                {step.number}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-indigo-600" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
