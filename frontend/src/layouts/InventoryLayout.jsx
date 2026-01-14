import { Outlet, useLocation } from 'react-router-dom'
import InventoryNavBar from '../components/navbar/InventoryNavbar'
import Footer from '../components/navigation/Footer'
import { useAuth } from '../context/AuthContext'

function InventoryLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  // Pages that use centered layout (narrower, vertically centered)
  const centeredPages = ['/inventory/branch', '/inventory/section', '/inventory/position', '/inventory/employees', '/inventory/statuses', '/inventory/asset-category', '/inventory/vendors']
  const isCenteredLayout = centeredPages.includes(location.pathname)

  // Pages that use medium layout
  const mediumPages = ['/inventory/audit-logs', '/inventory/repairs', '/inventory/reports']
  const isMediumLayout = mediumPages.includes(location.pathname)

  const isReportWideLayout = location.pathname === '/inventory/reports' && searchParams.get('layout') === 'wide'

  // Pages that use wide layout
  const widePages = ['/inventory/home', '/inventory/assets']
  const isWideLayout = widePages.includes(location.pathname) ||
    location.pathname.startsWith('/inventory/assets/') ||
    location.pathname.match(/\/inventory\/employees\/\d+\/assets/)

  const contentMaxWidth = isCenteredLayout
    ? 'max-w-6xl'
    : isReportWideLayout
      ? 'max-w-[1920px]'
      : isMediumLayout
        ? 'max-w-[1400px]'
        : isWideLayout
          ? 'max-w-[1920px]'
          : 'max-w-7xl'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <InventoryNavBar user={user} onLogout={logout} />

      <main className="flex-1 pt-32 md:pt-36 pb-24 sm:pb-24">
        <div className={`w-full mx-auto px-4 py-6 sm:px-6 lg:py-6 lg:px-8 ${contentMaxWidth}`}>
          <Outlet />
        </div>
      </main>

      {/* Simple footer for mobile - Fixed at bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 py-3 px-4 text-center bg-white border-t border-slate-200 space-y-0.5 z-10">
        <p className="text-xs text-slate-500">
          Designed and Developed by <span className="font-medium text-slate-600">Augustin Maputol</span>
        </p>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} MIS System. All rights reserved.
        </p>
      </div>

      {/* Full Footer for desktop */}
      <Footer
        variant="light"
        className="mt-auto hidden sm:block"
        maxWidth={contentMaxWidth}
        horizontalPadding="px-4 sm:px-6 lg:px-8"
      />
    </div>
  )
}

export default InventoryLayout
