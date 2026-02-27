import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function ModeSelectionCard({ mode, config, onSelect }) {
  const { title, description, icon: Icon, features, color } = config

  const colorClasses = {
    teal: {
      gradient: 'from-teal-500 to-teal-600',
      border: 'hover:border-teal-400',
      text: 'text-teal-600',
      bar: 'from-teal-500 to-teal-600',
    },
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      border: 'hover:border-blue-400',
      text: 'text-blue-600',
      bar: 'from-blue-500 to-blue-600',
    },
  }

  const styles = colorClasses[color]

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(mode)}
      className={`relative group bg-white rounded-3xl border-2 border-slate-200 ${styles.border} hover:shadow-2xl p-8 text-left transition-all`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${styles.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {features.map(item => (
          <div key={item.label} className="flex items-start gap-3 text-sm text-slate-700">
            <CheckCircle2 className={`w-5 h-5 ${styles.text} flex-shrink-0 mt-0.5`} />
            <div>
              <span className="font-medium">{item.label}</span>
              <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className={`inline-flex items-center gap-2 ${styles.text} font-semibold group-hover:gap-3 transition-all`}>
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
      <div className={`absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r ${styles.bar} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
    </motion.button>
  )
}
