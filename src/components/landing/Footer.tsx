import { GraduationCap } from "lucide-react";

const linkGroups = [
  {
    title: "Producto",
    links: [
      { label: "Características", href: "#features" },
      { label: "Cómo funciona", href: "#how-it-works" },
      { label: "Beneficios", href: "#benefits" },
      { label: "Precios", href: "#" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Centro de ayuda", href: "#" },
      { label: "Documentación", href: "#" },
      { label: "Contacto", href: "#" },
      { label: "Estado del servicio", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos de servicio", href: "#" },
      { label: "Política de privacidad", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <GraduationCap className="w-7 h-7 text-indigo-400" />
              <span>ClassRoom Pro</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              La plataforma integral para la gestión de academias e
              instituciones educativas. Simplifica tu operación diaria.
            </p>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} ClassRoom Pro. Todos los derechos reservados.
          </p>
          <p className="text-gray-600 text-xs">
            Hecho con dedicación para la educación
          </p>
        </div>
      </div>
    </footer>
  );
}
