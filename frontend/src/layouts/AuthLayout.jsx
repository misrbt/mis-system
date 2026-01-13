import { Outlet } from 'react-router-dom'
import Footer from '../components/navigation/Footer'

function AuthLayout() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-100">
      {/* Subtle static background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 sm:w-96 sm:h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 sm:w-96 sm:h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Simple footer for mobile */}
      <div className="sm:hidden py-4 px-4 text-center relative z-10 space-y-1 bg-white/80 backdrop-blur-sm">
        <p className="text-xs text-slate-600">
          Designed and Developed by <span className="font-medium text-slate-700">Augustin Maputol</span>
        </p>
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} MIS System. All rights reserved.
        </p>
      </div>

      {/* Full Footer for desktop */}
      <div className="hidden sm:block">
        <Footer variant="light" />
      </div>
    </div>
  )
}

export default AuthLayout
