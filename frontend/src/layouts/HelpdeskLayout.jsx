import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import HelpdeskSidebar from '../components/helpdesk/HelpdeskSidebar'
import HelpdeskTopNav from '../components/helpdesk/HelpdeskTopNav'

function HelpdeskLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const location = useLocation()

  const getBreadcrumbs = () => {
    const path = location.pathname
    if (path === '/helpdesk') return ['Dashboard']
    if (path.startsWith('/helpdesk/tickets/')) return ['Tickets', 'Detail']
    if (path.startsWith('/helpdesk/tickets')) return ['Tickets']
    if (path.startsWith('/helpdesk/reports')) return ['Reports']
    if (path.startsWith('/helpdesk/audit-logs')) return ['Audit Logs']
    if (path.startsWith('/helpdesk/categories')) return ['Categories']
    if (path.startsWith('/helpdesk/form-fields')) return ['Form Fields']
    if (path.startsWith('/helpdesk/approvers')) return ['Approvers']
    return ['Dashboard']
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <HelpdeskSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <HelpdeskTopNav
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          breadcrumbs={getBreadcrumbs()}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default HelpdeskLayout
