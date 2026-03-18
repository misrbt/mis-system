import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize2, Filter, Search } from 'lucide-react'
import { useDragAndDrop } from '../../../hooks/useDragAndDrop'
import { BranchColumn } from './BranchColumn'
import { EmployeeChip } from './EmployeeChip'
import { ConnectionLines } from './ConnectionLines'
import { getWorkstation } from '../../../hooks/useTransitionState'

export function VisualGridView({
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
  onModify,
  onClear,
  onOpenCreateWorkstation,
}) {
  const [zoom, setZoom] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranches, setSelectedBranches] = useState(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const {
    activeEmployee,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop({ onModify, employeesData, workstations })

  // Filter branches
  const filteredBranches = useMemo(() => {
    if (selectedBranches.size === 0) return branches
    return branches.filter(b => selectedBranches.has(b.id))
  }, [branches, selectedBranches])

  // Group workstations by branch
  const workstationsByBranch = useMemo(() => {
    const grouped = {}
    filteredBranches.forEach(branch => {
      grouped[branch.id] = workstations.filter(ws => ws.branch_id === branch.id)
    })
    return grouped
  }, [filteredBranches, workstations])

  // Get employee's current and target workstation info
  const getEmployeeState = (employee) => {
    const mod = modifications[employee.id]
    const { ws_branch_id, ws_position_id } = getWorkstation(employee)
    const currentWorkstation = employee.workstations?.[0]

    return {
      currentBranchId: ws_branch_id,
      currentPositionId: ws_position_id,
      currentWorkstationId: currentWorkstation?.id,
      targetBranchId: mod?.to_branch_id ?? ws_branch_id,
      targetPositionId: mod?.to_position_id ?? ws_position_id,
      targetWorkstationId: mod?.to_workstation_id ?? currentWorkstation?.id,
      isModified: !!mod,
      isInExchange: employeesInExchanges.has(employee.id),
    }
  }

  // Filter employees by search
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employeesData
    const term = searchTerm.toLowerCase()
    return employeesData.filter(e =>
      e.fullname?.toLowerCase().includes(term) ||
      e.branch?.branch_name?.toLowerCase().includes(term) ||
      e.position?.title?.toLowerCase().includes(term)
    )
  }, [employeesData, searchTerm])

  // Get pending moves for connection lines
  const pendingMoves = useMemo(() => {
    return Object.entries(modifications).map(([empId, mod]) => {
      const employee = employeesData.find(e => e.id === parseInt(empId))
      if (!employee) return null

      const state = getEmployeeState(employee)
      return {
        employeeId: parseInt(empId),
        employee,
        from: {
          branchId: state.currentBranchId,
          workstationId: state.currentWorkstationId,
        },
        to: {
          branchId: state.targetBranchId,
          workstationId: state.targetWorkstationId,
        },
        isInExchange: state.isInExchange,
      }
    }).filter(Boolean)
  }, [modifications, employeesData])

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 1.5))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5))
  const handleResetZoom = () => setZoom(1)

  const toggleBranchFilter = (branchId) => {
    setSelectedBranches(prev => {
      const next = new Set(prev)
      if (next.has(branchId)) {
        next.delete(branchId)
      } else {
        next.add(branchId)
      }
      return next
    })
  }

  const isLoading = loadingEmployees || loadingBranches || loadingPositions || loadingWorkstations

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-slate-200 rounded w-48 mx-auto" />
        </div>
      </div>
    )
  }

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className={`w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-${colorClass}-500`}
            />
          </div>

          {/* Branch filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500" />
            {branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => toggleBranchFilter(branch.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedBranches.size === 0 || selectedBranches.has(branch.id)
                    ? `bg-${colorClass}-100 text-${colorClass}-700`
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {branch.branch_name}
              </button>
            ))}
            {selectedBranches.size > 0 && (
              <button
                onClick={() => setSelectedBranches(new Set())}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Show all
              </button>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded hover:bg-white transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4 text-slate-600" />
              </button>
              <span className="px-2 text-xs font-medium text-slate-600 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded hover:bg-white transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 rounded hover:bg-white transition-colors"
                title="Reset zoom"
              >
                <Maximize2 className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Grid Canvas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div
          className="overflow-auto p-6"
          style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '500px' }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div
              className="relative"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              {/* Connection lines for pending moves */}
              <ConnectionLines
                pendingMoves={pendingMoves}
                transitionMode={transitionMode}
              />

              {/* Branch columns */}
              <div className="flex gap-6">
                {filteredBranches.map(branch => (
                  <BranchColumn
                    key={branch.id}
                    branch={branch}
                    workstations={workstationsByBranch[branch.id] || []}
                    employees={filteredEmployees.filter(e => {
                      const state = getEmployeeState(e)
                      return state.currentBranchId === branch.id || state.targetBranchId === branch.id
                    })}
                    modifications={modifications}
                    employeesInExchanges={employeesInExchanges}
                    transitionMode={transitionMode}
                    positions={positions}
                    overId={overId}
                    onClear={onClear}
                    getEmployeeState={getEmployeeState}
                    onOpenCreateWorkstation={onOpenCreateWorkstation}
                  />
                ))}

                {/* Unassigned Employees Pool */}
                {(() => {
                  const unassignedEmployees = filteredEmployees.filter(e => {
                    const state = getEmployeeState(e)
                    // Only show employees who have NO branch (truly unassigned)
                    // Employees with a branch but no workstation appear in their branch column's unassigned section
                    return !state.currentWorkstationId && !state.targetWorkstationId && !state.currentBranchId
                  })

                  if (unassignedEmployees.length === 0) return null

                  return (
                    <div className="min-w-[280px] max-w-[320px] flex-shrink-0 bg-amber-50 rounded-xl border-2 border-amber-200">
                      <div className="px-4 py-3 border-b border-amber-200 bg-gradient-to-r from-amber-400 to-amber-500 rounded-t-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <h3 className="font-semibold text-white">Unassigned</h3>
                        </div>
                        <p className="text-xs text-white/80 mt-1">
                          {unassignedEmployees.length} employee{unassignedEmployees.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="p-3">
                        <div className="text-xs text-amber-700 mb-3 bg-amber-100 rounded px-2 py-1.5">
                          Drag to assign to a workstation
                        </div>
                        <div className="space-y-2">
                          {unassignedEmployees.map(emp => (
                            <EmployeeChip
                              key={emp.id}
                              employee={emp}
                              isModified={!!modifications[emp.id]}
                              isInExchange={employeesInExchanges.has(emp.id)}
                              transitionMode={transitionMode}
                              onClear={() => onClear(emp.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Drag overlay */}
            <DragOverlay>
              {activeEmployee && (
                <EmployeeChip
                  employee={activeEmployee}
                  isModified={!!modifications[activeEmployee.id]}
                  isInExchange={employeesInExchanges.has(activeEmployee.id)}
                  transitionMode={transitionMode}
                  isDragging
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-6 flex-wrap text-xs">
          <span className="font-medium text-slate-700">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <span className="text-slate-600">No changes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${colorClass}-500`} />
            <span className="text-slate-600">Pending move</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-600">Part of exchange</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-amber-400" style={{ marginTop: 1 }} />
            <span className="text-slate-600">Pending transition</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisualGridView
