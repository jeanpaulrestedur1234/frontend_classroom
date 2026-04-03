import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Users,
  Building2,
  Package,
  CreditCard,
  CalendarDays,
  Clock,
  CalendarPlus,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/app',
    icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin', 'teacher', 'student'],
  },
  {
    label: 'Mi Perfil',
    to: '/app/profile',
    icon: <User className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin', 'teacher', 'student'],
  },
  {
    label: 'Usuarios',
    to: '/app/users',
    icon: <Users className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Salones',
    to: '/app/rooms',
    icon: <Building2 className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Paquetes',
    to: '/app/packages',
    icon: <Package className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Pagos',
    to: '/app/payments',
    icon: <CreditCard className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Reservas',
    to: '/app/bookings',
    icon: <CalendarDays className="h-5 w-5 shrink-0" />,
    roles: ['super_admin', 'admin'],
  },
  {
    label: 'Mi Disponibilidad',
    to: '/app/availability',
    icon: <Clock className="h-5 w-5 shrink-0" />,
    roles: ['teacher'],
  },
  {
    label: 'Mis Clases',
    to: '/app/bookings',
    icon: <CalendarDays className="h-5 w-5 shrink-0" />,
    roles: ['teacher'],
  },
  {
    label: 'Mis Paquetes',
    to: '/app/my-packages',
    icon: <Package className="h-5 w-5 shrink-0" />,
    roles: ['student'],
  },
  {
    label: 'Reservar Clase',
    to: '/app/bookings/new',
    icon: <CalendarPlus className="h-5 w-5 shrink-0" />,
    roles: ['student'],
  },
  {
    label: 'Mis Reservas',
    to: '/app/bookings',
    icon: <CalendarDays className="h-5 w-5 shrink-0" />,
    roles: ['student'],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
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

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo & Toggle */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
        <span className="text-xl font-bold text-primary-700 overflow-hidden whitespace-nowrap">
          {expanded ? 'ClassRoom Pro' : 'CP'}
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="hidden lg:flex rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
              ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            {expanded && (
              <span className="overflow-hidden whitespace-nowrap">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {expanded && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="relative h-full">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col transition-all duration-200
          ${expanded ? 'lg:w-64' : 'lg:w-16'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
