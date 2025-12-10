import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/helpdesk', label: 'Helpdesk' },
]

function NavBar() {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          MIS System
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded px-3 py-2 transition ${
                  isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
                }`
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default NavBar
