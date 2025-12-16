import { useNavigate } from 'react-router-dom'
import {
  Monitor,
  Headphones,
  CreditCard,
  Shield,
  Activity,
  Server,
  Fingerprint,
  FileText,
  ChevronRight,
  User
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/navigation/Footer'
import PortalNavbar from '../components/navbar/PortalNavbar'

function Portal() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/auth/login')
  }

  const portals = [
    {
      id: 'inventory',
      name: 'IT Inventory System',
      description: 'Manage IT assets, equipment, and inventory tracking across all branches',
      icon: Monitor,
      color: 'from-blue-500 to-blue-600',
      path: '/inventory/home',
      available: true,
    },
    {
      id: 'administrator',
      name: 'Administrator',
      description: 'Manage users and audit logs',
      icon: User,
      color: 'from-orange-500 to-orange-600',
      path: '/administrator',
      available: true,
    },
    {
      id: 'helpdesk',
      name: 'IT Helpdesk Ticketing',
      description: 'IT support tickets, requests, and issue tracking system',
      icon: Headphones,
      color: 'from-indigo-500 to-indigo-600',
      path: '/helpdesk',
      available: false,
    },
    {
      id: 'documents',
      name: 'Document Management',
      description: 'Centralized document storage, versioning and collaboration platform',
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      path: '/documents',
      available: false,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 overflow-x-hidden">
      {/* Subtle background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation Bar */}
      <PortalNavbar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 relative z-10 pt-20 pb-24">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              RBT Bank <span className="text-blue-600">MIS Portal</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Centralized access for all internal systems. Manage IT infrastructure, compliance, and operations from a unified platform.
            </p>
          </div>

          {/* Systems Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
            {portals.map((portal) => {
              const Icon = portal.icon
              return (
                <button
                  key={portal.id}
                  onClick={() => portal.available && navigate(portal.path)}
                  disabled={!portal.available}
                  className={`group relative bg-white rounded-2xl border border-slate-200 p-6 text-left transition-all duration-300 ${
                    portal.available
                      ? 'hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Badge for unavailable systems */}
                  {!portal.available && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${portal.color} rounded-xl flex items-center justify-center shadow-lg mb-4 ${
                    portal.available ? 'group-hover:scale-110' : ''
                  } transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {portal.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {portal.description}
                  </p>

                  {/* Arrow indicator */}
                  {portal.available && (
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <span>Access System</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer variant="light" />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default Portal
