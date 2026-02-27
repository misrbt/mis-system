import { useState, useCallback } from 'react'

/**
 * Derives the employee's current physical workstation from their assigned workstation assets.
 * Falls back to employee.branch_id / position_id if no workstation asset is found.
 */
export function getWorkstation(employee) {
  const wsAsset = (employee?.assigned_assets ?? []).find(
    a => a.workstation_branch_id && a.workstation_position_id
  )
  return {
    ws_branch_id: wsAsset?.workstation_branch_id ?? employee?.branch_id ?? null,
    ws_position_id: wsAsset?.workstation_position_id ?? employee?.position_id ?? null,
  }
}

/**
 * Manages the state for employee transitions.
 * Handles modifications, mode selection, and filters.
 */
export function useTransitionState() {
  const [transitionMode, setTransitionMode] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [showExchangePanel, setShowExchangePanel] = useState(true)
  const [modifications, setModifications] = useState({})

  // Table state
  const [globalFilter, setGlobalFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [showModifiedOnly, setShowModifiedOnly] = useState(false)
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const handleModify = useCallback((employeeId, field, value, employee) => {
    if (!employee) return

    const parsedValue = parseInt(value)
    const { ws_branch_id, ws_position_id } = getWorkstation(employee)

    setModifications(prev => {
      // Initialise from the employee's WORKSTATION values (not their HR branch/position)
      const current = prev[employeeId] || {
        to_branch_id: ws_branch_id,
        to_position_id: ws_position_id,
      }

      const updated = { ...current, [field]: parsedValue }

      console.log('🔄 Modification Debug:', {
        employeeId,
        employeeName: employee.fullname,
        field,
        newValue: parsedValue,
        workstation: { ws_branch_id, ws_position_id },
        previousMod: current,
        newMod: updated,
      })

      // If both values are back to the employee's WORKSTATION, remove modification
      if (
        updated.to_branch_id === ws_branch_id &&
        updated.to_position_id === ws_position_id
      ) {
        const newMods = { ...prev }
        delete newMods[employeeId]
        console.log('✅ Modification removed - back to original workstation')
        return newMods
      }

      return { ...prev, [employeeId]: updated }
    })
  }, [])

  const clearModification = useCallback((employeeId) => {
    setModifications(prev => {
      const newMods = { ...prev }
      delete newMods[employeeId]
      console.log('🗑️ Modification cleared for employee:', employeeId)
      return newMods
    })
  }, [])

  const clearAll = useCallback(() => {
    setModifications({})
    setRemarks('')
    console.log('🧹 All modifications cleared')
  }, [])

  const resetAll = useCallback(() => {
    setTransitionMode(null)
    setModifications({})
    setRemarks('')
    setGlobalFilter('')
    setBranchFilter('')
    setShowModifiedOnly(false)
    setSorting([])
    setPagination({ pageIndex: 0, pageSize: 10 })
    console.log('🔄 State reset to initial')
  }, [])

  return {
    // Mode
    transitionMode,
    setTransitionMode,

    // Modifications
    modifications,
    handleModify,
    clearModification,
    clearAll,
    resetAll,
    modifiedCount: Object.keys(modifications).length,

    // Remarks
    remarks,
    setRemarks,

    // UI state
    showExchangePanel,
    setShowExchangePanel,

    // Filters
    globalFilter,
    setGlobalFilter,
    branchFilter,
    setBranchFilter,
    showModifiedOnly,
    setShowModifiedOnly,
    hasFilters: !!(globalFilter || branchFilter || showModifiedOnly),

    // Table state
    sorting,
    setSorting,
    pagination,
    setPagination,
  }
}
