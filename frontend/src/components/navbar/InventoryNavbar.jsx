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
  BarChart3,
  Wrench,
  FileSearch,
  Calendar,
  Monitor,
  Key,
} from 'lucide-react'
import Logo from '../../assets/logos.png'

function InventoryNavBar({ user, onLogout }) {
  const location = useLocation()
  return (
    <InventoryNavBarContent
      key={location.pathname}
      user={user}
      onLogout={onLogout}
      location={location}
    />
  )
}

function InventoryNavBarContent({ user, onLogout, location }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState(null)
  const [mobileOpenGroups, setMobileOpenGroups] = useState({})
  const hoverTimeoutRef = useRef(null)
  const userMenuRef = useRef(null)
  const navRef = useRef(null)
  const navigate = useNavigate()

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
      const clickedUserMenu = userMenuRef.current?.contains(event.target)
      const clickedNav = navRef.current?.contains(event.target)

      if (!clickedUserMenu) {
        setIsUserMenuOpen(false)
      }
      if (!clickedNav) {
        setOpenGroup(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navGroups = [
    {
      label: 'Overview',
      type: 'link',
      item: { name: 'Dashboard', icon: LayoutDashboard, path: '/inventory/home' },
    },
    {
      label: 'Organization',
      type: 'dropdown',
      items: [
        { name: 'Branches', icon: Building2, path: '/inventory/branch' },
        { name: 'Sections', icon: Users, path: '/inventory/section' },
        { name: 'Positions', icon: Briefcase, path: '/inventory/position' },
        { name: 'Employees', icon: UserRound, path: '/inventory/employees' },
      ],
    },
    {
      label: 'Asset Management',
      type: 'dropdown',
      items: [
        { name: 'Assets', icon: Package, path: '/inventory/assets' },
        { name: 'Equipment', icon: Monitor, path: '/inventory/equipment' },
        { name: 'Categories', icon: Package, path: '/inventory/asset-category' },
        { name: 'Subcategories', icon: Package, path: '/inventory/asset-subcategories' },
        { name: 'Asset Status', icon: CheckCircle, path: '/inventory/statuses' },
      ],
    },
    {
      label: 'Software License',
      type: 'link',
      item: { name: 'Software License', icon: Key, path: '/inventory/software-licenses' },
    },
    {
      label: 'Service & Maintenance',
      type: 'dropdown',
      items: [
        { name: 'Vendors', icon: Truck, path: '/inventory/vendors' },
        { name: 'Repair Records', icon: Wrench, path: '/inventory/repairs' },
      ],
    },
    {
      label: 'Reports',
      type: 'link',
      item: { name: 'Reports', icon: BarChart3, path: '/inventory/reports' },
    },
    {
      label: 'Analytics & Tracking',
      type: 'dropdown',
      items: [
        { name: 'Audit Logs', icon: FileSearch, path: '/inventory/audit-logs' },
        { name: 'Monthly Expenses', icon: Calendar, path: '/inventory/monthly-expenses' },
      ],
    },
  ]

  const isActive = (path) => location.pathname.startsWith(path)
  const toggleMobileGroup = (label) => {
    setMobileOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }
  const handleToggleGroup = (label) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setOpenGroup((prev) => (prev === label ? null : label))
  }
  const handleOpenGroup = (label) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setOpenGroup(label)
  }
  const handleCloseGroup = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => setOpenGroup(null), 150)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  // Allow closing dropdowns with Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenGroup(null)
        setIsNavOpen(false)
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      {/* First Row: Logo & Avatar */}
      <div className="border-b border-slate-100">
        <div className="max-w-[1920px] mx-auto px-2 sm:px-6 lg:px-4">
          <div className="flex justify-between items-center gap-3 py-3 md:py-2">
            {/* Left: Logo & Title */}
            <Link to="/portal" className="flex items-center gap-3">
              <div className="w-7 h-7 sm:w-7 sm:h-7 md:w-7 md:h-7">
                <img src={Logo} alt="IT Inventory Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                {/* Mobile/Tablet Compact Title */}
                <span className="text-sm sm:text-xs font-semibold text-slate-800 leading-tight md:hidden">
                  IT Inventory
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 leading-tight md:hidden">Asset Management</span>

                {/* Desktop/Laptop Full Title */}
                <div className="hidden md:block">
                  <h1 className="text-sm font-bold text-slate-800 leading-tight">IT INVENTORY SYSTEM</h1>
                  <p className="text-[10px] text-slate-500 leading-tight">RBT Bank Asset Management</p>
                </div>
              </div>
            </Link>

            {/* Right: User Avatar & Name */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-100">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-medium text-slate-700 leading-tight">{displayName}</p>
                  <p className="text-[8px] text-slate-500 leading-tight">{user?.email || ''}</p>
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
            {/* Desktop Navigation - Grouped dropdowns */}
            <div className="hidden md:flex items-center justify-center gap-2 flex-wrap">
              {navGroups.map((group) => (
                group.type === 'link' ? (
                  <Link
                    key={group.label}
                    to={group.item.path}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive(group.item.path)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50'
                    }`}
                  >
                    <group.item.icon className="w-4 h-4" />
                    <span>{group.item.name}</span>
                  </Link>
                ) : (
                  <div
                    key={group.label}
                    className="relative"
                    onMouseEnter={() => handleOpenGroup(group.label)}
                    onMouseLeave={handleCloseGroup}
                  >
                    <button
                      className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
                      aria-haspopup="true"
                      aria-expanded={openGroup === group.label}
                      onClick={(e) => {
                        e.preventDefault()
                        handleToggleGroup(group.label)
                      }}
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${openGroup === group.label ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <div
                      className={`absolute left-0 mt-2 min-w-[220px] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden transition-all duration-150 ${
                        openGroup === group.label
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 translate-y-1 pointer-events-none'
                      }`}
                      onMouseEnter={() => handleOpenGroup(group.label)}
                      onMouseLeave={handleCloseGroup}
                    >
                      <div className="py-2">
                        {group.items.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
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
                    </div>
                  </div>
                )
              ))}
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
              {navGroups.map((group) => (
                <div key={group.label}>
                  {group.type === 'link' ? (
                    <Link
                      to={group.item.path}
                      onClick={() => setIsNavOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive(group.item.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <group.item.icon className="w-4 h-4" />
                      <span>{group.item.name}</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50"
                        onClick={() => toggleMobileGroup(group.label)}
                        aria-expanded={!!mobileOpenGroups[group.label]}
                      >
                        <span className="uppercase text-[11px] tracking-wide">{group.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            mobileOpenGroups[group.label] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {mobileOpenGroups[group.label] &&
                        group.items.map((item) => {
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
                    </>
                  )}
                </div>
              ))}
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
