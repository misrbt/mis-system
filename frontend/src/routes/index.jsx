import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Portal from '../pages/Portal'
import ProtectedRoute from '../components/ProtectedRoute'
import inventoryRoutes from './inventoryRoutes'

const router = createBrowserRouter([
  // Root redirect to login
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },

  // Auth routes (public)
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },

  // Portal selection (protected)
  {
    path: '/portal',
    element: (
      <ProtectedRoute>
        <Portal />
      </ProtectedRoute>
    ),
  },

  // Inventory routes (protected)
  inventoryRoutes,

  // Helpdesk routes (protected) - placeholder for now
  {
    path: '/helpdesk',
    element: (
      <ProtectedRoute>
        <Navigate to="/portal" replace />
      </ProtectedRoute>
    ),
  },

  // Catch all - redirect to login
  {
    path: '*',
    element: <Navigate to="/auth/login" replace />,
  },
])

export default router
