import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  MapPin,
  User,
  Users,
  Package,
  Search,
  Filter,
  ArrowLeft,
  Briefcase,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { fetchBranchesRequest } from '../../services/branchService'
import { fetchPositionsRequest } from '../../services/positionService'
import { fetchEmployeesRequest } from '../../services/employeeService'
import {
  fetchWorkstationsRequest,
  createWorkstationRequest,
  deleteWorkstationRequest,
} from '../../services/workstationService'

const STORAGE_KEY = 'workstation-list-filters'

const EMPTY_FORM = {
  branch_id: '',
  obo_id: '',
  position_id: '',
  name: '',
  description: '',
  employee_ids: [],
}

function WorkstationListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedBranch, setSelectedBranch] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.branch ?? ''
      }
    } catch {
      return ''
    }
    return ''
  })

  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.search ?? ''
      }
    } catch {
      return ''
    }
    return ''
  })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)

  // Persist filters to sessionStorage when they change
  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ branch: selectedBranch, search: searchQuery })
    )
  }, [selectedBranch, searchQuery])

  // Fetch workstations from API
  const { data: workstationsData, isLoading: isLoadingWorkstations } = useQuery({
    queryKey: ['workstations', { branch_id: selectedBranch || undefined }],
    queryFn: async () => {
      const params = {}
      if (selectedBranch) params.branch_id = selectedBranch
      const response = await fetchWorkstationsRequest(params)
      return response.data?.data ?? []
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  // Fetch branches
  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await fetchBranchesRequest()
      return response.data?.data ?? []
    },
  })

  // Fetch positions
  const { data: positionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const response = await fetchPositionsRequest()
      return response.data?.data ?? []
    },
  })

  // Fetch employees (all, for assignment in modal)
  const { data: employeesData } = useQuery({
    queryKey: ['employees-all'],
    queryFn: async () => {
      const response = await fetchEmployeesRequest({ all: true })
      return response.data?.data ?? []
    },
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createWorkstationRequest,
    onSuccess: async () => {
      await queryClient.refetchQueries(['workstations'])
      setShowCreateModal(false)
      setFormData(EMPTY_FORM)
      Swal.fire({
        icon: 'success',
        title: 'Workstation Created!',
        text: 'New workstation has been successfully created',
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: error.response?.data?.message || 'Failed to create workstation. Please try again.',
        confirmButtonColor: '#3b82f6',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteWorkstationRequest,
    onSuccess: async () => {
      await queryClient.refetchQueries(['workstations'])
    },
  })

  const workstations = Array.isArray(workstationsData) ? workstationsData : []
  const branches = Array.isArray(branchesData) ? branchesData : []
  const positions = Array.isArray(positionsData) ? positionsData : []
  const allEmployees = Array.isArray(employeesData) ? employeesData : []

  // Employees filtered to the selected branch in the create modal
  const modalEmployees = useMemo(() => {
    if (!formData.branch_id) return allEmployees
    return allEmployees.filter((e) => String(e.branch_id) === String(formData.branch_id))
  }, [allEmployees, formData.branch_id])

  // Filter workstations by search query
  const filteredWorkstations = useMemo(() => {
    if (!searchQuery) return workstations
    const searchLower = searchQuery.toLowerCase()
    return workstations.filter(
      (ws) =>
        ws.name?.toLowerCase().includes(searchLower) ||
        ws.branch?.branch_name?.toLowerCase().includes(searchLower) ||
        ws.position?.title?.toLowerCase().includes(searchLower) ||
        ws.employees?.some((emp) =>
          emp.fullname?.toLowerCase().includes(searchLower)
        )
    )
  }, [workstations, searchQuery])

  // Group filtered workstations by branch for section-based display
  const groupedByBranch = useMemo(() => {
    const map = new Map()
    filteredWorkstations.forEach((ws) => {
      const branchId = ws.branch_id
      if (!map.has(branchId)) {
        map.set(branchId, {
          branchName: ws.branch?.branch_name || 'Unknown Branch',
          workstations: [],
        })
      }
      map.get(branchId).workstations.push(ws)
    })
    return Array.from(map.values())
  }, [filteredWorkstations])

  const handleWorkstationClick = (workstation) => {
    navigate(`/inventory/workstations/${workstation.id}/assets`)
  }

  const handleBackClick = () => {
    navigate('/inventory/assets')
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handlePositionChange = (e) => {
    const positionId = e.target.value
    const position = positions.find((p) => String(p.id) === String(positionId))
    setFormData((prev) => ({
      ...prev,
      position_id: positionId,
      name: position ? position.title : '',
    }))
  }

  const handleBranchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      branch_id: e.target.value,
      obo_id: '',
      employee_ids: [],
    }))
  }

  const handleEmployeeToggle = (employeeId) => {
    setFormData((prev) => {
      const id = Number(employeeId)
      const already = prev.employee_ids.includes(id)
      return {
        ...prev,
        employee_ids: already
          ? prev.employee_ids.filter((x) => x !== id)
          : [...prev.employee_ids, id],
      }
    })
  }

  const handleDeleteWorkstation = (workstation) => {
    if (workstation.asset_count > 0) {
      alert('Cannot delete workstation with assigned assets')
      return
    }
    const hasEmployees =
      (workstation.employees && workstation.employees.length > 0) ||
      workstation.employee_id ||
      workstation.employee
    if (hasEmployees) {
      alert('Cannot delete workstation with assigned employee')
      return
    }
    if (window.confirm(`Delete workstation "${workstation.name}"?`)) {
      deleteMutation.mutate(workstation.id)
    }
  }

  const isLoading = isLoadingWorkstations || isLoadingBranches || isLoadingPositions

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading workstations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Assets</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Workstations
                </h1>
                <p className="text-slate-600">
                  Manage workstations with their assets and assigned employees
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Workstation</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Workstations
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, branch, position, or employee..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Branch
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing{' '}
              <span className="font-semibold text-slate-900">
                {filteredWorkstations.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-900">
                {workstations.length}
              </span>{' '}
              workstations
            </p>
          </div>
        </div>

        {/* Workstation Cards — grouped by branch */}
        {filteredWorkstations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No workstations found
            </h3>
            <p className="text-slate-600">
              {searchQuery || selectedBranch
                ? 'Try adjusting your filters'
                : 'Create your first workstation to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByBranch.map((group) => (
              <div key={group.branchName}>
                {/* Branch section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-slate-800">
                      {group.branchName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {group.workstations.length}{' '}
                      {group.workstations.length === 1
                        ? 'workstation'
                        : 'workstations'}
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Workstation cards for this branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.workstations.map((workstation) => {
                    const assignedEmployees = workstation.employees ?? (workstation.employee ? [workstation.employee] : [])
                    const hasEmployees = assignedEmployees.length > 0
                    const assetCount = workstation.asset_count || 0

                    return (
                      <div
                        key={workstation.id}
                        onClick={() => handleWorkstationClick(workstation)}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 hover:shadow-md hover:border-blue-300 transition-all group cursor-pointer"
                      >
                        {/* Workstation header */}
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 ${
                              hasEmployees
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`text-base font-bold leading-tight ${
                                hasEmployees
                                  ? 'text-slate-900 group-hover:text-blue-600'
                                  : 'text-slate-500'
                              } transition-colors`}
                            >
                              {workstation.position?.title || 'General Workstation'}
                            </h3>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteWorkstation(workstation)
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Workstation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Assigned Employees */}
                        <div
                          className={`rounded-lg px-3 py-2.5 ${
                            hasEmployees ? 'bg-slate-50' : 'bg-slate-50/60'
                          }`}
                        >
                          <p className="text-xs text-slate-500 mb-2">
                            {assignedEmployees.length > 1 ? 'Assigned Employees' : 'Assigned Employee'}
                          </p>
                          {hasEmployees ? (
                            <div className="space-y-1.5">
                              {assignedEmployees.map((emp) => (
                                <div key={emp.id} className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {emp.fullname?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-medium text-slate-900 truncate flex-1">
                                    {emp.fullname}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs text-slate-400 italic">
                                No employee assigned
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-auto">
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold text-slate-900">
                                {assetCount}
                              </span>
                              <span>{assetCount === 1 ? 'asset' : 'assets'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold text-slate-900">
                                {assignedEmployees.length}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-blue-500 font-medium flex items-center gap-1 group-hover:underline">
                            View {assetCount > 0 ? 'assets' : 'workstation'}
                            <Briefcase className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Workstation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Create New Workstation
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); setFormData(EMPTY_FORM) }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.branch_id}
                  onChange={handleBranchChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* OBO (conditional) */}
              {(() => {
                const selBranch = branches.find(
                  (b) => String(b.id) === String(formData.branch_id)
                )
                const branchObos = Array.isArray(selBranch?.obos) ? selBranch.obos : []
                if (!selBranch?.has_obo || branchObos.length === 0) return null
                return (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      OBO Assignment (Optional)
                    </label>
                    <select
                      value={formData.obo_id}
                      onChange={(e) => setFormData({ ...formData, obo_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Branch (not assigned to any OBO)</option>
                      {branchObos.map((obo) => (
                        <option key={obo.id} value={obo.id}>
                          {obo.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })()}

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Position (Optional)
                </label>
                <select
                  value={formData.position_id}
                  onChange={handlePositionChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">General</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workstation Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Workstation Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    formData.position_id
                      ? 'Auto-filled from position'
                      : 'Auto-generated if empty'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.position_id
                    ? 'Based on selected position. You may override it.'
                    : 'Leave empty to auto-generate from branch and position.'}
                </p>
              </div>

              {/* Employee Assignment */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assign Employees (Optional)
                </label>
                {!formData.branch_id ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Select a branch first to see available employees.
                  </p>
                ) : modalEmployees.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No employees found for this branch.
                  </p>
                ) : (
                  <div className="border border-slate-300 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-100">
                    {modalEmployees.map((emp) => {
                      const checked = formData.employee_ids.includes(emp.id)
                      return (
                        <label
                          key={emp.id}
                          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleEmployeeToggle(emp.id)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {emp.fullname}
                            </p>
                            {emp.position?.title && (
                              <p className="text-xs text-slate-500 truncate">
                                {emp.position.title}
                              </p>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
                {formData.employee_ids.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {formData.employee_ids.length}{' '}
                    {formData.employee_ids.length === 1 ? 'employee' : 'employees'} selected
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setFormData(EMPTY_FORM) }}
                  className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkstationListPage
