import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Building2, MapPin, User, Package, Search, Filter, ArrowLeft, Briefcase } from 'lucide-react'
import { fetchEmployeesRequest } from '../../services/employeeService'
import { fetchBranchesRequest } from '../../services/branchService'
import { fetchPositionsRequest } from '../../services/positionService'
import apiClient from '../../services/apiClient'

const STORAGE_KEY = 'workstation-list-filters'

function WorkstationListPage() {
  const navigate = useNavigate()

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

  // Persist filters to sessionStorage when they change
  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ branch: selectedBranch, search: searchQuery })
    )
  }, [selectedBranch, searchQuery])

  // Fetch employees (all, for the employeeById lookup)
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: async () => {
      const response = await fetchEmployeesRequest({ all: true })
      const resData = response.data
      if (Array.isArray(resData?.data?.data)) return resData.data.data
      if (Array.isArray(resData?.data)) return resData.data
      if (Array.isArray(resData)) return resData
      return []
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

  // Fetch ALL assets (with workstation fields) — must use all=true to bypass pagination
  const { data: assetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets', 'all'],
    queryFn: async () => {
      const response = await apiClient.get('/assets', { params: { all: true } })
      return response.data
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const employees = Array.isArray(employeesData) ? employeesData : []
  const branches  = Array.isArray(branchesData)  ? branchesData  : []
  const positions = Array.isArray(positionsData) ? positionsData : []
  const assets    = Array.isArray(assetsData?.data?.data)
    ? assetsData.data.data
    : Array.isArray(assetsData?.data)
    ? assetsData.data
    : Array.isArray(assetsData)
    ? assetsData
    : []

  // Build a quick employee lookup map by id
  const employeeById = useMemo(() => {
    const map = new Map()
    employees.forEach(emp => map.set(emp.id, emp))
    return map
  }, [employees])

  // Build workstations from assets' workstation_branch_id + workstation_position_id.
  // The employee shown is whoever the asset is currently assigned to (assigned_to_employee_id).
  // One card per unique (workstation_branch_id, workstation_position_id) pair.
  const workstations = useMemo(() => {
    const workstationMap = new Map()

    assets.forEach(asset => {
      if (!asset.workstation_branch_id || !asset.workstation_position_id) return

      const key = `${asset.workstation_branch_id}-${asset.workstation_position_id}`

      if (!workstationMap.has(key)) {
        const branch   = branches.find(b => b.id === asset.workstation_branch_id)
        const position = positions.find(p => p.id === asset.workstation_position_id)

        // Use the asset's assigned_to_employee_id — this is the source of truth
        // for who currently occupies this workstation desk.
        const assignedEmployee = asset.assigned_to_employee_id
          ? (employeeById.get(asset.assigned_to_employee_id) ?? null)
          : null

        workstationMap.set(key, {
          branch_id:   asset.workstation_branch_id,
          position_id: asset.workstation_position_id,
          branch:      branch   || asset.workstationBranch   || null,
          position:    position || asset.workstationPosition || null,
          employee:    assignedEmployee,
          assets:      [],
        })
      } else {
        // If the workstation entry has no employee yet, fill it from this asset
        const ws = workstationMap.get(key)
        if (!ws.employee && asset.assigned_to_employee_id) {
          ws.employee = employeeById.get(asset.assigned_to_employee_id) ?? null
        }
      }

      workstationMap.get(key).assets.push(asset)
    })

    return Array.from(workstationMap.values())
  }, [employeeById, assets, branches, positions])

  // Filter workstations by branch and search query
  const filteredWorkstations = useMemo(() => {
    return workstations.filter(workstation => {
      const matchesBranch = !selectedBranch || workstation.branch_id === parseInt(selectedBranch)
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery ||
        workstation.branch?.branch_name?.toLowerCase().includes(searchLower) ||
        workstation.position?.title?.toLowerCase().includes(searchLower) ||
        workstation.position?.position_name?.toLowerCase().includes(searchLower) ||
        workstation.employee?.fullname?.toLowerCase().includes(searchLower)
      return matchesBranch && matchesSearch
    })
  }, [workstations, selectedBranch, searchQuery])

  // Group filtered workstations by branch for section-based display
  const groupedByBranch = useMemo(() => {
    const map = new Map()
    filteredWorkstations.forEach(ws => {
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
    // If there's an employee, navigate to their asset view
    if (workstation.employee) {
      navigate(`/inventory/employees/${workstation.employee.id}/assets`)
    }
  }

  const handleBackClick = () => {
    navigate('/inventory/assets')
  }

  if (isLoadingEmployees || isLoadingBranches || isLoadingPositions || isLoadingAssets) {
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
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600 text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Workstations</h1>
              <p className="text-slate-600">View workstations with their assets and assigned employees</p>
            </div>
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
                  placeholder="Search by branch, position, or employee..."
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
              Showing <span className="font-semibold text-slate-900">{filteredWorkstations.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{workstations.length}</span> workstations
            </p>
          </div>
        </div>

        {/* Workstation Cards — grouped by branch */}
        {filteredWorkstations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No workstations found</h3>
            <p className="text-slate-600">
              {searchQuery || selectedBranch ? 'Try adjusting your filters' : 'No workstations available'}
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
                    <h2 className="text-base font-bold text-slate-800">{group.branchName}</h2>
                    <p className="text-xs text-slate-500">
                      {group.workstations.length} {group.workstations.length === 1 ? 'workstation' : 'workstations'}
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Workstation cards for this branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.workstations.map((workstation) => {
                    const key = `${workstation.branch_id}-${workstation.position_id}`
                    const hasEmployee = !!workstation.employee
                    const assetCount = workstation.assets.length
                    const positionName = workstation.position?.title
                      || workstation.position?.position_name
                      || 'Unknown Position'

                    return (
                      <div
                        key={key}
                        onClick={() => hasEmployee && handleWorkstationClick(workstation)}
                        className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-4 transition-all ${
                          hasEmployee
                            ? 'border-slate-200 hover:shadow-md hover:border-blue-300 cursor-pointer group'
                            : 'border-slate-200 opacity-70'
                        }`}
                      >
                        {/* Position name — main title */}
                        <div className="flex items-start gap-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 ${
                            hasEmployee
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-105'
                              : 'bg-slate-200 text-slate-400'
                          } transition-transform`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-bold leading-tight truncate ${
                              hasEmployee ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-500'
                            } transition-colors`}>
                              {positionName}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Workstation desk</p>
                          </div>
                        </div>

                        {/* Assigned Employee */}
                        <div className={`rounded-lg px-3 py-2.5 flex items-center gap-3 ${
                          hasEmployee ? 'bg-slate-50' : 'bg-slate-50/60'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                            hasEmployee ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {hasEmployee
                              ? workstation.employee.fullname.charAt(0).toUpperCase()
                              : <User className="w-4 h-4" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500">Assigned to</p>
                            {hasEmployee ? (
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {workstation.employee.fullname}
                              </p>
                            ) : (
                              <p className="text-sm text-slate-400 italic">Unoccupied</p>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-auto">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Package className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-900">{assetCount}</span>
                            {assetCount === 1 ? ' asset' : ' assets'}
                          </div>
                          {hasEmployee && (
                            <span className="text-xs text-blue-500 font-medium flex items-center gap-1 group-hover:underline">
                              View assets
                              <Briefcase className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          )}
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
    </div>
  )
}

export default WorkstationListPage
