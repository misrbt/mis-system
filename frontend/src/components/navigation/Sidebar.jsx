import { NavLink } from 'react-router-dom'

const sidebarLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/helpdesk', label: 'Helpdesk' },
]

function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 rounded-xl bg-white p-5 shadow-sm lg:block">
      <div className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Navigation
      </div>
      <div className="space-y-2">
        {sidebarLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar
