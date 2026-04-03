import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/* ──────────────────── Lazy-loaded pages ──────────────────────────────────── */

const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// App pages (behind auth)
const Dashboard = lazy(() => import('@/pages/Dashboard/index'));
const Profile = lazy(() => import('@/pages/Profile'));
const Users = lazy(() => import('@/pages/Users'));
const Rooms = lazy(() => import('@/pages/Rooms'));
const Packages = lazy(() => import('@/pages/Packages'));
const MyPackages = lazy(() => import('@/pages/MyPackages'));
const Payments = lazy(() => import('@/pages/Payments'));
const Bookings = lazy(() => import('@/pages/Bookings'));
const CreateBooking = lazy(() => import('@/pages/CreateBooking'));
const TeacherAvailability = lazy(() => import('@/pages/TeacherAvailability'));
const RoomAvailability = lazy(() => import('@/pages/RoomAvailability'));

/* ──────────────────── Suspense wrapper ───────────────────────────────────── */

function PageLoader() {
  return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <SuspenseWrapper><Landing /></SuspenseWrapper>,
      },
      {
        path: '/login',
        element: <SuspenseWrapper><Login /></SuspenseWrapper>,
      },
      {
        path: '/app',
        element: (
          <SuspenseWrapper>
            <ProtectedRoute />
          </SuspenseWrapper>
        ),
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'profile', element: <Profile /> },
              { path: 'packages', element: <Packages /> },
              { path: 'my-packages', element: <MyPackages /> },
              { path: 'bookings', element: <Bookings /> },
              { path: 'bookings/new', element: <CreateBooking /> },
              { path: 'availability', element: <TeacherAvailability /> },
              
              /* Admin Specific Routes */
              {
                element: <ProtectedRoute allowedRoles={['admin', 'super_admin']} />,
                children: [
                  { path: 'users', element: <Users /> },
                  { path: 'rooms', element: <Rooms /> },
                  { path: 'rooms/availability', element: <RoomAvailability /> },
                ],
              },
              /* Payments Route for Admins and Students */
              {
                element: <ProtectedRoute allowedRoles={['admin', 'super_admin', 'student']} />,
                children: [
                  { path: 'payments', element: <Payments /> },
                ],
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <SuspenseWrapper><NotFound /></SuspenseWrapper>,
      },
    ],
  },
]);

/* ──────────────────── App ────────────────────────────────────────────────── */

export default function App() {
  return <RouterProvider router={router} />;
}
