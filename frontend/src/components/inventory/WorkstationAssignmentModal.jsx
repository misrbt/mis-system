import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Search, User, Building2, Check } from 'lucide-react'
import { fetchEmployeesRequest } from '../../services/employeeService'
import { assignEmployeeToWorkstationRequest } from '../../services/workstationService'

function WorkstationAssignmentModal({ workstation, isOpen, onClose }) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Fetch employees
  const { data: employeesData, isLoading } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: async () => {
      const response = await fetchEmployeesRequest({ all: true })
      const resData = response.data
      if (Array.isArray(resData?.data?.data)) return resData.data.data
      if (Array.isArray(resData?.data)) return resData.data
      if (Array.isArray(resData)) return resData
      return []
    },
    enabled: isOpen,
  })

  const assignMutation = useMutation({
    mutationFn: (employeeId) =>
      assignEmployeeToWorkstationRequest(workstation.id, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries(['workstations'])
      queryClient.invalidateQueries(['employees'])
      onClose()
    },
  })

  const employees = Array.isArray(employeesData) ? employeesData : []

  // Filter employees not already assigned to this workstation
  const availableEmployees = employees.filter((emp) => {
    const alreadyAssigned = workstation.employees?.some((e) => e.id === emp.id)
    if (alreadyAssigned) return false

    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      emp.fullname?.toLowerCase().includes(searchLower) ||
      emp.position?.title?.toLowerCase().includes(searchLower) ||
      emp.branch?.branch_name?.toLowerCase().includes(searchLower)
    )
  })

  const handleAssign = () => {
    if (selectedEmployee) {
      assignMutation.mutate(selectedEmployee.id)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Assign Employee
              </h2>
              <p className="text-sm text-slate-500">{workstation.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees by name, position, or branch..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : availableEmployees.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {searchQuery
                  ? 'No employees match your search'
                  : 'All employees are already assigned'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`w-full flex items-center gap-3 p-3 text-left rounded-lg border transition-all ${
                    selectedEmployee?.id === emp.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      selectedEmployee?.id === emp.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {emp.fullname?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {emp.fullname}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {emp.position?.title || 'No Position'} •{' '}
                      {emp.branch?.branch_name || 'No Branch'}
                    </p>
                  </div>
                  {selectedEmployee?.id === emp.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            {selectedEmployee
              ? `Selected: ${selectedEmployee.fullname}`
              : 'Select an employee to assign'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedEmployee || assignMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Employee'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkstationAssignmentModal
