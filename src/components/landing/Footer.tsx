import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

interface FooterLink {
  labelKey: string;
  href: string;
}

interface FooterGroup {
  titleKey: string;
  links: FooterLink[];
}

const linkGroups: FooterGroup[] = [
  {
    titleKey: "footer.product.title",
    links: [
      { labelKey: "footer.product.features", href: "#features" },
      { labelKey: "footer.product.howItWorks", href: "#how-it-works" },
      { labelKey: "footer.product.benefits", href: "#benefits" },
      { labelKey: "footer.product.pricing", href: "#" },
    ],
  },
  {
    titleKey: "footer.support.title",
    links: [
      { labelKey: "footer.support.helpCenter", href: "#" },
      { labelKey: "footer.support.docs", href: "#" },
      { labelKey: "footer.support.contact", href: "#" },
      { labelKey: "footer.support.status", href: "#" },
    ],
  },
  {
    titleKey: "footer.legal.title",
    links: [
      { labelKey: "footer.legal.terms", href: "#" },
      { labelKey: "footer.legal.privacy", href: "#" },
      { labelKey: "footer.legal.cookies", href: "#" },
    ],
  },
];

export default function Footer() {
  const { t } = useTranslation("landing");
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--bg-surface)] border-t border-[var(--border-main)]">
      {/* Top decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-flex items-center mb-5">
              <img src={theme === "dark" ? "/valley-white.png" : "/valley-dark.png"} alt="Valley Spanish School" className="h-10" />
            </a>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.titleKey}>
              <h4 className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider mb-4 font-[family-name:var(--font-display)]">
                {t(group.titleKey)}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.labelKey}>
                    <a
                      href={link.href}
                      className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm transition-colors duration-200"
                    >
                      {t(link.labelKey)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-[var(--border-main)] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--text-muted)] text-sm">
            {t("footer.copyright", { year: currentYear })}
          </p>
          <p className="text-[var(--text-dim)] text-xs">
            {t("footer.madeWith")}
          </p>
        </div>
      </div>
    </footer>
  );
}
