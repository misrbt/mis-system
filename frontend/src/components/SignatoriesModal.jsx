import { useState, useEffect } from 'react'
import { X, Users, Check, Save, Loader2 } from 'lucide-react'
import SearchableSelect from './SearchableSelect'

const SignatoriesModal = ({
  isOpen,
  onClose,
  signatories,
  onSave,
  currentUser,
  employees = [],
  isSaving = false
}) => {
  const [localSignatories, setLocalSignatories] = useState(signatories)

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSignatories(signatories)
    }
  }, [isOpen, signatories])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(localSignatories)
  }

  return (
    // Overlay changed from backdrop-blur-sm to simple bg-black/50
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Manage Signatories</h2>
                <p className="text-blue-100 text-sm">Configure report signatory information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The "Prepared by" field is automatically set to your account. 
              Select employees for "Checked by" and "Noted by" from the dropdowns below.
            </p>
          </div>

          {/* Prepared By - Read Only */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Prepared By (Auto-filled)
            </h3>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="font-bold text-slate-900 text-lg">{currentUser?.fullname || 'Current User'}</p>
              <p className="text-sm text-slate-600 mt-1">{currentUser?.position?.title || 'Position not set'}</p>
              {currentUser?.branch && (
                <p className="text-xs text-slate-500 mt-1">{currentUser.branch.branch_name}</p>
              )}
            </div>
          </div>

          {/* Checked By */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Checked By</h3>
            <SearchableSelect
              label=""
              options={employees}
              value={localSignatories.checked_by_id || ''}
              onChange={(value) => setLocalSignatories(prev => ({ ...prev, checked_by_id: value }))}
              displayField="fullname"
              secondaryField="position_title"
              placeholder="Select employee to check the report..."
              emptyMessage="No employees found"
            />
            {localSignatories.checked_by_id && (() => {
              const selected = employees.find(e => e.id === parseInt(localSignatories.checked_by_id))
              return selected ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-900">{selected.fullname}</p>
                  <p className="text-xs text-green-700">{selected.position?.title || 'Position not set'}</p>
                </div>
              ) : null
            })()}
          </div>

          {/* Noted By */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Noted By</h3>
            <SearchableSelect
              label=""
              options={employees}
              value={localSignatories.noted_by_id || ''}
              onChange={(value) => setLocalSignatories(prev => ({ ...prev, noted_by_id: value }))}
              displayField="fullname"
              secondaryField="position_title"
              placeholder="Select employee to note the report..."
              emptyMessage="No employees found"
            />
            {localSignatories.noted_by_id && (() => {
              const selected = employees.find(e => e.id === parseInt(localSignatories.noted_by_id))
              return selected ? (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-900">{selected.fullname}</p>
                  <p className="text-xs text-purple-700">{selected.position?.title || 'Position not set'}</p>
                </div>
              ) : null
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignatoriesModal
