import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Rooms from './pages/Rooms';
import Packages from './pages/Packages';
import MyPackages from './pages/MyPackages';
import Payments from './pages/Payments';
import Bookings from './pages/Bookings';
import CreateBooking from './pages/CreateBooking';
import TeacherAvailability from './pages/TeacherAvailability';
import RoomAvailability from './pages/RoomAvailability';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/app" element={<Dashboard />} />
              <Route path="/app/profile" element={<Profile />} />

              {/* Admin routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
                <Route path="/app/users" element={<Users />} />
                <Route path="/app/rooms" element={<Rooms />} />
                <Route path="/app/payments" element={<Payments />} />
                <Route path="/app/rooms/availability" element={<RoomAvailability />} />
              </Route>

              {/* Packages - admin manages, students see catalog */}
              <Route path="/app/packages" element={<Packages />} />

              {/* Student routes */}
              <Route path="/app/my-packages" element={<MyPackages />} />

              {/* Bookings - all roles */}
              <Route path="/app/bookings" element={<Bookings />} />
              <Route path="/app/bookings/new" element={<CreateBooking />} />

              {/* Teacher availability */}
              <Route path="/app/availability" element={<TeacherAvailability />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
