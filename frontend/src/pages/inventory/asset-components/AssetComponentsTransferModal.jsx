import React from 'react'
import { X, User } from 'lucide-react'

const AssetComponentsTransferModal = ({
  isOpen,
  component,
  employeeSearch,
  onEmployeeSearchChange,
  filteredEmployees,
  selectedEmployeeId,
  onSelectEmployee,
  onSubmit,
  isSubmitting,
  onClose,
}) => {
  if (!isOpen || !component) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transfer Component</h2>
              <p className="text-sm text-gray-600 mt-1">
                Transfer <strong>{component.component_name}</strong> to an employee
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search employees by name, position, branch, or email..."
            value={employeeSearch}
            onChange={(e) => onEmployeeSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-2">
            {filteredEmployees.length} employee(s) found
          </p>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {employeeSearch ? 'No employees found matching your search' : 'No employees available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => onSelectEmployee(emp.id.toString())}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:border-indigo-500 hover:bg-indigo-50 ${
                    selectedEmployeeId === emp.id.toString()
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{emp.fullname}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        {emp.position?.position_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {emp.position.position_name}
                          </span>
                        )}
                        {emp.branch?.branch_name && (
                          <span>{emp.branch.branch_name}</span>
                        )}
                      </div>
                      {emp.email && (
                        <p className="text-xs text-gray-500 mt-1">{emp.email}</p>
                      )}
                    </div>
                    {selectedEmployeeId === emp.id.toString() && (
                      <div className="ml-4">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onSubmit}
            disabled={!selectedEmployeeId || isSubmitting}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Transferring...' : 'Transfer Component'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AssetComponentsTransferModal)
