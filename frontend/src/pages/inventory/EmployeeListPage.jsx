import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, MapPin, Briefcase, Mail, Search, Filter, ArrowLeft } from 'lucide-react'
import { fetchEmployeesRequest } from '../../services/employeeService'
import { fetchBranchesRequest } from '../../services/branchService'

function EmployeeListPage() {
  const navigate = useNavigate()
  const [selectedBranch, setSelectedBranch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch employees
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await fetchEmployeesRequest()).data,
  })

  // Fetch branches
  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => (await fetchBranchesRequest()).data,
  })

  const employees = Array.isArray(employeesData?.data)
    ? employeesData.data
    : Array.isArray(employeesData)
    ? employeesData
    : []

  const branches = Array.isArray(branchesData?.data)
    ? branchesData.data
    : Array.isArray(branchesData)
    ? branchesData
    : []

  // Filter employees by branch and search query
  const filteredEmployees = employees.filter((employee) => {
    const matchesBranch = !selectedBranch || employee.branch?.id === parseInt(selectedBranch)
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery ||
      employee.fullname?.toLowerCase().includes(searchLower) ||
      employee.firstname?.toLowerCase().includes(searchLower) ||
      employee.lastname?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.position?.position_name?.toLowerCase().includes(searchLower)

    return matchesBranch && matchesSearch
  })

  const handleEmployeeClick = (employeeId) => {
    navigate(`/inventory/employees/${employeeId}/assets`)
  }

  const handleBackClick = () => {
    navigate('/inventory/assets')
  }

  if (isLoadingEmployees || isLoadingBranches) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Loading employees...</p>
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
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Employees</h1>
              <p className="text-slate-600">View employees and their IT assets</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Employees
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or position..."
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
              Showing <span className="font-semibold text-slate-900">{filteredEmployees.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{employees.length}</span> employees
            </p>
          </div>
        </div>

        {/* Employee Cards Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No employees found</h3>
            <p className="text-slate-600">
              {searchQuery || selectedBranch
                ? 'Try adjusting your filters'
                : 'No employees available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                onClick={() => handleEmployeeClick(employee.id)}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
              >
                {/* Employee Avatar */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {employee.fullname?.charAt(0).toUpperCase() || 'E'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 truncate">
                      {employee.fullname}
                    </h3>
                    {employee.position?.position_name && (
                      <p className="text-sm text-slate-600 truncate">
                        {employee.position.position_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Employee Details */}
                <div className="space-y-2">
                  {employee.branch?.branch_name && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{employee.branch.branch_name}</span>
                    </div>
                  )}
                  {employee.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                  )}
                </div>

                {/* View Assets Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Click to view assets</span>
                    <Briefcase className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeListPage
