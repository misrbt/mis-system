import { useState } from 'react'
import { AlertTriangle, RefreshCw, ArrowRight, MapPin, CheckCircle2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function OccupiedWorkstationExchange({
  occupyingEmployee,
  currentEmployee,
  selectedWorkstation,
  availableWorkstations,
  transitionMode,
  onCreateExchange,
  isPartOfExchange,
}) {
  const [showExchangeBuilder, setShowExchangeBuilder] = useState(false)
  const [selectedExchangeWorkstation, setSelectedExchangeWorkstation] = useState('')

  if (!occupyingEmployee) return null

  // Get current workstation of occupying employee
  const occupyingEmployeeCurrentWs = occupyingEmployee.workstations?.[0]

  // Filter workstations available for the occupying employee
  // Exclude the workstation the current employee wants (to avoid circular swap to same place)
  const exchangeWorkstationOptions = availableWorkstations.filter(ws => {
    // Don't show the workstation we're trying to move the current employee to
    if (ws.id === selectedWorkstation?.id) return false
    // Show available workstations
    if (!ws.employee) return true
    // Show the occupying employee's current workstation
    if (ws.employee?.id === occupyingEmployee.id) return true
    return false
  })

  const handleCreateExchange = () => {
    if (!selectedExchangeWorkstation) {
      alert('Please select a workstation for the exchange')
      return
    }

    onCreateExchange(occupyingEmployee.id, parseInt(selectedExchangeWorkstation))
    setShowExchangeBuilder(false)
    setSelectedExchangeWorkstation('')
  }

  const isBranch = transitionMode === 'branch'

  // If already part of exchange, show confirmation
  if (isPartOfExchange) {
    return (
      <div className="mt-2 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
        <div className="flex items-start gap-2">
          <RefreshCw className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-purple-900 text-sm">Exchange Detected</p>
            <p className="text-purple-700 text-xs mt-1">
              {occupyingEmployee.fullname} is also being transitioned - automatic exchange will occur
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show warning with exchange builder
  return (
    <div className="mt-2 space-y-2">
      {/* Warning */}
      <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm">Workstation Occupied</p>
            <p className="text-amber-700 text-xs mt-1">
              <strong>{occupyingEmployee.fullname}</strong> is currently assigned to this workstation.
            </p>

            {!showExchangeBuilder && (
              <button
                onClick={() => setShowExchangeBuilder(true)}
                className={`mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all hover:shadow ${
                  isBranch
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <RefreshCw className="w-3 h-3 inline mr-1" />
                Create Exchange / Swap
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exchange Builder */}
      <AnimatePresence>
        {showExchangeBuilder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 border-2 rounded-lg ${
              isBranch
                ? 'bg-teal-50/50 border-teal-300'
                : 'bg-blue-50/50 border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className={`font-semibold text-sm ${
                  isBranch ? 'text-teal-900' : 'text-blue-900'
                }`}>
                  <RefreshCw className="w-4 h-4 inline mr-1" />
                  Create Exchange
                </h4>
                <p className={`text-xs mt-1 ${
                  isBranch ? 'text-teal-700' : 'text-blue-700'
                }`}>
                  Reassign {occupyingEmployee.fullname} to complete the swap
                </p>
              </div>
              <button
                onClick={() => {
                  setShowExchangeBuilder(false)
                  setSelectedExchangeWorkstation('')
                }}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-white rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Exchange Flow Visualization */}
            <div className="bg-white rounded-lg border border-slate-200 p-3 mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-xs">
                {/* Current Employee */}
                <div className={`p-2 rounded border-2 ${
                  isBranch ? 'border-teal-200 bg-teal-50' : 'border-blue-200 bg-blue-50'
                }`}>
                  <div className="font-semibold text-slate-900">{currentEmployee.fullname}</div>
                  <div className="text-slate-600 text-[10px] mt-0.5">
                    → {selectedWorkstation?.position?.title || 'Target WS'}
                  </div>
                </div>

                {/* Exchange Arrow */}
                <div className="hidden sm:flex justify-center">
                  <RefreshCw className={`w-5 h-5 ${
                    isBranch ? 'text-teal-500' : 'text-blue-500'
                  }`} />
                </div>

                {/* Occupying Employee */}
                <div className={`p-2 rounded border-2 ${
                  isBranch ? 'border-teal-200 bg-teal-50' : 'border-blue-200 bg-blue-50'
                }`}>
                  <div className="font-semibold text-slate-900">{occupyingEmployee.fullname}</div>
                  <div className="text-slate-600 text-[10px] mt-0.5">
                    Currently at: {selectedWorkstation?.position?.title || 'Target WS'}
                  </div>
                </div>
              </div>
            </div>

            {/* Workstation Selection for Occupying Employee */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                <MapPin className="w-3 h-3 inline mr-1" />
                Where should {occupyingEmployee.fullname} go?
              </label>

              <select
                value={selectedExchangeWorkstation}
                onChange={(e) => setSelectedExchangeWorkstation(e.target.value)}
                className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  isBranch
                    ? 'border-teal-300 focus:ring-teal-500'
                    : 'border-blue-300 focus:ring-blue-500'
                }`}
              >
                <option value="">-- Select Destination Workstation --</option>

                {/* Current workstation of occupying employee */}
                {occupyingEmployeeCurrentWs && occupyingEmployeeCurrentWs.id !== selectedWorkstation?.id && (
                  <optgroup label="📍 Their Current Workstation">
                    <option value={occupyingEmployeeCurrentWs.id}>
                      {occupyingEmployeeCurrentWs.position?.title || 'General'} • {occupyingEmployeeCurrentWs.assets_count || 0} assets
                    </option>
                  </optgroup>
                )}

                {/* Available workstations */}
                <optgroup label="✓ Available Workstations">
                  {exchangeWorkstationOptions
                    .filter(ws => !ws.employee && ws.id !== occupyingEmployeeCurrentWs?.id)
                    .map(ws => (
                      <option key={ws.id} value={ws.id}>
                        {ws.position?.title || 'General'} • {ws.assets_count || 0} assets • Branch: {ws.branch?.branch_name || 'N/A'}
                      </option>
                    ))}
                </optgroup>
              </select>

              {exchangeWorkstationOptions.filter(ws => !ws.employee).length === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  No available workstations for exchange. Consider choosing a different workstation for {currentEmployee.fullname}.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCreateExchange}
                disabled={!selectedExchangeWorkstation}
                className={`flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 disabled:cursor-not-allowed ${
                  isBranch
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Complete Exchange
              </button>
              <button
                onClick={() => {
                  setShowExchangeBuilder(false)
                  setSelectedExchangeWorkstation('')
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Helper Text */}
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              💡 This will create a swap: {currentEmployee.fullname} gets the occupied workstation,
              and {occupyingEmployee.fullname} moves to your selected destination
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
