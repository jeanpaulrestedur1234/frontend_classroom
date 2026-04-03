import {
  ShieldCheck,
  CalendarDays,
  Package,
  CreditCard,
  Building2,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Gestión de Usuarios",
    description:
      "Control total de roles: administradores, profesores y estudiantes con permisos jerárquicos.",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    icon: CalendarDays,
    title: "Reservas Inteligentes",
    description:
      "Sistema de reservas con validación automática de horarios, capacidad y disponibilidad.",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    icon: Package,
    title: "Paquetes Flexibles",
    description:
      "Crea y gestiona paquetes educativos con precios, descuentos y control de horas.",
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    icon: CreditCard,
    title: "Pagos Seguros",
    description:
      "Flujo completo de pagos con comprobantes, aprobación administrativa y auditoría.",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    icon: Building2,
    title: "Gestión de Salones",
    description:
      "Administra salones físicos con control de capacidad y disponibilidad en tiempo real.",
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    icon: Clock,
    title: "Disponibilidad Docente",
    description:
      "Los profesores gestionan su horario semanal con validación de traslapes automática.",
    color: "text-rose-600",
    bg: "bg-rose-100",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-2">
            Características
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Herramientas poderosas diseñadas para simplificar la gestión de tu
            academia.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bg} ${feature.color} mb-5`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
