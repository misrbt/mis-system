import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Ticket,
  FileText,
  ScrollText,
  Tag,
  ListPlus,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Logo from '../../assets/logos.png'

const menuItems = [
  { name: 'Dashboard', path: '/helpdesk', icon: LayoutDashboard, end: true },
  { name: 'Tickets', path: '/helpdesk/tickets', icon: Ticket, end: true },
  { name: 'Categories', path: '/helpdesk/categories', icon: Tag, end: true },
  { name: 'Form Fields', path: '/helpdesk/form-fields', icon: ListPlus, end: true },
  { name: 'Approvers', path: '/helpdesk/approvers', icon: ShieldCheck, end: true },
  { name: 'Reports', path: '/helpdesk/reports', icon: FileText, end: true },
  { name: 'Audit Logs', path: '/helpdesk/audit-logs', icon: ScrollText, end: true },
]

function HelpdeskSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 z-50 h-screen',
          'bg-gradient-to-br from-indigo-600 to-indigo-700',
          'shadow-2xl flex flex-col',
          'transition-all duration-300 ease-in-out',
          'lg:sticky lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-64 lg:w-16' : 'w-64',
        ].join(' ')}
      >
        {/* Header */}
        <div
          className={[
            'flex items-center border-b border-indigo-500/30 shrink-0',
            isCollapsed ? 'lg:justify-center lg:p-3 p-6 justify-between' : 'p-6 justify-between',
          ].join(' ')}
        >
          {/* Collapsed desktop: logo icon + chevron toggle */}
          <div className={isCollapsed ? 'hidden lg:flex items-center justify-center' : 'hidden'}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center p-0.5 bg-white/10">
              <img src={Logo} alt="MIS Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Expanded: logo + title */}
          <div className={isCollapsed ? 'flex lg:hidden items-center gap-3 flex-1' : 'flex items-center gap-3 flex-1'}>
            <div className="w-20 h-20 rounded-lg flex items-center justify-center p-1 shrink-0">
              <img src={Logo} alt="MIS Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white leading-tight">MIS Helpdesk Support</h2>
              <p className="text-xs text-indigo-100">Ticket Management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-white hover:bg-indigo-500/30 p-2 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={['flex-1 overflow-y-auto space-y-1', isCollapsed ? 'lg:p-2 p-4' : 'p-4'].join(' ')}>
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
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  [
                    'flex items-center rounded-lg transition-all duration-200',
                    isCollapsed ? 'lg:justify-center lg:px-0 lg:py-3 gap-3 px-4 py-3' : 'gap-3 px-4 py-3',
                    isActive
                      ? 'bg-white text-indigo-700 shadow-lg font-semibold'
                      : 'text-indigo-100 hover:bg-indigo-500/30 hover:text-white',
                  ].join(' ')
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={isCollapsed ? 'lg:hidden' : ''}>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Collapse toggle — desktop only, pinned to bottom */}
        <div className="hidden lg:block shrink-0 border-t border-indigo-500/30 p-2">
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={[
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
              'text-indigo-200 hover:bg-indigo-500/30 hover:text-white transition-colors',
              isCollapsed ? 'justify-center' : '',
            ].join(' ')}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

export default HelpdeskSidebar
