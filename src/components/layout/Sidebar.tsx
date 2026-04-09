import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  User as UserIcon,
  Users as UsersIcon,
  Building2,
  Package,
  CreditCard,
  CalendarDays,
  Clock,
  CalendarPlus,
  LogOut,
  Menu,
  X as XIcon,
  ChevronLeft,
  DoorOpen,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { UserRole } from '@/types';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface NavItem {
  labelKey: string;
  to: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    labelKey: 'navigation.dashboard',
    to: '/app',
    icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin', 'teacher', 'student'],
  },
  {
    labelKey: 'navigation.profile',
    to: '/app/profile',
    icon: <UserIcon className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin', 'teacher', 'student'],
  },
  {
    labelKey: 'navigation.users',
    to: '/app/users',
    icon: <UsersIcon className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin'],
  },
  {
    labelKey: 'navigation.rooms',
    to: '/app/rooms',
    icon: <Building2 className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin'],
  },
  {
    labelKey: 'navigation.packages',
    to: '/app/packages',
    icon: <Package className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin', 'student'],
  },
  {
    labelKey: 'navigation.payments',
    to: '/app/payments',
    icon: <CreditCard className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin', 'student'],
  },
  {
    labelKey: 'navigation.bookings',
    to: '/app/bookings',
    icon: <CalendarDays className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin'],
  },
  {
    labelKey: 'navigation.roomAvailability',
    to: '/app/rooms/availability',
    icon: <DoorOpen className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin'],
  },
  {
    labelKey: 'navigation.myAvailability',
    to: '/app/availability',
    icon: <Clock className="h-5 w-5 shrink-0" />,
    roles: ['teacher'],
  },
  {
    labelKey: 'navigation.myClasses',
    to: '/app/bookings',
    icon: <CalendarDays className="h-5 w-5 shrink-0" />,
    roles: ['teacher'],
  },
  {
    labelKey: 'navigation.myPackages',
    to: '/app/my-packages',
    icon: <Package className="h-5 w-5 shrink-0" />,
    roles: ['student'],
  },
  {
    labelKey: 'navigation.newBooking',
    to: '/app/bookings/new',
    icon: <CalendarPlus className="h-5 w-5 shrink-0" />,
    roles: ['student'],
  },
  {
    labelKey: 'navigation.myBookings',
    to: '/app/bookings',
    icon: <CalendarDays className="h-5 w-5 shrink-0" />,
    roles: ['student'],
  },
];

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[var(--bg-surface)] border-r border-[var(--border-main)] transition-colors duration-300">
      {/* Logo & Toggle */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--border-main)]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Logo */}
          <img src="/valley-logo.png" alt="Valley Spanish School" className={expanded ? "h-8" : "h-6 w-6 object-contain"} />
        </div>
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform duration-300 ${!expanded ? 'rotate-180' : ''
              }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to + item.labelKey}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
              ${expanded ? '' : 'justify-center'
              }
              ${isActive
                ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-l-2 border-[var(--primary)] shadow-sm shadow-blue-500/5'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] border-l-2 border-transparent'
              }`
            }
          >
            <span className="shrink-0 transition-colors duration-200">
              {item.icon}
            </span>
            {expanded && (
              <span className="overflow-hidden whitespace-nowrap transition-opacity duration-200">
                {t(item.labelKey)}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[var(--border-main)] p-3 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all duration-200 ${expanded ? '' : 'justify-center'}`}
          title={theme === 'light' ? t('navigation.darkMode') : t('navigation.lightMode')}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          {expanded && (
            <span className="whitespace-nowrap">{theme === 'light' ? t('navigation.darkMode') : t('navigation.lightMode')}</span>
          )}
        </button>

        {/* Language switcher */}
        <div className={`flex ${expanded ? 'justify-start' : 'justify-center'}`}>
          <LanguageSwitcher compact={!expanded} />
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 ${expanded ? '' : 'justify-center'
            }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {expanded && (
            <span className="whitespace-nowrap">{t('navigation.logout')}</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center h-10 w-10 rounded-xl bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all duration-200 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-out lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="relative h-full">
          <button
            onClick={closeMobile}
            className="absolute top-4 right-3 z-10 flex items-center justify-center h-8 w-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-all duration-200"
            aria-label="Close menu"
          >
            <XIcon className="h-5 w-5" />
          </button>
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col transition-all duration-300 ease-out ${expanded ? 'lg:w-[260px]' : 'lg:w-[72px]'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
