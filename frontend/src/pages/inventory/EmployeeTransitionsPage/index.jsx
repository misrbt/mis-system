import { useState } from 'react'
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
import { useChainBuilder } from './hooks/useChainBuilder'

// Contexts
import { TransitionViewProvider, useTransitionView } from './contexts/TransitionViewContext'

// Components
import { ModeSelectionScreen } from './components/ModeSelectionScreen'
import { StickyHeader } from './components/StickyHeader'
import { InfoBanner } from './components/InfoBanner'
import { ExchangeSummaryPanel } from './components/ExchangeSummaryPanel'
import { PendingTransitionsSummary } from './components/PendingTransitionsSummary'
import { FiltersBar } from './components/FiltersBar'
import { RemarksSection } from './components/RemarksSection'
import { ViewSwitcher } from './components/ViewSwitcher'
import { ChainBuilder } from './components/ChainBuilder'
import { CreateWorkstationModal } from './components/CreateWorkstationModal'

// Views
import { EnhancedTableView } from './components/views/EnhancedTableView'
import { VisualGridView } from './components/views/VisualGridView'
import { FlowBuilderView } from './components/views/FlowBuilderView'
import { SplitPanelView } from './components/views/SplitPanelView'

// Constants
import { TRANSITION_MODES, VIEW_TYPES } from './constants'

function EmployeeTransitionsPageContent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentView } = useTransitionView()
  const [showCreateWorkstationModal, setShowCreateWorkstationModal] = useState(false)
  const [selectedBranchForWorkstation, setSelectedBranchForWorkstation] = useState(null)

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
    showPendingPanel,
    setShowPendingPanel,
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

  const { data: workstations = [], isLoading: loadingWorkstations } = useQuery({
    queryKey: ['workstations'],
    queryFn: async () => {
      const { fetchWorkstationsRequest } = await import('../../../services/workstationService')
      const response = await fetchWorkstationsRequest()
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

  // Chain builder for multi-employee swaps
  const chainBuilder = useChainBuilder({
    employeesData,
    workstations,
    modifications,
    onModify: handleModify,
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
      queryClient.invalidateQueries({ queryKey: ['workstations'] })

      const employeeCount = data.employees?.length || 0
      const assetsReassigned = data.assets_reassigned || 0

      let html = employeeCount > 1
        ? `<div class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3 mb-3">
             <p class="text-sm font-semibold text-emerald-900 mb-1">Batch Operation Complete</p>
             <p class="text-xs text-emerald-800">All ${employeeCount} employees were transitioned successfully</p>
           </div>`
        : ''

      html += `<p class="text-lg font-semibold mb-2">${employeeCount} employee${employeeCount !== 1 ? 's' : ''} transitioned successfully</p>`

      if (assetsReassigned > 0) {
        html += `<p class="text-sm text-emerald-600 font-medium mt-2">${assetsReassigned} workstation asset${assetsReassigned !== 1 ? 's' : ''} reassigned</p>`
        html += `<p class="text-xs text-slate-500 mt-1">Desktop PCs, monitors, and fixed equipment have been re-routed to the correct workstations</p>`
      } else {
        html += `<p class="text-sm text-slate-500 mt-1">No workstation assets were reassigned</p>`
        html += `<p class="text-xs text-slate-400 mt-1">Portable assets (laptops, etc.) remain with their employees</p>`
      }

      html += `<p class="text-xs text-slate-400 mt-2">Portable assets (laptops) remain with their owners</p>`

      Swal.fire({
        icon: 'success',
        title: employeeCount > 1 ? 'Batch Transition Complete' : 'Transition Complete',
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
      to_workstation_id: mod.to_workstation_id || undefined,
    }))

    const exchangeNote =
      transitionMode === TRANSITION_MODES.BRANCH && exchanges.length > 0
        ? `<p class="text-sm text-purple-700 mt-1">${exchanges.length} exchange${exchanges.length !== 1 ? 's' : ''} detected (swap${exchanges.length !== 1 ? 's' : ''} will occur automatically)</p>`
        : ''

    const batchNote = modifiedCount > 1
      ? `<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 mb-2">
           <p class="text-sm font-semibold text-amber-900 mb-1">Batch Operation</p>
           <p class="text-xs text-amber-800">All ${modifiedCount} employee transitions will be processed together in a single operation.</p>
         </div>`
      : ''

    Swal.fire({
      icon: 'question',
      title: modifiedCount > 1 ? 'Confirm Batch Transition' : 'Confirm Transition',
      html: `<p class="text-lg font-semibold">You are about to transition <strong class="text-${transitionMode === TRANSITION_MODES.BRANCH ? 'teal' : 'blue'}-600">${modifiedCount} employee${modifiedCount !== 1 ? 's' : ''}</strong>.</p>${exchangeNote}${batchNote}<p class="text-sm text-slate-500 mt-2">This action cannot be undone.</p>`,
      showCancelButton: true,
      confirmButtonColor: transitionMode === TRANSITION_MODES.BRANCH ? '#0d9488' : '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: modifiedCount > 1 ? 'Yes, Execute All' : 'Yes, Execute',
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

  // Props shared across all views
  const sharedViewProps = {
    employeesData,
    modifications,
    employeesInExchanges,
    transitionMode,
    branches,
    positions,
    workstations,
    loadingEmployees,
    loadingBranches,
    loadingPositions,
    loadingWorkstations,
    onModify: handleModify,
    onClear: clearModification,
    onOpenCreateWorkstation: (branchId = null) => {
      setSelectedBranchForWorkstation(branchId)
      setShowCreateWorkstationModal(true)
    },
  }

  // Render the appropriate view
  const renderView = () => {
    switch (currentView) {
      case VIEW_TYPES.VISUAL_GRID:
        return <VisualGridView {...sharedViewProps} />
      case VIEW_TYPES.FLOW_BUILDER:
        return (
          <FlowBuilderView
            {...sharedViewProps}
            onClearAll={clearAll}
          />
        )
      case VIEW_TYPES.SPLIT_PANEL:
        return <SplitPanelView {...sharedViewProps} />
      case VIEW_TYPES.ENHANCED_TABLE:
      default:
        return (
          <EnhancedTableView
            {...sharedViewProps}
            table={table}
            globalFilter={globalFilter}
            branchFilter={branchFilter}
            showModifiedOnly={showModifiedOnly}
            hasFilters={hasFilters}
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
        )
    }
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
        onOpenChainBuilder={() => chainBuilder.setIsOpen(true)}
      />

      {/* Chain Builder Modal */}
      <ChainBuilder
        isOpen={chainBuilder.isOpen}
        onClose={() => chainBuilder.setIsOpen(false)}
        chainNodes={chainBuilder.chainNodes}
        chainDetails={chainBuilder.chainDetails}
        validation={chainBuilder.validation}
        suggestedEmployees={chainBuilder.suggestedEmployees}
        employeesData={employeesData}
        transitionMode={transitionMode}
        onAddToChain={chainBuilder.addToChain}
        onRemoveFromChain={chainBuilder.removeFromChain}
        onReorderChain={chainBuilder.reorderChain}
        onClearChain={chainBuilder.clearChain}
        onApplyChain={chainBuilder.applyChain}
      />

      {/* Create Workstation Modal */}
      <CreateWorkstationModal
        isOpen={showCreateWorkstationModal}
        onClose={() => {
          setShowCreateWorkstationModal(false)
          setSelectedBranchForWorkstation(null)
        }}
        branches={branches}
        positions={positions}
        defaultBranchId={selectedBranchForWorkstation}
        onSuccess={(newWorkstation) => {
          // Workstations will auto-refresh via query invalidation
          console.log('Created workstation:', newWorkstation)
          setSelectedBranchForWorkstation(null)
        }}
      />

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <InfoBanner transitionMode={transitionMode} />

        {/* View Switcher */}
        <ViewSwitcher transitionMode={transitionMode} />

        <PendingTransitionsSummary
          modifications={modifications}
          employeesData={employeesData}
          branches={branches}
          positions={positions}
          workstations={workstations}
          employeesInExchanges={employeesInExchanges}
          transitionMode={transitionMode}
          showPanel={showPendingPanel}
          onTogglePanel={() => setShowPendingPanel(p => !p)}
          onClearOne={clearModification}
        />

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

        {/* Render the active view */}
        {renderView()}

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

function EmployeeTransitionsPage() {
  return (
    <TransitionViewProvider>
      <EmployeeTransitionsPageContent />
    </TransitionViewProvider>
  )
}

export default EmployeeTransitionsPage
