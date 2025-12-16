import { Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import InventoryHome from '../pages/inventory/home'
import BranchPage from '../pages/inventory/BranchPage'
import SectionPage from '../pages/inventory/SectionPage'
import PositionPage from '../pages/inventory/PositionPage'
import EmployeePage from '../pages/inventory/EmployeePage'
import StatusPage from '../pages/inventory/StatusPage'
import VendorsPage from '../pages/inventory/VendorsPage'
import AssetCategoryPage from '../pages/inventory/AssetCategoryPage'
import AssetsPage from '../pages/inventory/AssetsPage'
import AssetViewPage from '../pages/inventory/AssetViewPage'
import InventoryLayout from '../layouts/InventoryLayout'

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
  ],
}

export default inventoryRoutes
