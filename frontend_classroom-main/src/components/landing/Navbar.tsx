import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../ui/LanguageSwitcher";

const navLinks = [
  { key: "navbar.features", href: "#features" },
  { key: "navbar.howItWorks", href: "#how-it-works" },
  { key: "navbar.benefits", href: "#benefits" },
];

export default function Navbar() {
  const { t } = useTranslation("landing");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-zinc-100 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <img src="/valley-logo.png" alt="Valley Spanish School" className="h-10" />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-zinc-400 hover:text-blue-500 transition-colors duration-200 rounded-lg hover:bg-zinc-50"
              >
                {t(link.key)}
              </a>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher compact />
            <Link
              to="/login"
              className="inline-flex items-center px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold font-[family-name:var(--font-display)] hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/20"
            >
              {t("navbar.login")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-zinc-100">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-zinc-400 hover:text-blue-500 transition-colors text-sm font-medium rounded-xl hover:bg-zinc-50"
                onClick={() => setMobileOpen(false)}
              >
                {t(link.key)}
              </a>
            ))}
            <div className="pt-3 border-t border-zinc-100 flex items-center gap-3">
              <LanguageSwitcher compact />
              <Link
                to="/login"
                className="flex-1 text-center px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold font-[family-name:var(--font-display)] hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/20"
                onClick={() => setMobileOpen(false)}
              >
                {t("navbar.login")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
