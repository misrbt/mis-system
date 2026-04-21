import PropTypes from 'prop-types'
import { Building2, MapPin, Hash, UserSquare2, Plus, Trash2 } from 'lucide-react'

function BranchForm({ formData, onChange, onObosChange, onSubmit, onCancel, submitLabel }) {
  const obos = Array.isArray(formData.obos) ? formData.obos : []

  const addObo = () => {
    onObosChange([...obos, { id: null, name: '' }])
  }

  const updateObo = (index, name) => {
    const next = obos.map((row, i) => (i === index ? { ...row, name } : row))
    onObosChange(next)
  }

  const removeObo = (index) => {
    onObosChange(obos.filter((_, i) => i !== index))
  }

  const toggleHasObo = (checked) => {
    onChange({ target: { name: 'has_obo', value: checked } })
    if (checked && obos.length === 0) {
      onObosChange([{ id: null, name: '' }])
    }
    if (!checked) {
      onObosChange([])
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Branch Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building2 className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            name="branch_name"
            value={formData.branch_name}
            onChange={onChange}
            required
            className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter branch name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          BRAK <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            name="brak"
            value={formData.brak}
            onChange={onChange}
            required
            className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter BRAK code"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Branch Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Hash className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            name="brcode"
            value={formData.brcode}
            onChange={onChange}
            required
            className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter branch code"
          />
        </div>
      </div>

      <div className="pt-2">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!formData.has_obo}
            onChange={(e) => toggleHasObo(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-slate-700">This branch has one or more OBOs</span>
        </label>
      </div>

      {formData.has_obo && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-700">
              OBOs <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addObo}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add OBO
            </button>
          </div>

          {obos.length === 0 && (
            <p className="text-xs text-slate-500 italic">Click "Add OBO" to add at least one OBO.</p>
          )}

          {obos.map((row, index) => (
            <div key={row.id ?? `new-${index}`} className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserSquare2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateObo(index, e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="OBO name"
                />
              </div>
              <button
                type="button"
                onClick={() => removeObo(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove OBO"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

BranchForm.propTypes = {
  formData: PropTypes.shape({
    branch_name: PropTypes.string.isRequired,
    brak: PropTypes.string.isRequired,
    brcode: PropTypes.string.isRequired,
    has_obo: PropTypes.bool,
    obos: PropTypes.array,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onObosChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
}

export default BranchForm
