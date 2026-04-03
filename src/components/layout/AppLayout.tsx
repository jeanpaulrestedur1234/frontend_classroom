import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import LanguageSwitcher from '../ui/LanguageSwitcher';

export default function AppLayout() {
  const { user } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Collapse sidebar on small screens by default
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024) {
        setSidebarExpanded(false);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build user initials for avatar
  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((prev) => !prev)}
      />

      {/* Main content area */}
      <div
        className={`transition-all duration-300 ease-out ${
          sidebarExpanded ? 'lg:pl-[260px]' : 'lg:pl-[72px]'
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl px-6 pl-16 lg:pl-6">
          <div>{/* Page title slot */}</div>

          {/* User info + language */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher compact />

            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-medium text-zinc-400 sm:block">
                {user?.full_name}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
                <span className="text-xs font-bold font-[family-name:var(--font-display)] text-zinc-950">
                  {initials}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
