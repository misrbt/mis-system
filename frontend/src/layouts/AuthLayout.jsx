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

      {/* Footer */}
      <Footer variant="light" />
    </div>
  )
}

export default AuthLayout
