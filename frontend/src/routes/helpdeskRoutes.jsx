import { lazy } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'

const HelpdeskLayout = lazy(() => import('../layouts/HelpdeskLayout'))
const HelpdeskDashboard = lazy(() => import('../pages/helpdesk/HelpdeskDashboard'))
const TicketsPage = lazy(() => import('../pages/helpdesk/TicketsPage'))
const TicketDetailPage = lazy(() => import('../pages/helpdesk/TicketDetailPage'))
const HelpdeskReports = lazy(() => import('../pages/helpdesk/HelpdeskReports'))
const HelpdeskAuditLogs = lazy(() => import('../pages/helpdesk/HelpdeskAuditLogs'))
const TicketCategoriesPage = lazy(() => import('../pages/helpdesk/TicketCategoriesPage'))
const TicketFormFieldsPage = lazy(() => import('../pages/helpdesk/TicketFormFieldsPage'))
const TicketApproversPage = lazy(() => import('../pages/helpdesk/TicketApproversPage'))

const helpdeskRoutes = {
  path: '/helpdesk',
  element: (
    <ProtectedRoute>
      <HelpdeskLayout />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <HelpdeskDashboard /> },
    { path: 'tickets', element: <TicketsPage /> },
    { path: 'tickets/:id', element: <TicketDetailPage /> },
    { path: 'reports', element: <HelpdeskReports /> },
    { path: 'audit-logs', element: <HelpdeskAuditLogs /> },
    { path: 'categories', element: <TicketCategoriesPage /> },
    { path: 'form-fields', element: <TicketFormFieldsPage /> },
    { path: 'approvers', element: <TicketApproversPage /> },
  ],
}

export default helpdeskRoutes
