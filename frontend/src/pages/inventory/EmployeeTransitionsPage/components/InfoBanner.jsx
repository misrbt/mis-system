import { motion } from 'framer-motion'
import { Info, MapPin, Building2, ArrowRight, AlertTriangle, Users } from 'lucide-react'
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
    <div className="space-y-3">
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

      {/* Batch Operations Tip */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-amber-50 via-amber-50/50 to-orange-50 border border-amber-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 mb-1">
              💡 Batch Operations Enabled
            </p>
            <p className="text-sm text-amber-800">
              <strong>You can modify multiple employees at once!</strong> Make changes to as many employees as needed in the table below,
              then click <strong>Execute</strong> to process all transitions together. The <strong>Pending Transitions Summary</strong> shows
              all your changes before submission.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Workstation Assignment Guide */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-teal-50 border border-emerald-200 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-900 mb-2">
              {isBranch ? 'Branch Transition Mode' : 'Employee Transition Mode'} - Workstation Assignment
            </p>

            {isBranch ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-800">
                <div className="flex items-start gap-2">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Branch Change:</span> Select new branch to transfer employee to different location
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Workstation Selection:</span> Choose workstation in the new branch after selecting destination branch
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Auto-Match:</span> System suggests workstations matching employee's position in new branch
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Occupied Workstations:</span> System warns if selected workstation is occupied. Recommend also transitioning occupying employee to create exchange
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-emerald-800">
                <div className="flex items-start gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Branch Locked:</span> Cannot change branch in Employee mode - employee stays in current branch
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Workstation Only:</span> Reassign to different workstation within same branch
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Same Branch Transfer:</span> Move employee to another desk/position within current location
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Occupied Workstations:</span> System warns if workstation is occupied. Create exchange by also transitioning the other employee
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
