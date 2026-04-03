import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, CalendarCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Plataforma de gestión educativa
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Gestiona tu academia de forma{" "}
              <span className="text-indigo-600">inteligente</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              La plataforma todo-en-uno para administrar clases, profesores,
              salones, pagos y reservas de tu academia.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25"
              >
                Comenzar ahora
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-indigo-200 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
              >
                Ver características
              </a>
            </div>
          </div>

          {/* Decorative mockup */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-2xl shadow-2xl shadow-indigo-200/50 p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-sm text-gray-400">Dashboard</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">248</p>
                    <p className="text-xs text-gray-500">Estudiantes</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4 text-center">
                    <CalendarCheck className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">56</p>
                    <p className="text-xs text-gray-500">Clases hoy</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-xs text-gray-500">Profesores</p>
                  </div>
                </div>

                {/* Schedule preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded bg-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Inglés B2</p>
                        <p className="text-xs text-gray-500">Prof. García - Salón 3</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">09:00 - 10:30</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded bg-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Francés A1</p>
                        <p className="text-xs text-gray-500">Prof. Dupont - Salón 1</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">10:30 - 12:00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded bg-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Alemán A2</p>
                        <p className="text-xs text-gray-500">Prof. Müller - Salón 5</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">14:00 - 15:30</span>
                  </div>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-lg">+</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nueva reserva</p>
                    <p className="text-xs text-gray-500">Hace 2 minutos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
