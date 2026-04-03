import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Package,
  CalendarDays,
  Clock,
  Plus,
  BookOpen,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listUsers } from '../services/users';
import { listRooms } from '../services/rooms';
import { listPackages, getMyPackages } from '../services/packages';
import { listMyBookings } from '../services/bookings';
import { getMyAvailability } from '../services/availability';
import type {
  UserDTO,
  RoomDTO,
  PackageDTO,
  StudentBookingDetailDto,
  StudentPackageDTO,
  TeacherAvailabilityDTO,
} from '../types';

/* ────────────────────────────── helpers ───────────────────────────────────── */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bg: string;
  iconColor: string;
}

function StatCard({ icon, label, value, bg, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

function QuickAction({ icon, label, to }: QuickActionProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

/* ──────────────────────────── Admin Dashboard ─────────────────────────────── */

function AdminDashboard() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [bookings, setBookings] = useState<StudentBookingDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [u, r, p, b] = await Promise.allSettled([
          listUsers(),
          listRooms(),
          listPackages(),
          listMyBookings(),
        ]);
        if (u.status === 'fulfilled') setUsers(Array.isArray(u.value) ? u.value : []);
        if (r.status === 'fulfilled') setRooms(Array.isArray(r.value) ? r.value : []);
        if (p.status === 'fulfilled') setPackages(Array.isArray(p.value) ? p.value : []);
        if (b.status === 'fulfilled') setBookings(Array.isArray(b.value) ? b.value : []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeRooms = rooms.length > 0 ? rooms.filter((r) => r.is_active).length : 0;
  const pendingBookings = bookings.length > 0 ? bookings.filter((b) => b.status === 'pending').length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Usuarios"
          value={users.length}
          bg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<Building2 className="w-6 h-6" />}
          label="Salones Activos"
          value={activeRooms}
          bg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="Paquetes Disponibles"
          value={packages.length}
          bg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={<CalendarDays className="w-6 h-6" />}
          label="Reservas Pendientes"
          value={pendingBookings}
          bg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rapidas</h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction icon={<Plus className="w-4 h-4" />} label="Nuevo Usuario" to="/app/users" />
          <QuickAction icon={<Plus className="w-4 h-4" />} label="Nuevo Salon" to="/app/rooms" />
          <QuickAction icon={<Plus className="w-4 h-4" />} label="Nuevo Paquete" to="/app/packages" />
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {bookings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">No hay actividad reciente.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {bookings.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded bg-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Reserva #{b.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.scheduled_date} &middot; {b.start_time} - {b.end_time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      b.status === 'confirmed'
                        ? 'bg-green-50 text-green-700'
                        : b.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : b.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────── Teacher Dashboard ──────────────────────────── */

function TeacherDashboard() {
  const [availability, setAvailability] = useState<TeacherAvailabilityDTO[]>([]);
  const [bookings, setBookings] = useState<StudentBookingDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [avail, bk] = await Promise.allSettled([
          getMyAvailability(),
          listMyBookings(),
        ]);
        if (avail.status === 'fulfilled') setAvailability(Array.isArray(avail.value) ? avail.value : []);
        if (bk.status === 'fulfilled') setBookings(Array.isArray(bk.value) ? bk.value : []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayDow = today.getDay();

  const todayClasses = bookings.filter(
    (b) => b.scheduled_date === todayStr && (b.status === 'confirmed' || b.status === 'pending'),
  );

  const todayAvailability = availability.filter((a) => a.day_of_week === todayDow);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Mi Disponibilidad"
          value={`${availability.length} bloques`}
          bg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<CalendarDays className="w-6 h-6" />}
          label="Clases Hoy"
          value={todayClasses.length}
          bg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          label="Total Reservas"
          value={bookings.length}
          bg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Today's availability */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Disponibilidad hoy ({DAY_NAMES[todayDow]})
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {todayAvailability.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              No tienes disponibilidad configurada para hoy.
            </p>
          ) : (
            <ul className="space-y-2">
              {todayAvailability.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm text-gray-700">
                    {a.start_time} - {a.end_time}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                    {a.is_virtual ? 'Virtual' : 'Presencial'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Today's classes */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis Clases de Hoy</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {todayClasses.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">No tienes clases programadas para hoy.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todayClasses.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded bg-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {b.start_time} - {b.end_time}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.booking_type === 'virtual' ? 'Virtual' : 'Presencial'}
                        {b.room ? ` - ${b.room.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      b.status === 'confirmed'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick link */}
      <div className="mt-6">
        <Link
          to="/app/availability"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          Configurar disponibilidad
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}

/* ──────────────────────────── Student Dashboard ──────────────────────────── */

function StudentDashboard() {
  const [packages, setPackages] = useState<StudentPackageDTO[]>([]);
  const [bookings, setBookings] = useState<StudentBookingDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pkg, bk] = await Promise.allSettled([
          getMyPackages(),
          listMyBookings(),
        ]);
        if (pkg.status === 'fulfilled') setPackages(Array.isArray(pkg.value) ? pkg.value : []);
        if (bk.status === 'fulfilled') setBookings(Array.isArray(bk.value) ? bk.value : []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activePackages = packages.filter((p) => p.status === 'active');

  const upcomingBooking = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'pending')
    .sort((a, b) => {
      const dateA = `${a.scheduled_date}T${a.start_time}`;
      const dateB = `${b.scheduled_date}T${b.start_time}`;
      return dateA.localeCompare(dateB);
    })[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="Paquetes Activos"
          value={activePackages.length}
          bg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<CalendarDays className="w-6 h-6" />}
          label="Reservas Totales"
          value={bookings.length}
          bg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          label="Paquetes Totales"
          value={packages.length}
          bg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Next class */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Proxima Clase</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {upcomingBooking ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <CalendarDays className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {upcomingBooking.scheduled_date}
                </p>
                <p className="text-sm text-gray-600">
                  {upcomingBooking.start_time} - {upcomingBooking.end_time}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {upcomingBooking.booking_type === 'virtual' ? 'Virtual' : 'Presencial'}
                  {upcomingBooking.teacher ? ` - ${upcomingBooking.teacher.full_name}` : ''}
                  {upcomingBooking.room ? ` - ${upcomingBooking.room.name}` : ''}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              No tienes clases programadas.
            </p>
          )}
        </div>
      </div>

      {/* Quick action */}
      <div className="mt-6">
        <QuickAction
          icon={<Plus className="w-4 h-4" />}
          label="Reservar Clase"
          to="/app/bookings"
        />
      </div>
    </>
  );
}

/* ────────────────────────────── Main Dashboard ───────────────────────────── */

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';

  return (
    <div className="space-y-2">
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user.full_name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Aqui tienes un resumen de tu actividad.
        </p>
      </div>

      {isAdmin && <AdminDashboard />}
      {isTeacher && <TeacherDashboard />}
      {isStudent && <StudentDashboard />}
    </div>
  );
}
