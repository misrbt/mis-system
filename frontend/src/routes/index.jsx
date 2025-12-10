import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import InventoryLayout from '../layouts/InventoryLayout'
import HelpdeskLayout from '../layouts/HelpdeskLayout'
import HomePage from '../pages/Home'
import inventoryRoutes from './inventoryRoutes'
import helpdeskRoutes from './helpdeskRoutes'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'inventory',
        element: <InventoryLayout />,
        children: inventoryRoutes,
      },
      {
        path: 'helpdesk',
        element: <HelpdeskLayout />,
        children: helpdeskRoutes,
      },
    ],
  },
])

export default router
