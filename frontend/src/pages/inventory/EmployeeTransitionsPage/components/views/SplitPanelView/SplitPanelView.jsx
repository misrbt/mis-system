import { useMemo, useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, Link2Off, Eye, Plus } from 'lucide-react'
import { BeforePanel } from './BeforePanel'
import { AfterPanel } from './AfterPanel'
import { DiffIndicator } from './DiffIndicator'
import { getWorkstation } from '../../../hooks/useTransitionState'

export function SplitPanelView({
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
  const [syncScroll, setSyncScroll] = useState(true)
  const [showOnlyChanges, setShowOnlyChanges] = useState(false)
  const beforeRef = useRef(null)
  const afterRef = useRef(null)
  const scrollingRef = useRef(null)

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  // Calculate before and after states for each branch
  const branchStates = useMemo(() => {
    return branches.map(branch => {
      // Get workstations for this branch
      const branchWorkstations = workstations.filter(ws => ws.branch_id === branch.id)

      // Calculate before state (current assignments)
      const beforeState = branchWorkstations.map(ws => {
        const assignedEmployee = employeesData.find(e => {
          const currentWs = e.workstations?.[0]
          return currentWs?.id === ws.id
        })
        return {
          workstation: ws,
          employee: assignedEmployee || null,
        }
      })

      // Calculate after state (with modifications applied)
      const afterState = branchWorkstations.map(ws => {
        // Find who will be at this workstation after changes
        const futureEmployee = employeesData.find(e => {
          const mod = modifications[e.id]
          if (mod?.to_workstation_id === ws.id) {
            return true
          }
          // If no modification moves someone here, check current assignment
          // but only if the current occupant isn't being moved away
          const currentWs = e.workstations?.[0]
          if (currentWs?.id === ws.id && !mod?.to_workstation_id) {
            return true
          }
          return false
        })

        return {
          workstation: ws,
          employee: futureEmployee || null,
        }
      })

      // Find employees moving to this branch from elsewhere
      const incomingEmployees = Object.entries(modifications)
        .filter(([_, mod]) => mod.to_branch_id === branch.id)
        .map(([empId]) => employeesData.find(e => e.id === parseInt(empId)))
        .filter(Boolean)

      // Find employees leaving this branch
      const outgoingEmployees = employeesData.filter(e => {
        const { ws_branch_id } = getWorkstation(e)
        const mod = modifications[e.id]
        return ws_branch_id === branch.id && mod?.to_branch_id && mod.to_branch_id !== branch.id
      })

      const hasChanges = incomingEmployees.length > 0 || outgoingEmployees.length > 0 ||
        beforeState.some((b, i) => b.employee?.id !== afterState[i]?.employee?.id)

      return {
        branch,
        beforeState,
        afterState,
        incomingEmployees,
        outgoingEmployees,
        hasChanges,
      }
    })
  }, [branches, workstations, employeesData, modifications])

  // Filter to only changed branches if option is selected
  const displayedBranches = showOnlyChanges
    ? branchStates.filter(bs => bs.hasChanges)
    : branchStates

  // Synchronized scrolling
  useEffect(() => {
    if (!syncScroll) return

    const handleScroll = (source, target) => {
      if (scrollingRef.current === source || !target) return
      scrollingRef.current = source
      target.scrollTop = source.scrollTop
      requestAnimationFrame(() => {
        scrollingRef.current = null
      })
    }

    const beforeEl = beforeRef.current
    const afterEl = afterRef.current

    const onBeforeScroll = () => handleScroll(beforeEl, afterEl)
    const onAfterScroll = () => handleScroll(afterEl, beforeEl)

    beforeEl?.addEventListener('scroll', onBeforeScroll)
    afterEl?.addEventListener('scroll', onAfterScroll)

    return () => {
      beforeEl?.removeEventListener('scroll', onBeforeScroll)
      afterEl?.removeEventListener('scroll', onAfterScroll)
    }
  }, [syncScroll])

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

  const changedCount = branchStates.filter(bs => bs.hasChanges).length

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <DiffIndicator
              totalChanges={Object.keys(modifications).length}
              exchangeCount={employeesInExchanges.size}
              transitionMode={transitionMode}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnlyChanges(!showOnlyChanges)}
              className={`
                flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg
                transition-colors
                ${showOnlyChanges
                  ? `bg-${colorClass}-100 text-${colorClass}-700`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              <Eye className="w-4 h-4" />
              {showOnlyChanges ? 'Showing changes only' : 'Show only changes'}
            </button>

            <button
              onClick={() => setSyncScroll(!syncScroll)}
              className={`
                flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg
                transition-colors
                ${syncScroll
                  ? `bg-${colorClass}-100 text-${colorClass}-700`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {syncScroll ? (
                <Link2 className="w-4 h-4" />
              ) : (
                <Link2Off className="w-4 h-4" />
              )}
              Sync scroll
            </button>

            {/* Create Workstation Button */}
            {onOpenCreateWorkstation && (
              <button
                onClick={onOpenCreateWorkstation}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                title="Create new workstation"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Workstation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Split panels */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Before panel */}
          <div className="flex flex-col">
            <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Current State</h3>
              <p className="text-xs text-slate-500">Before transitions</p>
            </div>
            <div
              ref={beforeRef}
              className="flex-1 overflow-auto"
              style={{ maxHeight: 'calc(100vh - 450px)', minHeight: '400px' }}
            >
              <BeforePanel
                branchStates={displayedBranches}
                transitionMode={transitionMode}
                modifications={modifications}
                employeesInExchanges={employeesInExchanges}
              />
            </div>
          </div>

          {/* After panel */}
          <div className="flex flex-col">
            <div className={`px-4 py-3 bg-${colorClass}-50 border-b border-${colorClass}-100`}>
              <h3 className={`font-semibold text-${colorClass}-800`}>Proposed State</h3>
              <p className={`text-xs text-${colorClass}-600`}>After transitions</p>
            </div>
            <div
              ref={afterRef}
              className="flex-1 overflow-auto"
              style={{ maxHeight: 'calc(100vh - 450px)', minHeight: '400px' }}
            >
              <AfterPanel
                branchStates={displayedBranches}
                transitionMode={transitionMode}
                modifications={modifications}
                employeesInExchanges={employeesInExchanges}
                branches={branches}
                positions={positions}
                workstations={workstations}
                employeesData={employeesData}
                onModify={onModify}
                onClear={onClear}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile toggle hint */}
      <div className="lg:hidden text-center text-sm text-slate-500">
        Scroll down to see the proposed state
      </div>
    </div>
  )
}

export default SplitPanelView
