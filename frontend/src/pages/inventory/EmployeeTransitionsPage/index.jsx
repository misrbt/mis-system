import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

// Services
import {
  fetchEmployeesRequest,
  branchTransitionRequest,
  employeeTransitionRequest,
} from '../../../services/employeeService'
import { fetchBranchesRequest } from '../../../services/branchService'
import { fetchPositionsRequest } from '../../../services/positionService'

// Hooks
import { useTransitionState } from './hooks/useTransitionState'
import { useExchangeDetection } from './hooks/useExchangeDetection'
import { useEmployeeTable } from './hooks/useEmployeeTable'

// Components
import { ModeSelectionScreen } from './components/ModeSelectionScreen'
import { StickyHeader } from './components/StickyHeader'
import { InfoBanner } from './components/InfoBanner'
import { ExchangeSummaryPanel } from './components/ExchangeSummaryPanel'
import { FiltersBar } from './components/FiltersBar'
import { EmployeeTable } from './components/EmployeeTable'
import { RemarksSection } from './components/RemarksSection'

// Constants
import { TRANSITION_MODES } from './constants'

function EmployeeTransitionsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Custom hooks for state management
  const transitionState = useTransitionState()
  const {
    transitionMode,
    setTransitionMode,
    modifications,
    handleModify,
    clearModification,
    clearAll,
    resetAll,
    modifiedCount,
    remarks,
    setRemarks,
    showExchangePanel,
    setShowExchangePanel,
    globalFilter,
    setGlobalFilter,
    branchFilter,
    setBranchFilter,
    showModifiedOnly,
    setShowModifiedOnly,
    hasFilters,
    sorting,
    setSorting,
    pagination,
    setPagination,
  } = transitionState

  // Data queries
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

  // Exchange detection for branch mode
  const { exchanges, employeesInExchanges } = useExchangeDetection(
    transitionMode,
    modifications,
    employeesData
  )

  // Table configuration
  const table = useEmployeeTable({
    employeesData,
    branchFilter,
    showModifiedOnly,
    modifications,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    pagination,
    setPagination,
  })

  // Mutation for submitting transitions
  const mutation = useMutation({
    mutationFn: (payload) => {
      if (transitionMode === TRANSITION_MODES.EMPLOYEE) {
        return employeeTransitionRequest(payload)
      }
      return branchTransitionRequest(payload)
    },
    onSuccess: (response) => {
      const data = response.data?.data || {}
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })

      const employeeCount = data.employees?.length || 0
      const assetsReassigned = data.assets_reassigned || 0

      let html = `<p class="text-lg font-semibold mb-2">${employeeCount} employee${employeeCount !== 1 ? 's' : ''} transitioned successfully</p>`

      if (assetsReassigned > 0) {
        html += `<p class="text-sm text-emerald-600 font-medium mt-2">✓ ${assetsReassigned} workstation asset${assetsReassigned !== 1 ? 's' : ''} reassigned</p>`
        html += `<p class="text-xs text-slate-500 mt-1">Desktop PCs, monitors, and fixed equipment have been re-routed to the correct workstations</p>`
      } else {
        html += `<p class="text-sm text-slate-500 mt-1">No workstation assets were reassigned</p>`
        html += `<p class="text-xs text-slate-400 mt-1">Portable assets (laptops, etc.) remain with their employees</p>`
      }

      html += `<p class="text-xs text-slate-400 mt-2">Portable assets (laptops) remain with their owners</p>`

      Swal.fire({
        icon: 'success',
        title: 'Transition Complete',
        html: html,
        confirmButtonColor: transitionMode === TRANSITION_MODES.BRANCH ? '#0d9488' : '#2563eb',
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

  // Handle submit
  const handleSubmit = () => {
    const transitions = Object.entries(modifications).map(([employeeId, mod]) => ({
      employee_id: parseInt(employeeId),
      to_branch_id: mod.to_branch_id,
      to_position_id: mod.to_position_id,
    }))

    const exchangeNote =
      transitionMode === TRANSITION_MODES.BRANCH && exchanges.length > 0
        ? `<p class="text-sm text-purple-700 mt-1">${exchanges.length} exchange${exchanges.length !== 1 ? 's' : ''} detected (swap${exchanges.length !== 1 ? 's' : ''} will occur automatically)</p>`
        : ''

    Swal.fire({
      icon: 'question',
      title: 'Confirm Transition',
      html: `<p>You are about to transition <strong>${modifiedCount} employee${modifiedCount !== 1 ? 's' : ''}</strong>.</p>${exchangeNote}<p class="text-sm text-slate-500 mt-2">This action cannot be undone.</p>`,
      showCancelButton: true,
      confirmButtonColor: transitionMode === TRANSITION_MODES.BRANCH ? '#0d9488' : '#2563eb',
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

  // Mode selection screen
  if (!transitionMode) {
    return <ModeSelectionScreen onSelectMode={setTransitionMode} />
  }

  // Main transition screen
  const filteredTotal = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const rowStart = filteredTotal === 0 ? 0 : pageIndex * pageSize + 1
  const rowEnd = Math.min((pageIndex + 1) * pageSize, filteredTotal)

  return (
    <div>
      <StickyHeader
        transitionMode={transitionMode}
        modifiedCount={modifiedCount}
        exchanges={exchanges}
        onReset={resetAll}
        onClear={clearAll}
        onSubmit={handleSubmit}
        isPending={mutation.isPending}
      />

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <InfoBanner transitionMode={transitionMode} />

        <AnimatePresence>
          {transitionMode === TRANSITION_MODES.BRANCH && (
            <ExchangeSummaryPanel
              exchanges={exchanges}
              showPanel={showExchangePanel}
              onTogglePanel={() => setShowExchangePanel(p => !p)}
              employeesData={employeesData}
              modifications={modifications}
              branches={branches}
              positions={positions}
            />
          )}
        </AnimatePresence>

        <FiltersBar
          transitionMode={transitionMode}
          globalFilter={globalFilter}
          branchFilter={branchFilter}
          showModifiedOnly={showModifiedOnly}
          branches={branches}
          hasFilters={hasFilters}
          filteredTotal={filteredTotal}
          rowStart={rowStart}
          rowEnd={rowEnd}
          onGlobalFilterChange={table.setGlobalFilter}
          onBranchFilterChange={setBranchFilter}
          onToggleModifiedOnly={() => setShowModifiedOnly(!showModifiedOnly)}
          onClearFilters={() => {
            table.setGlobalFilter('')
            setBranchFilter('')
            setShowModifiedOnly(false)
          }}
          onPageReset={() => table.setPageIndex(0)}
        />

        <EmployeeTable
          table={table}
          loadingEmployees={loadingEmployees}
          modifications={modifications}
          employeesInExchanges={employeesInExchanges}
          transitionMode={transitionMode}
          branches={branches}
          positions={positions}
          loadingBranches={loadingBranches}
          loadingPositions={loadingPositions}
          onModify={handleModify}
          onClear={clearModification}
        />

        <RemarksSection
          modifiedCount={modifiedCount}
          remarks={remarks}
          setRemarks={setRemarks}
          transitionMode={transitionMode}
        />
      </div>
    </div>
  )
}

export default EmployeeTransitionsPage
