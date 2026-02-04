import { Bell, Menu, Search, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function AdminTopNav({ onMenuClick, breadcrumbs }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        {/* Left: Menu + Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-slate-500">Admin</span>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-slate-400">/</span>
                <span className={`${index === breadcrumbs.length - 1 ? 'text-orange-600 font-semibold' : 'text-slate-600'}`}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Search + Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 max-w-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500">{user?.email || 'admin@rbt.com'}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                  <div className="p-4 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">{user?.name || 'Administrator'}</p>
                    <p className="text-xs text-slate-500 mt-1">{user?.email || 'admin@rbt.com'}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminTopNav
