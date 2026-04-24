import { Outlet, Link } from 'react-router-dom'
import Logo from '../assets/logos.png'

function PublicHelpdeskLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link to="/public-helpdesk" className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center p-1 shrink-0">
              <img src={Logo} alt="MIS Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">
                MIS Helpdesk Support
              </h1>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/public-helpdesk/submit"
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Submit
            </Link>
            <Link
              to="/public-helpdesk/track"
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Track
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default PublicHelpdeskLayout
