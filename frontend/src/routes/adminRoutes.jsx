import { lazy } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'

// Lazy load admin pages
const AdminLayout = lazy(() => import('../layouts/AdminLayout'))
const Dashboard = lazy(() => import('../pages/admin/Dashboard'))
const UserManagement = lazy(() => import('../pages/admin/UserManagement'))
const AuditLogs = lazy(() => import('../pages/admin/AuditLogs'))

const adminRoutes = {
  path: '/administrator',
  element: (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <Dashboard />,
    },
    {
      path: 'users',
      element: <UserManagement />,
    },
    {
      path: 'audit-logs',
      element: <AuditLogs />,
    },
  ],
}

export default adminRoutes
