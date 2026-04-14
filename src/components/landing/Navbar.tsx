import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import LanguageSwitcher from "../ui/LanguageSwitcher";

const navLinks = [
  { key: "navbar.features", href: "#features" },
  { key: "navbar.howItWorks", href: "#how-it-works" },
  { key: "navbar.benefits", href: "#benefits" },
];

export default function Navbar() {
  const { t } = useTranslation("landing");
  const { t: tc } = useTranslation("common");
  const { theme, toggleTheme } = useTheme();
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
          ? "bg-[var(--bg-surface)]/80 backdrop-blur-xl border-b border-[var(--border-main)] shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <img src={theme === "dark" ? "/valley-white.png" : "/valley-dark.png"} alt="Valley Spanish School" className="h-10" />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors duration-200 rounded-lg hover:bg-[var(--bg-surface-hover)]"
              >
                {t(link.key)}
              </a>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "light" ? tc("navigation.darkMode") : tc("navigation.lightMode")}
              className="flex items-center justify-center h-9 w-9 rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] transition-all duration-200"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <LanguageSwitcher compact />
            <Link
              to="/login"
              className="inline-flex items-center px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold font-[family-name:var(--font-display)] hover:opacity-90 transition-all duration-200 shadow-lg shadow-[var(--primary)]/20"
            >
              {t("navbar.login")}
            </Link>
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--border-main)]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors text-sm font-medium rounded-xl hover:bg-[var(--bg-surface-hover)]"
                onClick={() => setMobileOpen(false)}
              >
                {t(link.key)}
              </a>
            ))}
            <div className="pt-3 border-t border-[var(--border-main)] flex items-center gap-3">
              <LanguageSwitcher compact />
              <Link
                to="/login"
                className="flex-1 text-center px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold font-[family-name:var(--font-display)] hover:opacity-90 transition-all duration-200 shadow-lg shadow-[var(--primary)]/20"
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
