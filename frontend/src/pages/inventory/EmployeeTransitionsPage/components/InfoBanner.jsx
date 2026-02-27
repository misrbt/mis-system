import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { TRANSITION_MODE_CONFIG } from '../constants'

export function InfoBanner({ transitionMode }) {
  const config = TRANSITION_MODE_CONFIG[transitionMode]
  const isBranch = transitionMode === 'branch'

  const renderDescription = () => {
    const text = config.infoBannerDescriptionText
    if (isBranch) {
      return (
        <>
          Change the <strong>Destination Branch</strong> or <strong>Destination Position</strong> for any employee.
          When multiple employees swap positions, they&apos;ll be <strong className="text-purple-700">automatically detected as exchanges</strong> and marked with purple badges.
          <br />
          <strong className="text-emerald-600">Workstation assets</strong> (Desktop PCs, monitors, etc.) <strong>stay at their desks</strong> and are reassigned to incoming employees.
          <strong className="text-blue-600"> Portable assets</strong> (laptops) <strong>follow the employee</strong>.
        </>
      )
    }
    return (
      <>
        Change the <strong>Destination Branch</strong> or <strong>Destination Position</strong> for any employee.
        No validation or exchange requirements - perfect for promotions, transfers, or reassignments.
        <br />
        <strong className="text-emerald-600">Workstation assets</strong> (Desktop PCs, monitors, etc.) <strong>stay at their desks</strong> and are reassigned to incoming employees.
        <strong className="text-blue-600"> Portable assets</strong> (laptops) <strong>follow the employee</strong>.
      </>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${
        isBranch
          ? 'from-teal-50 via-teal-50/50 to-blue-50'
          : 'from-blue-50 via-blue-50/50 to-indigo-50'
      } border ${isBranch ? 'border-teal-200' : 'border-blue-200'} rounded-xl p-4`}
    >
      <div className="flex items-start gap-3">
        <Info className={`w-5 h-5 ${isBranch ? 'text-teal-600' : 'text-blue-600'} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${isBranch ? 'text-teal-900' : 'text-blue-900'} mb-1`}>
            {config.infoBannerTitle}
          </p>
          <p className={`text-sm ${isBranch ? 'text-teal-800' : 'text-blue-800'}`}>
            {renderDescription()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
