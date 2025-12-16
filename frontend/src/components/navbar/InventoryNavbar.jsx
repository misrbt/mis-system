import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import {
  Home,
  LogOut,
  User,
  ChevronDown,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  CheckCircle,
  Package,
  Truck,
  UserRound,
} from 'lucide-react'
import Logo from '../../assets/logos.png'

function InventoryNavBar({ user, onLogout }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const nameParts = (user?.name || '').trim().split(/\s+/).filter(Boolean)
  const firstName = nameParts[0] || 'User'
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
  const displayName = lastName ? `${firstName} ${lastName}` : firstName

  const handleLogout = async () => {
    await onLogout()
    navigate('/auth/login')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/inventory/home' },
    { name: 'Branch', icon: Building2, path: '/inventory/branch' },
    { name: 'Section', icon: Users, path: '/inventory/section' },
    { name: 'Position', icon: Briefcase, path: '/inventory/position' },
    { name: 'Employees', icon: UserRound, path: '/inventory/employees' },
    { name: 'Statuses', icon: CheckCircle, path: '/inventory/statuses' },
    { name: 'Asset Category', icon: Package, path: '/inventory/asset-category' },
    { name: 'IT Asset', icon: Package, path: '/inventory/assets' },
    { name: 'Vendors', icon: Truck, path: '/inventory/vendors' },
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      {/* First Row: Logo & Avatar */}
      <div className="border-b border-slate-100">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-3 py-3 md:py-4">
            {/* Left: Logo & Title */}
            <Link to="/portal" className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                <img src={Logo} alt="IT Inventory Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                {/* Mobile/Tablet Compact Title */}
                <span className="text-sm sm:text-base font-semibold text-slate-800 leading-tight md:hidden">
                  IT Inventory
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 leading-tight md:hidden">Asset Management</span>

                {/* Desktop/Laptop Full Title */}
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold text-slate-800 leading-tight">IT Inventory System</h1>
                  <p className="text-xs text-slate-500 leading-tight">RBT Bank Asset Management</p>
                </div>
              </div>
            </Link>

            {/* Right: User Avatar & Name */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-100">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-slate-700 leading-tight">{displayName}</p>
                  <p className="text-xs text-slate-500 leading-tight">{user?.email || ''}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                    <p className="text-xs text-slate-500">{user?.email || ''}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/portal"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Home className="w-4 h-4 text-slate-400" />
                      <span>Back to Portal</span>
                    </Link>
                    <button
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Navigation Items */}
      <div className="bg-slate-50/50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between md:justify-center gap-2 py-2">
            {/* Desktop Navigation - Centered with wrapping */}
            <div className="hidden md:flex items-center justify-center gap-1 flex-wrap">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-white hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium shadow-sm"
              onClick={() => setIsNavOpen((open) => !open)}
              aria-label="Toggle navigation menu"
              aria-expanded={isNavOpen}
            >
              {isNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span>Menu</span>
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {isNavOpen && (
            <div className="md:hidden mt-1 mb-2 rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsNavOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

InventoryNavBar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
}

export default InventoryNavBar
