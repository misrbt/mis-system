import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check, Users, MapPin, ClipboardCheck } from 'lucide-react'
import { EmployeeSelectionStep } from './EmployeeSelectionStep'
import { DestinationStep } from './DestinationStep'
import { ReviewStep } from './ReviewStep'
import { getWorkstation } from '../../../hooks/useTransitionState'

const STEPS = [
  { id: 1, title: 'Select Employees', icon: Users },
  { id: 2, title: 'Choose Destinations', icon: MapPin },
  { id: 3, title: 'Review & Confirm', icon: ClipboardCheck },
]

export function FlowBuilderView({
  employeesData,
  modifications,
  employeesInExchanges,
  transitionMode,
  branches,
  positions,
  workstations,
  loadingEmployees,
  loadingBranches,
  loadingPositions,
  loadingWorkstations,
  onModify,
  onClear,
  onClearAll,
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedEmployees, setSelectedEmployees] = useState(new Set())

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  // Calculate pending transitions for review
  const pendingTransitions = useMemo(() => {
    return Object.entries(modifications).map(([empId, mod]) => {
      const employee = employeesData.find(e => e.id === parseInt(empId))
      if (!employee) return null

      const { ws_branch_id, ws_position_id } = getWorkstation(employee)
      const currentWorkstation = employee.workstations?.[0]

      return {
        employee,
        from: {
          branch: branches.find(b => b.id === ws_branch_id),
          position: positions.find(p => p.id === ws_position_id),
          workstation: currentWorkstation,
        },
        to: {
          branch: branches.find(b => b.id === mod.to_branch_id),
          position: positions.find(p => p.id === mod.to_position_id),
          workstation: workstations.find(ws => ws.id === mod.to_workstation_id),
        },
        isInExchange: employeesInExchanges.has(employee.id),
      }
    }).filter(Boolean)
  }, [modifications, employeesData, branches, positions, workstations, employeesInExchanges])

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedEmployees.size > 0
      case 2:
        return Object.keys(modifications).length > 0
      case 3:
        return Object.keys(modifications).length > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 3 && canProceed()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => {
      const next = new Set(prev)
      if (next.has(employeeId)) {
        next.delete(employeeId)
      } else {
        next.add(employeeId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedEmployees.size === employeesData.length) {
      setSelectedEmployees(new Set())
    } else {
      setSelectedEmployees(new Set(employeesData.map(e => e.id)))
    }
  }

  const isLoading = loadingEmployees || loadingBranches || loadingPositions || loadingWorkstations

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-colors
                    ${isCompleted
                      ? `bg-${colorClass}-500 text-white`
                      : isActive
                        ? `bg-${colorClass}-100 text-${colorClass}-600 ring-2 ring-${colorClass}-500`
                        : 'bg-slate-100 text-slate-400'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                      Step {step.id}
                    </p>
                    <p className={`text-xs ${isActive ? `text-${colorClass}-600` : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    w-16 h-0.5 mx-4
                    ${currentStep > step.id ? `bg-${colorClass}-500` : 'bg-slate-200'}
                  `} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <EmployeeSelectionStep
                employees={employeesData}
                selectedEmployees={selectedEmployees}
                onSelectEmployee={handleSelectEmployee}
                onSelectAll={handleSelectAll}
                transitionMode={transitionMode}
                branches={branches}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DestinationStep
                employees={employeesData.filter(e => selectedEmployees.has(e.id))}
                modifications={modifications}
                transitionMode={transitionMode}
                branches={branches}
                positions={positions}
                workstations={workstations}
                onModify={onModify}
                onClear={onClear}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ReviewStep
                pendingTransitions={pendingTransitions}
                transitionMode={transitionMode}
                onClear={onClear}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            text-slate-600 hover:text-slate-800 hover:bg-slate-100
          `}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`
                flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                bg-${colorClass}-600 text-white hover:bg-${colorClass}-700
              `}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className={`text-sm text-${colorClass}-600 font-medium`}>
              Use the header button to execute transitions
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlowBuilderView
