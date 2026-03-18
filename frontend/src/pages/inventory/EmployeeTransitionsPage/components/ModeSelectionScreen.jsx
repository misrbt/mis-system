import { ArrowLeft, ArrowLeftRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ModeSelectionCard } from './ModeSelectionCard'
import { TRANSITION_MODES, TRANSITION_MODE_CONFIG } from '../constants'

export function ModeSelectionScreen({ onSelectMode }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="mb-10">
          <div className="flex justify-start mb-6">
            <button
              onClick={() => navigate('/inventory/employees')}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group px-1"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Employees
            </button>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg">
                <ArrowLeftRight className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900">Employee Transitions</h1>
            </div>
            <p className="text-lg text-slate-600">Choose how you want to manage employee transitions</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <ModeSelectionCard
            mode={TRANSITION_MODES.BRANCH}
            config={TRANSITION_MODE_CONFIG[TRANSITION_MODES.BRANCH]}
            onSelect={onSelectMode}
          />
          <ModeSelectionCard
            mode={TRANSITION_MODES.EMPLOYEE}
            config={TRANSITION_MODE_CONFIG[TRANSITION_MODES.EMPLOYEE]}
            onSelect={onSelectMode}
          />
        </div>
      </div>
    </div>
  )
}
