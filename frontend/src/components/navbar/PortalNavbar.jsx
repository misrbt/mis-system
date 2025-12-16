import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { LogOut, User, ChevronDown, Settings } from 'lucide-react'
import Logo from '../../assets/logos.png'

function PortalNavbar({ user, onLogout }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const nameParts = (user?.name || '').trim().split(/\s+/).filter(Boolean)
  const firstName = nameParts[0] || 'User'
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
  const displayName = lastName ? `${firstName} ${lastName}` : firstName

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

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200" style={{ zIndex: 9999 }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20 py-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10">
              <img src={Logo} alt="MIS Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col sm:hidden">
              <h1 className="text-sm font-semibold text-slate-800 leading-tight">MIS System</h1>
              <p className="text-[11px] text-slate-500 leading-tight">Portal</p>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-800">MIS System</h1>
              <p className="text-xs text-slate-500">Management Information System</p>
            </div>
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-100">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-slate-700 leading-tight">{displayName}</p>
                    <p className="text-xs text-slate-500 leading-tight">{user?.email || ''}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-blue-100">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">2</p>
                        <p className="text-xs text-slate-600">Portals</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">Active</p>
                        <p className="text-xs text-slate-600">Status</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <div className="text-left flex-1">
                        <p className="font-medium">Account Settings</p>
                        <p className="text-xs text-slate-500">Manage your profile</p>
                      </div>
                    </button>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        onLogout()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

PortalNavbar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
}

export default PortalNavbar
