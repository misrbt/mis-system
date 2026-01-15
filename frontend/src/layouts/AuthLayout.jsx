import { Outlet } from 'react-router-dom'
import Footer from '../components/navigation/Footer'

function AuthLayout() {
  return (
    <div className="min-h-screen overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Clean, subtle background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_25%,rgba(59,130,246,0.08),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.08),transparent_32%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.05),transparent_35%),linear-gradient(120deg,rgba(15,23,42,0.03),rgba(15,23,42,0.01))]"></div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="w-full">
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
