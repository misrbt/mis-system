import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import inventoryRoutes from './inventoryRoutes'

// Lazy load auth and portal pages
const AuthLayout = lazy(() => import('../layouts/AuthLayout'))
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const Portal = lazy(() => import('../pages/Portal'))

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
