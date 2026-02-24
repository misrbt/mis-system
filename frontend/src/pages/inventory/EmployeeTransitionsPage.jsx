import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table'
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Info,
  RefreshCw,
  Save,
  Check,
  Building2,
  UserCog,
  ArrowLeftRight,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  Filter,
  XCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { fetchEmployeesRequest, branchTransitionRequest, employeeTransitionRequest } from '../../services/employeeService'
import { fetchBranchesRequest } from '../../services/branchService'
import { fetchPositionsRequest } from '../../services/positionService'

function EmployeeTransitionsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Mode selection: null, 'branch', 'employee'
  const [transitionMode, setTransitionMode] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [showExchangePanel, setShowExchangePanel] = useState(true)

  // Modified employees (employeeId -> { to_branch_id, to_position_id })
  const [modifications, setModifications] = useState({})

  // Table state
  const [globalFilter, setGlobalFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [showModifiedOnly, setShowModifiedOnly] = useState(false)
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const { data: employeesData = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees', 'with-assets'],
    queryFn: async () => {
      const response = await fetchEmployeesRequest({ with_assets: true, all: true })
      const resData = response.data
      if (Array.isArray(resData?.data?.data)) return resData.data.data
      if (Array.isArray(resData?.data)) return resData.data
      if (Array.isArray(resData)) return resData
      return []
    },
  })

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await fetchBranchesRequest()
      return response.data?.data ?? []
    },
  })

  const { data: positions = [], isLoading: loadingPositions } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const response = await fetchPositionsRequest()
      return response.data?.data ?? []
    },
  })

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (transitionMode === 'employee') {
        return employeeTransitionRequest(payload)
      }
      return branchTransitionRequest(payload)
    },
    onSuccess: (response) => {
      const data = response.data?.data || {}
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })

      let html = `<p class="text-lg font-semibold mb-2">${data.employees?.length || 0} employees transitioned successfully</p>`

      if (transitionMode === 'branch' && data.assets_reassigned !== undefined) {
        html += `<p class="text-sm text-slate-600">${data.assets_reassigned || 0} assets reassigned at workstations</p>`
      }

      Swal.fire({
        icon: 'success',
        title: 'Transition Complete',
        html: html,
        confirmButtonColor: transitionMode === 'branch' ? '#0d9488' : '#2563eb',
      }).then(() => {
        navigate('/inventory/employees')
      })
    },
    onError: (error) => {
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join('<br>')
        : error.response?.data?.message || 'Failed to execute transition'
      Swal.fire({
        icon: 'error',
        title: 'Error',
        html: msg,
        confirmButtonColor: '#ef4444',
      })
    },
  })

  // Detect exchanges for branch mode
  const exchanges = useMemo(() => {
    if (transitionMode !== 'branch') return []

    const swaps = []
    const processed = new Set()
    const modifiedIds = Object.keys(modifications).map(id => parseInt(id))

    modifiedIds.forEach(empId => {
      if (processed.has(empId)) return

      const emp = employeesData.find(e => e.id === empId)
      const mod = modifications[empId]
      if (!emp || !mod) return

      const swapEmpId = modifiedIds.find(otherId => {
        if (otherId === empId) return false
        const otherMod = modifications[otherId]
        return otherMod.to_branch_id === emp.branch_id &&
               otherMod.to_position_id === emp.position_id
      })

      if (swapEmpId) {
        const chain = [empId]
        let current = swapEmpId
        const visited = new Set([empId])

        while (current && !visited.has(current)) {
          chain.push(current)
          visited.add(current)

          const currentEmp = employeesData.find(e => e.id === current)
          const next = modifiedIds.find(otherId => {
            if (otherId === current) return false
            const otherMod = modifications[otherId]
            return otherMod.to_branch_id === currentEmp.branch_id &&
                   otherMod.to_position_id === currentEmp.position_id
          })

          if (next === empId) {
            swaps.push({
              type: chain.length === 2 ? '2-way swap' : `${chain.length}-way rotation`,
              employees: chain,
            })
            chain.forEach(id => processed.add(id))
            break
          }
          current = next
        }
      }
    })

    return swaps
  }, [modifications, employeesData, transitionMode])

  const employeesInExchanges = useMemo(() => {
    const ids = new Set()
    exchanges.forEach(ex => ex.employees.forEach(id => ids.add(id)))
    return ids
  }, [exchanges])

  // Pre-filtered data (branch filter + modified-only) fed into TanStack
  const tableData = useMemo(() => {
    let result = employeesData

    if (branchFilter) {
      result = result.filter(emp => emp.branch_id === parseInt(branchFilter))
    }

    if (showModifiedOnly) {
      result = result.filter(emp => modifications[emp.id])
    }

    return result
  }, [employeesData, branchFilter, showModifiedOnly, modifications])

  // TanStack Table column definition
  const columns = useMemo(() => [
    {
      id: 'employee',
      header: 'Employee',
      accessorFn: row => row.fullname ?? '',
      enableSorting: true,
    },
    {
      id: 'currentBranch',
      header: 'Current Branch',
      accessorFn: row => row.branch?.branch_name ?? '',
      enableSorting: true,
    },
    {
      id: 'currentPosition',
      header: 'Current Position',
      accessorFn: row => row.position?.title ?? '',
      enableSorting: true,
    },
    {
      id: 'destBranch',
      header: 'Destination Branch',
      enableSorting: false,
    },
    {
      id: 'destPosition',
      header: 'Destination Position',
      enableSorting: false,
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
    },
    {
      id: 'action',
      header: 'Action',
      enableSorting: false,
    },
  ], [])

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: (val) => {
      setGlobalFilter(val)
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _colId, filterValue) => {
      const q = filterValue.toLowerCase()
      const emp = row.original
      return (
        emp.fullname?.toLowerCase().includes(q) ||
        emp.branch?.branch_name?.toLowerCase().includes(q) ||
        emp.position?.title?.toLowerCase().includes(q)
      )
    },
  })

  // Handle modification
  const handleModify = (employeeId, field, value) => {
    const employee = employeesData.find(e => e.id === employeeId)
    if (!employee) return

    setModifications(prev => {
      const current = prev[employeeId] || {
        to_branch_id: employee.branch_id,
        to_position_id: employee.position_id,
      }

      const updated = { ...current, [field]: parseInt(value) }

      if (updated.to_branch_id === employee.branch_id &&
          updated.to_position_id === employee.position_id) {
        const newMods = { ...prev }
        delete newMods[employeeId]
        return newMods
      }

      return { ...prev, [employeeId]: updated }
    })
  }

  const clearModification = (employeeId) => {
    setModifications(prev => {
      const newMods = { ...prev }
      delete newMods[employeeId]
      return newMods
    })
  }

  const clearAll = () => {
    setModifications({})
    setRemarks('')
  }

  const resetAll = () => {
    setTransitionMode(null)
    clearAll()
    setGlobalFilter('')
    setBranchFilter('')
    setShowModifiedOnly(false)
    setSorting([])
    setPagination({ pageIndex: 0, pageSize: 10 })
  }

  const handleSubmit = () => {
    const transitions = Object.entries(modifications).map(([employeeId, mod]) => ({
      employee_id: parseInt(employeeId),
      to_branch_id: mod.to_branch_id,
      to_position_id: mod.to_position_id,
    }))

    const exchangeNote = transitionMode === 'branch' && exchanges.length > 0
      ? `<p class="text-sm text-purple-700 mt-1">${exchanges.length} exchange${exchanges.length !== 1 ? 's' : ''} detected (swap${exchanges.length !== 1 ? 's' : ''} will occur automatically)</p>`
      : ''

    Swal.fire({
      icon: 'question',
      title: 'Confirm Transition',
      html: `<p>You are about to transition <strong>${modifiedCount} employee${modifiedCount !== 1 ? 's' : ''}</strong>.</p>${exchangeNote}<p class="text-sm text-slate-500 mt-2">This action cannot be undone.</p>`,
      showCancelButton: true,
      confirmButtonColor: transitionMode === 'branch' ? '#0d9488' : '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Execute',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        mutation.mutate({
          transitions,
          remarks: remarks || undefined,
        })
      }
    })
  }

  const modifiedCount = Object.keys(modifications).length
  const hasFilters = globalFilter || branchFilter || showModifiedOnly

  const themeColor = transitionMode === 'branch' ? 'teal' : 'blue'
  const ThemeIcon = transitionMode === 'branch' ? Building2 : UserCog

  // Sort indicator helper
  const SortIcon = ({ column }) => {
    if (!column.getCanSort()) return null
    const sorted = column.getIsSorted()
    return (
      <span className="ml-1 text-slate-400">
        {sorted === 'asc' ? (
          <ChevronUp className="w-3.5 h-3.5 inline" />
        ) : sorted === 'desc' ? (
          <ChevronDown className="w-3.5 h-3.5 inline" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 inline opacity-0 group-hover:opacity-50" />
        )}
      </span>
    )
  }

  // ── Mode selection screen ───────────────────────────────────────────────────
  if (!transitionMode) {
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
            {/* Branch Transition */}
            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTransitionMode('branch')}
              className="relative group bg-white rounded-3xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-2xl p-8 text-left transition-all"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Branch Transition</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    For workstation-based rotations with automatic exchange detection
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'Exchange Detection', desc: 'Automatically suggests swaps when positions are occupied' },
                  { label: 'Circular Rotations', desc: 'Supports 3-way, 4-way, and complex rotation chains' },
                  { label: 'Assets Stay Put', desc: 'Equipment remains at workstations during rotation' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{item.label}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="inline-flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            {/* Employee Transition */}
            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTransitionMode('employee')}
              className="relative group bg-white rounded-3xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl p-8 text-left transition-all"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <UserCog className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Employee Transition</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    For flexible individual moves without restrictions
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'No Restrictions', desc: 'Move employees freely without exchange validation' },
                  { label: 'Quick Reassignments', desc: 'Perfect for promotions, transfers, and role changes' },
                  { label: 'Assets Stay Put', desc: 'Equipment remains at original workstations' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{item.label}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main transition screen ──────────────────────────────────────────────────
  const paginatedRows = table.getRowModel().rows
  const filteredTotal = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const rowStart = filteredTotal === 0 ? 0 : pageIndex * pageSize + 1
  const rowEnd = Math.min((pageIndex + 1) * pageSize, filteredTotal)

  return (
    <div>
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <button
                onClick={resetAll}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mt-1 sm:mt-0"
                title="Change mode"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow flex-shrink-0 ${
                  transitionMode === 'branch'
                    ? 'bg-gradient-to-br from-teal-500 to-teal-600'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  <ThemeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                    {transitionMode === 'branch' ? 'Branch Transition' : 'Employee Transition'}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 max-w-[200px] sm:max-w-none">
                    {transitionMode === 'branch'
                      ? 'Modify employees below, exchanges detected automatically'
                      : 'Modify employees freely without restrictions'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap ml-12 sm:ml-0">
              <div className="text-sm w-full sm:w-auto mb-2 sm:mb-0">
                <span className={`font-bold text-lg ${transitionMode === 'branch' ? 'text-teal-600' : 'text-blue-600'}`}>{modifiedCount}</span>
                <span className="text-slate-600 ml-1">modified</span>
                {transitionMode === 'branch' && exchanges.length > 0 && (
                  <span className="inline-block">
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="font-bold text-purple-600 text-lg">{exchanges.length}</span>
                    <span className="text-slate-600 ml-1">exchange{exchanges.length !== 1 ? 's' : ''}</span>
                  </span>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={clearAll}
                  disabled={modifiedCount === 0}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  <RefreshCw className="w-4 h-4 inline mr-1.5" />
                  Clear
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={modifiedCount === 0 || mutation.isPending}
                  className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all whitespace-nowrap ${
                    transitionMode === 'branch' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Save className="w-4 h-4 inline mr-1.5" />
                  {mutation.isPending ? 'Processing...' : `Execute`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${
            transitionMode === 'branch'
              ? 'from-teal-50 via-teal-50/50 to-blue-50'
              : 'from-blue-50 via-blue-50/50 to-indigo-50'
          } border ${transitionMode === 'branch' ? 'border-teal-200' : 'border-blue-200'} rounded-xl p-4`}
        >
          <div className="flex items-start gap-3">
            <Info className={`w-5 h-5 ${transitionMode === 'branch' ? 'text-teal-600' : 'text-blue-600'} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${transitionMode === 'branch' ? 'text-teal-900' : 'text-blue-900'} mb-1`}>
                {transitionMode === 'branch' ? 'How Exchange Detection Works' : 'How Employee Transition Works'}
              </p>
              <p className={`text-sm ${transitionMode === 'branch' ? 'text-teal-800' : 'text-blue-800'}`}>
                {transitionMode === 'branch' ? (
                  <>
                    Change the <strong>Destination Branch</strong> or <strong>Destination Position</strong> for any employee.
                    When multiple employees swap positions, they'll be <strong className="text-purple-700">automatically detected as exchanges</strong> and marked with purple badges.
                    All assets remain at their workstations.
                  </>
                ) : (
                  <>
                    Change the <strong>Destination Branch</strong> or <strong>Destination Position</strong> for any employee.
                    No validation or exchange requirements - perfect for promotions, transfers, or reassignments.
                    All assets remain at their original workstations.
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Exchange Summary Panel */}
        <AnimatePresence>
          {transitionMode === 'branch' && exchanges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-purple-50 border border-purple-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setShowExchangePanel(p => !p)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-purple-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">
                    {exchanges.length} Exchange{exchanges.length !== 1 ? 's' : ''} Detected
                  </span>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    {exchanges.reduce((acc, ex) => acc + ex.employees.length, 0)} employees involved
                  </span>
                </div>
                {showExchangePanel
                  ? <ChevronUp className="w-4 h-4 text-purple-500" />
                  : <ChevronDown className="w-4 h-4 text-purple-500" />}
              </button>

              <AnimatePresence>
                {showExchangePanel && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 space-y-3">
                      {exchanges.map((exchange, i) => (
                        <div key={i} className="bg-white rounded-lg border border-purple-200 px-4 py-3">
                          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
                            {exchange.type}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {exchange.employees.map((empId, j) => {
                              const emp = employeesData.find(e => e.id === empId)
                              const mod = modifications[empId]
                              const destBranch = branches.find(b => b.id === mod?.to_branch_id)
                              const destPosition = positions.find(p => p.id === mod?.to_position_id)
                              return (
                                <div key={empId} className="flex items-center gap-2">
                                  <div className="text-center">
                                    <div className="text-sm font-medium text-slate-900">{emp?.fullname}</div>
                                    <div className="text-xs text-purple-600">
                                      → {destBranch?.branch_name ?? '?'}{destPosition && ` / ${destPosition.title}`}
                                    </div>
                                  </div>
                                  {j < exchange.employees.length - 1 && (
                                    <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                  )}
                                </div>
                              )
                            })}
                            <ArrowRight className="w-4 h-4 text-purple-300 flex-shrink-0" />
                            <div className="text-xs text-purple-400 italic">back to start</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters + Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className={`w-5 h-5 ${transitionMode === 'branch' ? 'text-teal-600' : 'text-blue-600'}`} />
              <span className="text-sm font-semibold text-slate-900">Filters</span>
            </div>

            <div className="flex-1 flex items-center gap-3 flex-wrap">
              {/* Global Search */}
              <div className="relative flex-1 min-w-[240px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  value={globalFilter ?? ''}
                  onChange={(e) => table.setGlobalFilter(e.target.value)}
                  placeholder="Search employees, branches, positions..."
                  className={`w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent ${
                    transitionMode === 'branch' ? 'focus:ring-teal-500' : 'focus:ring-blue-500'
                  }`}
                />
              </div>

              {/* Branch Filter */}
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value)
                  table.setPageIndex(0)
                }}
                className={`px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent ${
                  transitionMode === 'branch' ? 'focus:ring-teal-500' : 'focus:ring-blue-500'
                }`}
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                ))}
              </select>

              {/* Show Modified Only */}
              <button
                onClick={() => {
                  setShowModifiedOnly(!showModifiedOnly)
                  table.setPageIndex(0)
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  showModifiedOnly
                    ? transitionMode === 'branch'
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {showModifiedOnly ? 'Show All' : 'Modified Only'}
              </button>

              {hasFilters && (
                <button
                  onClick={() => {
                    table.setGlobalFilter('')
                    setBranchFilter('')
                    setShowModifiedOnly(false)
                  }}
                  className="text-sm text-slate-600 hover:text-slate-900 underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{rowStart}–{rowEnd}</span> of{' '}
              <span className="font-semibold text-slate-900">{filteredTotal}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {table.getHeaderGroups()[0].headers.map(header => (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider group ${
                        header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-slate-100 transition-colors' : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="inline-flex items-center gap-1">
                        {header.id === 'destBranch' && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                        {header.id === 'destPosition' && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                        {{
                          employee: 'Employee',
                          currentBranch: 'Current Branch',
                          currentPosition: 'Current Position',
                          destBranch: 'Destination Branch',
                          destPosition: 'Destination Position',
                          status: 'Status',
                          action: 'Action',
                        }[header.id]}
                        <SortIcon column={header.column} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingEmployees ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-500">
                      Loading employees...
                    </td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-900">No employees found</p>
                      <p className="text-xs text-slate-600 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map(row => {
                    const employee = row.original
                    const isModified = !!modifications[employee.id]
                    const mod = modifications[employee.id]
                    const isInExchange = employeesInExchanges.has(employee.id)
                    const currentBranchId = mod?.to_branch_id ?? employee.branch_id
                    const currentPositionId = mod?.to_position_id ?? employee.position_id

                    return (
                      <motion.tr
                        key={employee.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-50 transition-colors ${
                          isModified
                            ? isInExchange
                              ? 'bg-purple-50/50'
                              : transitionMode === 'branch'
                              ? 'bg-teal-50/30'
                              : 'bg-blue-50/30'
                            : ''
                        }`}
                      >
                        {/* Employee */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
                              isModified
                                ? isInExchange
                                  ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                                  : transitionMode === 'branch'
                                  ? 'bg-gradient-to-br from-teal-500 to-teal-600'
                                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                : 'bg-gradient-to-br from-slate-400 to-slate-500'
                            }`}>
                              {employee.fullname?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{employee.fullname}</div>
                              {employee.assigned_assets?.length > 0 && (
                                <div className="text-xs text-slate-500">
                                  {employee.assigned_assets.length} asset{employee.assigned_assets.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Current Branch */}
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {employee.branch?.branch_name || '-'}
                        </td>

                        {/* Current Position */}
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {employee.position?.title || '-'}
                        </td>

                        {/* Destination Branch */}
                        <td className="px-6 py-4">
                          <select
                            value={currentBranchId}
                            onChange={(e) => handleModify(employee.id, 'to_branch_id', e.target.value)}
                            disabled={loadingBranches}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                              isModified && currentBranchId !== employee.branch_id
                                ? transitionMode === 'branch'
                                  ? 'border-teal-300 bg-teal-50 focus:ring-teal-500 font-medium'
                                  : 'border-blue-300 bg-blue-50 focus:ring-blue-500 font-medium'
                                : 'border-slate-300 bg-white focus:ring-slate-400'
                            }`}
                          >
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Destination Position */}
                        <td className="px-6 py-4">
                          <select
                            value={currentPositionId}
                            onChange={(e) => handleModify(employee.id, 'to_position_id', e.target.value)}
                            disabled={loadingPositions}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                              isModified && currentPositionId !== employee.position_id
                                ? transitionMode === 'branch'
                                  ? 'border-teal-300 bg-teal-50 focus:ring-teal-500 font-medium'
                                  : 'border-blue-300 bg-blue-50 focus:ring-blue-500 font-medium'
                                : 'border-slate-300 bg-white focus:ring-slate-400'
                            }`}
                          >
                            {positions.map(position => (
                              <option key={position.id} value={position.id}>{position.title}</option>
                            ))}
                          </select>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          {isModified ? (
                            isInExchange ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                                <Shuffle className="w-3 h-3" />
                                Exchange
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                                transitionMode === 'branch'
                                  ? 'text-teal-700 bg-teal-100'
                                  : 'text-blue-700 bg-blue-100'
                              }`}>
                                <AlertCircle className="w-3 h-3" />
                                Modified
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
                              <Check className="w-3 h-3" />
                              Same
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-center">
                          {isModified && (
                            <button
                              onClick={() => clearModification(employee.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Undo changes"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden divide-y divide-slate-100 bg-slate-50/50">
            {loadingEmployees ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Loading employees...
              </div>
            ) : paginatedRows.length === 0 ? (
              <div className="px-6 py-12 text-center bg-white">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-900">No employees found</p>
                <p className="text-xs text-slate-600 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              paginatedRows.map(row => {
                const employee = row.original
                const isModified = !!modifications[employee.id]
                const mod = modifications[employee.id]
                const isInExchange = employeesInExchanges.has(employee.id)
                const currentBranchId = mod?.to_branch_id ?? employee.branch_id
                const currentPositionId = mod?.to_position_id ?? employee.position_id

                return (
                  <motion.div
                    key={employee.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 bg-white transition-colors ${
                      isModified
                        ? isInExchange
                          ? 'bg-purple-50/30'
                          : transitionMode === 'branch'
                          ? 'bg-teal-50/20'
                          : 'bg-blue-50/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm ${
                          isModified
                            ? isInExchange
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                              : transitionMode === 'branch'
                              ? 'bg-gradient-to-br from-teal-500 to-teal-600'
                              : 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }`}>
                          {employee.fullname?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{employee.fullname}</div>
                          <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">
                            {employee.branch?.branch_name || 'No Branch'} • {employee.position?.title || 'No Position'}
                          </div>
                          {employee.assigned_assets?.length > 0 && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {employee.assigned_assets.length} asset{employee.assigned_assets.length !== 1 ? 's' : ''} assigned
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {isModified ? (
                          isInExchange ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-purple-700 bg-purple-100 rounded-full whitespace-nowrap">
                              <Shuffle className="w-3 h-3" />
                              Exchange
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full whitespace-nowrap ${
                              transitionMode === 'branch'
                                ? 'text-teal-700 bg-teal-100'
                                : 'text-blue-700 bg-blue-100'
                            }`}>
                              <AlertCircle className="w-3 h-3" />
                              Modified
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-600 bg-slate-100 rounded-full whitespace-nowrap">
                            <Check className="w-3 h-3" />
                            Same
                          </span>
                        )}
                        {isModified && (
                          <button
                            onClick={() => clearModification(employee.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded bg-white border border-red-100 transition-colors"
                            title="Undo changes"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50/80 rounded-lg border border-slate-200 p-3 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          Dest. Branch
                        </label>
                        <select
                          value={currentBranchId}
                          onChange={(e) => handleModify(employee.id, 'to_branch_id', e.target.value)}
                          disabled={loadingBranches}
                          className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:border-transparent transition-colors ${
                            isModified && currentBranchId !== employee.branch_id
                              ? transitionMode === 'branch'
                                ? 'border-teal-300 bg-teal-50 focus:ring-teal-500 font-medium'
                                : 'border-blue-300 bg-blue-50 focus:ring-blue-500 font-medium'
                              : 'border-slate-300 bg-white focus:ring-slate-400'
                          }`}
                        >
                          {branches.map(branch => (
                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          Dest. Position
                        </label>
                        <select
                          value={currentPositionId}
                          onChange={(e) => handleModify(employee.id, 'to_position_id', e.target.value)}
                          disabled={loadingPositions}
                          className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:border-transparent transition-colors ${
                            isModified && currentPositionId !== employee.position_id
                              ? transitionMode === 'branch'
                                ? 'border-teal-300 bg-teal-50 focus:ring-teal-500 font-medium'
                                : 'border-blue-300 bg-blue-50 focus:ring-blue-500 font-medium'
                              : 'border-slate-300 bg-white focus:ring-slate-400'
                          }`}
                        >
                          {positions.map(position => (
                            <option key={position.id} value={position.id}>{position.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Pagination Footer (inside the table card) */}
          {!loadingEmployees && filteredTotal > 0 && (
            <div className="border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
              <div className="text-sm text-slate-700">
                Showing <span className="font-semibold">{rowStart}</span> to{' '}
                <span className="font-semibold">{rowEnd}</span> of{' '}
                <span className="font-semibold">{filteredTotal}</span> entries
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Page size */}
                <select
                  value={pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value))
                    table.setPageIndex(0)
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[10, 20, 30, 50, 100].map(size => (
                    <option key={size} value={size}>{size} per page</option>
                  ))}
                </select>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First page"
                  >
                    <ChevronsLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-slate-700">
                    Page {pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last page"
                  >
                    <ChevronsRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Remarks */}
        <AnimatePresence>
          {modifiedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
            >
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Remarks <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add notes about this transition batch (e.g., 'Q1 2026 Department Restructuring')"
                rows={3}
                className={`w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                  transitionMode === 'branch' ? 'focus:ring-teal-500' : 'focus:ring-blue-500'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default EmployeeTransitionsPage
