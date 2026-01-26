import { createPortal } from 'react-dom'
import { MapPin, MessageSquare, Search, User, Users, X } from 'lucide-react'

function BulkTransferModal({
  isOpen,
  onClose,
  selectedAssets,
  employeeSearch,
  onEmployeeSearchChange,
  filteredEmployees,
  isLoadingEmployees,
  employees,
  selectedEmployeeId,
  onSelectEmployee,
  onSubmit,
  isSubmitting,
}) {
  if (!isOpen) return null

  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId)

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">
            Transfer {selectedAssets.length} Asset{selectedAssets.length > 1 ? 's' : ''}
          </h3>
        </div>

        <div className="p-6 flex-1">
          <p className="text-sm text-slate-600 mb-4">
            Search and select an employee to transfer the selected assets to:
          </p>

          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Employee Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Type employee name to search..."
                value={employeeSearch}
                onChange={(e) => onEmployeeSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {employeeSearch && !selectedEmployeeId && (
              <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {isLoadingEmployees ? (
                  <div className="p-4 text-center text-slate-500">
                    <div className="animate-spin w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm">Loading...</p>
                  </div>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => {
                        onSelectEmployee(employee.id, employee.fullname)
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <p className="text-sm font-medium text-slate-900">{employee.fullname}</p>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    <p className="text-sm">No employees found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedEmployee && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-slate-900 mb-2">{selectedEmployee.fullname}</h4>
                  <div className="space-y-1.5">
                    {selectedEmployee.position?.position_name && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">Position:</span>
                        <span>{selectedEmployee.position.position_name}</span>
                      </div>
                    )}
                    {selectedEmployee.branch?.branch_name && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">Branch:</span>
                        <span>{selectedEmployee.branch.branch_name}</span>
                      </div>
                    )}
                    {selectedEmployee.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">Email:</span>
                        <span className="truncate">{selectedEmployee.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !selectedEmployeeId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Transferring...' : 'Transfer Assets'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default BulkTransferModal
