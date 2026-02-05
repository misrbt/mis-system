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
const EmployeeListPage = lazy(() => import('../pages/inventory/EmployeeListPage'))
const StatusPage = lazy(() => import('../pages/inventory/StatusPage'))
const VendorsPage = lazy(() => import('../pages/inventory/VendorsPage'))
const EquipmentPage = lazy(() => import('../pages/inventory/EquipmentPage'))
const AssetCategoryPage = lazy(() => import('../pages/inventory/AssetCategoryPage'))
const SubcategoryPage = lazy(() => import('../pages/inventory/SubcategoryPage'))
const AssetsPage = lazy(() => import('../pages/inventory/AssetsPage'))
const AssetViewPage = lazy(() => import('../pages/inventory/AssetViewPage'))
const AssetComponentsPage = lazy(() => import('../pages/inventory/AssetComponentsPage'))

const RepairsPage = lazy(() => import('../pages/inventory/RepairsPage'))
const ReportsPage = lazy(() => import('../pages/inventory/ReportsPageV2'))
const SoftwareLicenseReportPage = lazy(() => import('../pages/inventory/SoftwareLicenseReportPage'))
const AuditLogsPage = lazy(() => import('../pages/inventory/AuditLogsPage'))
const MonthlyExpensesPage = lazy(() => import('../pages/inventory/MonthlyExpensesPage'))
const SoftwareLicensePage = lazy(() => import('../pages/inventory/SoftwareLicensePage'))
const ReplenishmentPage = lazy(() => import('../pages/inventory/ReplenishmentPage'))

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
      path: 'employee-list',
      element: <EmployeeListPage />,
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
      path: 'asset-subcategories',
      element: <SubcategoryPage />,
    },
    {
      path: 'vendors',
      element: <VendorsPage />,
    },
    {
      path: 'equipment',
      element: <EquipmentPage />,
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
      path: 'assets/:id/components',
      element: <AssetComponentsPage />,
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
      path: 'software-license-reports',
      element: <SoftwareLicenseReportPage />,
    },
    {
      path: 'audit-logs',
      element: <AuditLogsPage />,
    },
    {
      path: 'monthly-expenses',
      element: <MonthlyExpensesPage />,
    },
    {
      path: 'software-licenses',
      element: <SoftwareLicensePage />,
    },
    {
      path: 'replenishment',
      element: <ReplenishmentPage />,
    },
  ],
}

export default inventoryRoutes
