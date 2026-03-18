import { motion } from 'framer-motion'
import { VIEW_TYPES, VIEW_TYPE_CONFIG } from '../../constants'
import { useTransitionView } from '../../contexts/TransitionViewContext'

export function ViewSwitcher({ transitionMode }) {
  const { currentView, setCurrentView } = useTransitionView()
  const views = Object.values(VIEW_TYPE_CONFIG)

  const getModeColor = () => {
    return transitionMode === 'branch' ? 'teal' : 'blue'
  }

  const color = getModeColor()

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5">
      <div className="flex flex-wrap gap-1">
        {views.map((view) => {
          const Icon = view.icon
          const isActive = currentView === view.id

          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`
                relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? `text-${color}-700 bg-${color}-50`
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }
              `}
              title={`${view.description} (Alt+${view.shortcut})`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeViewIndicator"
                  className={`absolute inset-0 bg-${color}-100 rounded-lg`}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{view.title}</span>
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded group-hover:bg-slate-200 transition-colors">
                  Alt+{view.shortcut}
                </kbd>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ViewSwitcher
