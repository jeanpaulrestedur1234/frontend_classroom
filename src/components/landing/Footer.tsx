import { useTranslation } from "react-i18next";

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
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-zinc-950 border-t border-white/[0.06]">
      {/* Top decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a
              href="#"
              className="inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] font-bold text-xl mb-5"
            >
              <div className="relative flex items-center justify-center w-7 h-7">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5"
                  stroke="url(#footer-logo-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <defs>
                    <linearGradient
                      id="footer-logo-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                ClassRoom Pro
              </span>
            </a>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.titleKey}>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4 font-[family-name:var(--font-display)]">
                {t(group.titleKey)}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.labelKey}>
                    <a
                      href={link.href}
                      className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors duration-200"
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
        <div className="border-t border-white/[0.06] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            {t("footer.copyright", { year: currentYear })}
          </p>
          <p className="text-zinc-700 text-xs">
            {t("footer.madeWith")}
          </p>
        </div>
      </div>
    </footer>
  );
}
