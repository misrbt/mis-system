import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import inventoryRoutes from './inventoryRoutes'
import ErrorPage from '../components/ErrorPage'

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
    errorElement: <ErrorPage />,
  },

  // Auth routes (public)
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
  },

  // Inventory routes (protected)
  {
    ...inventoryRoutes,
    errorElement: <ErrorPage />,
  },

  // Helpdesk routes (protected) - placeholder for now
  {
    path: '/helpdesk',
    element: (
      <ProtectedRoute>
        <Navigate to="/portal" replace />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
  },

  // Catch all - redirect to login
  {
    path: '*',
    element: <Navigate to="/auth/login" replace />,
  },
])

export default router
