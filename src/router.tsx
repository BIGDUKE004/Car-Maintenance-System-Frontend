import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import { ForgotPassword, ResetPassword, VerifyEmail } from '@/pages/public/AccountRecovery'
import Dashboard from '@/pages/customer/Dashboard'
import AddVehicle from '@/pages/customer/AddVehicle'
import RequestService from '@/pages/customer/RequestService'
import Payments from '@/pages/customer/Payments'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminRequests from '@/pages/admin/AdminRequests'
import AdminRequestWorkbench from '@/pages/admin/AdminRequestWorkbench'
import AdminCustomers from '@/pages/admin/AdminCustomers'
import AdminVehicles from '@/pages/admin/AdminVehicles'
import AdminPayments from '@/pages/admin/AdminPayments'
import AdminReports from '@/pages/admin/AdminReports'

function CustomerRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-brand">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'CUSTOMER') return <Navigate to="/admin" replace />
  return <CustomerLayout />
}

function AdminRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-brand">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'WORKSHOP_ADMIN') return <Navigate to="/dashboard" replace />
  return <AdminLayout />
}

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  {
    element: <CustomerRoute />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/vehicles/new', element: <AddVehicle /> },
      { path: '/request-service', element: <RequestService /> },
      { path: '/payments', element: <Payments /> },
    ]
  },
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/requests', element: <AdminRequests /> },
      { path: '/admin/requests/:id', element: <AdminRequestWorkbench /> },
      { path: '/admin/customers', element: <AdminCustomers /> },
      { path: '/admin/vehicles', element: <AdminVehicles /> },
      { path: '/admin/payments', element: <AdminPayments /> },
      { path: '/admin/reports', element: <AdminReports /> },
    ]
  }
])

export function AppRouter() { return <RouterProvider router={router} /> }
