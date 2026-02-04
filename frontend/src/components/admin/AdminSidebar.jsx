import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  ArrowLeft,
  X
} from 'lucide-react'
import { useState } from 'react'
import Logo from '../../assets/logos.png'

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/administrator',
      icon: LayoutDashboard,
      end: true
    },
    {
      name: 'User Management',
      path: '/administrator/users',
      icon: Users
    },
    {
      name: 'Audit Logs',
      path: '/administrator/audit-logs',
      icon: FileText
    },
    {
      name: 'Settings',
      path: '/administrator/settings',
      icon: Settings
    }
  ]

  const handleBackToPortal = () => {
    navigate('/portal')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-gradient-to-br from-blue-600 to-blue-700 
        shadow-2xl transform transition-transform duration-300 ease-in-out
        lg:sticky lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center p-1">
              <img 
                src={Logo} 
                alt="MIS Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">MIS System</h2>
              <p className="text-xs text-blue-100">Administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:bg-blue-500/30 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose()
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-white text-blue-600 shadow-lg font-semibold' 
                    : 'text-blue-100 hover:bg-blue-500/30 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Back to Portal Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500/30">
          <button
            onClick={handleBackToPortal}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Portal</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
