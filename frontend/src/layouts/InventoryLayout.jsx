import { Outlet, useLocation } from 'react-router-dom'
import InventoryNavBar from '../components/navbar/InventoryNavbar'
import Footer from '../components/navigation/Footer'
import { useAuth } from '../context/AuthContext'

function InventoryLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  // Pages that use centered layout (narrower, vertically centered)
  const centeredPages = ['/inventory/branch', '/inventory/section', '/inventory/position', '/inventory/employees', '/inventory/statuses', '/inventory/asset-category', '/inventory/vendors']
  const isCenteredLayout = centeredPages.includes(location.pathname)

  // Pages that use wide layout
  const widePages = ['/inventory/home', '/inventory/assets']
  const isWideLayout = widePages.includes(location.pathname) ||
    location.pathname.startsWith('/inventory/assets/') ||
    location.pathname.match(/\/inventory\/employees\/\d+\/assets/)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <InventoryNavBar user={user} onLogout={logout} />

      <main className="flex-1 pt-32 md:pt-36 pb-16 md:pb-12">
        <div className={`w-full mx-auto px-4 py-4 sm:px-6 lg:py-4 lg:px-8 ${
          isCenteredLayout
            ? 'max-w-6xl'
            : isWideLayout
              ? 'max-w-[1920px]'
              : 'max-w-6xl'
        }`}>
          <Outlet />
        </div>
      </main>

      <Footer
        variant="light"
        className="mt-auto"
        maxWidth={isWideLayout ? 'max-w-[1920px]' : 'max-w-6xl'}
        horizontalPadding="px-4 sm:px-6 lg:px-8"
      />
    </div>
  )
}

export default InventoryLayout
