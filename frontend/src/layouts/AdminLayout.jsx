import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminTopNav from '../components/admin/AdminTopNav'
import { useLocation } from 'react-router-dom'

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const path = location.pathname
    if (path === '/administrator') return ['Dashboard']
    if (path.includes('/users')) return ['User Management']
    if (path.includes('/audit-logs')) return ['Audit Logs']
    if (path.includes('/settings')) return ['Settings']
    return ['Dashboard']
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <AdminTopNav 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          breadcrumbs={getBreadcrumbs()}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
