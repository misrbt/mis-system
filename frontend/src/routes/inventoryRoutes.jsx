import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

// Lazy load all inventory pages
const InventoryLayout = lazy(() => import('../layouts/InventoryLayout'))
const InventoryHome = lazy(() => import('../pages/inventory/home'))
const BranchPage = lazy(() => import('../pages/inventory/BranchPage'))
const SectionPage = lazy(() => import('../pages/inventory/SectionPage'))
const PositionPage = lazy(() => import('../pages/inventory/PositionPage'))
const EmployeePage = lazy(() => import('../pages/inventory/EmployeePage'))
const StatusPage = lazy(() => import('../pages/inventory/StatusPage'))
const VendorsPage = lazy(() => import('../pages/inventory/VendorsPage'))
const AssetCategoryPage = lazy(() => import('../pages/inventory/AssetCategoryPage'))
const AssetsPage = lazy(() => import('../pages/inventory/AssetsPage'))
const AssetViewPage = lazy(() => import('../pages/inventory/AssetViewPage'))
const RepairsPage = lazy(() => import('../pages/inventory/RepairsPage'))
const ReportsPage = lazy(() => import('../pages/inventory/ReportsPage'))
const AuditLogsPage = lazy(() => import('../pages/inventory/AuditLogsPage'))
const MonthlyExpensesPage = lazy(() => import('../pages/inventory/MonthlyExpensesPage'))

const inventoryRoutes = {
  path: '/inventory',
  element: (
    <ProtectedRoute>
      <InventoryLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <Navigate to="/inventory/home" replace />,
    },
    {
      path: 'home',
      element: <InventoryHome />,
    },
    {
      path: 'branch',
      element: <BranchPage />,
    },
    {
      path: 'section',
      element: <SectionPage />,
    },
    {
      path: 'position',
      element: <PositionPage />,
    },
    {
      path: 'employees',
      element: <EmployeePage />,
    },
    {
      path: 'statuses',
      element: <StatusPage />,
    },
    {
      path: 'asset-category',
      element: <AssetCategoryPage />,
    },
    {
      path: 'vendors',
      element: <VendorsPage />,
    },
    {
      path: 'repairs',
      element: <RepairsPage />,
    },
    {
      path: 'assets',
      element: <AssetsPage />,
    },
    {
      path: 'assets/:id',
      element: <AssetViewPage />,
    },
    {
      path: 'employees/:employeeId/assets',
      element: <AssetViewPage />,
    },
    {
      path: 'reports',
      element: <ReportsPage />,
    },
    {
      path: 'audit-logs',
      element: <AuditLogsPage />,
    },
    {
      path: 'monthly-expenses',
      element: <MonthlyExpensesPage />,
    },
  ],
}

export default inventoryRoutes
