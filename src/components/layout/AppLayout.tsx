import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { user } = useAuth();
  const [, setSidebarExpanded] = useState(true);

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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main content area */}
      <div className="lg:pl-64 transition-all duration-200">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 pl-16 lg:pl-6">
          <div>
            {/* Page title slot - pages can use document.title or a context */}
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-600 sm:block">
              {user?.full_name}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
