import { useState, useCallback, useMemo } from 'react'
import { getWorkstation } from './useTransitionState'

/**
 * Hook for managing chain/rotation building state
 */
export function useChainBuilder({
  employeesData,
  workstations,
  modifications,
  onModify,
}) {
  const [chainNodes, setChainNodes] = useState([]) // Array of employee IDs in chain order
  const [isOpen, setIsOpen] = useState(false)

  // Get employee's workstation info
  const getEmployeeWorkstationInfo = useCallback((employeeId) => {
    const employee = employeesData.find(e => e.id === employeeId)
    if (!employee) return null

    const { ws_branch_id, ws_position_id } = getWorkstation(employee)
    const currentWorkstation = employee.workstations?.[0]

    return {
      employee,
      branchId: ws_branch_id,
      positionId: ws_position_id,
      workstationId: currentWorkstation?.id,
      workstation: currentWorkstation,
    }
  }, [employeesData])

  // Add employee to chain
  const addToChain = useCallback((employeeId) => {
    if (chainNodes.includes(employeeId)) return
    setChainNodes(prev => [...prev, employeeId])
  }, [chainNodes])

  // Remove employee from chain
  const removeFromChain = useCallback((employeeId) => {
    setChainNodes(prev => prev.filter(id => id !== employeeId))
  }, [])

  // Reorder chain
  const reorderChain = useCallback((fromIndex, toIndex) => {
    setChainNodes(prev => {
      const result = [...prev]
      const [removed] = result.splice(fromIndex, 1)
      result.splice(toIndex, 0, removed)
      return result
    })
  }, [])

  // Clear chain
  const clearChain = useCallback(() => {
    setChainNodes([])
  }, [])

  // Validate chain (check if it forms a valid rotation)
  const validation = useMemo(() => {
    if (chainNodes.length < 2) {
      return {
        isValid: false,
        message: 'Add at least 2 employees to form a chain',
        canComplete: false,
      }
    }

    // Check all employees exist and have workstations
    const nodeInfos = chainNodes.map(id => getEmployeeWorkstationInfo(id)).filter(Boolean)

    if (nodeInfos.length !== chainNodes.length) {
      return {
        isValid: false,
        message: 'Some employees in the chain were not found',
        canComplete: false,
      }
    }

    // REMOVED: No longer require employees to have workstations
    // Chain builder can work with unassigned employees too
    // const missingWorkstations = nodeInfos.filter(info => !info.workstationId)
    // if (missingWorkstations.length > 0) {
    //   return {
    //     isValid: false,
    //     message: `${missingWorkstations.length} employee(s) have no workstation`,
    //     canComplete: false,
    //   }
    // }

    // For a valid rotation:
    // - Each employee moves to the next employee's position/workstation
    // - Last employee moves to first employee's position/workstation (circular)
    const isCircular = chainNodes.length >= 2
    const workstationCount = nodeInfos.filter(info => info.workstationId).length
    const unassignedCount = nodeInfos.length - workstationCount

    let message = isCircular
      ? `Valid ${chainNodes.length}-way rotation chain`
      : `Chain with ${chainNodes.length} employees`

    if (unassignedCount > 0) {
      message += ` (${unassignedCount} unassigned)`
    }

    return {
      isValid: true,
      isCircular,
      message,
      canComplete: true,
      nodeInfos,
    }
  }, [chainNodes, getEmployeeWorkstationInfo])

  // Apply chain to modifications
  const applyChain = useCallback(() => {
    if (!validation.isValid || !validation.canComplete) return

    const nodeInfos = validation.nodeInfos

    // Each employee moves to the NEXT employee's workstation
    // Employee 0 -> Employee 1's workstation
    // Employee 1 -> Employee 2's workstation
    // ...
    // Employee N -> Employee 0's workstation (circular)
    for (let i = 0; i < nodeInfos.length; i++) {
      const currentInfo = nodeInfos[i]
      const nextInfo = nodeInfos[(i + 1) % nodeInfos.length] // Wrap around for last element

      const employee = currentInfo.employee

      // If next employee has a workstation, assign to it
      if (nextInfo.workstationId) {
        const targetWorkstation = workstations.find(ws => ws.id === nextInfo.workstationId)
        if (targetWorkstation) {
          onModify(employee.id, 'to_workstation_id', targetWorkstation.id, employee)
          onModify(employee.id, 'to_branch_id', targetWorkstation.branch_id, employee)
          onModify(employee.id, 'to_position_id', targetWorkstation.position_id || currentInfo.positionId, employee)
        }
      }
      // If next employee has no workstation, just assign their branch/position
      else if (nextInfo.branchId) {
        onModify(employee.id, 'to_workstation_id', '', employee)
        onModify(employee.id, 'to_branch_id', nextInfo.branchId, employee)
        onModify(employee.id, 'to_position_id', nextInfo.positionId || currentInfo.positionId, employee)
      }
    }

    // Clear chain after applying
    clearChain()
    setIsOpen(false)
  }, [validation, workstations, onModify, clearChain])

  // Suggest employees to complete a loop
  const suggestedEmployees = useMemo(() => {
    if (chainNodes.length < 1) return []

    // Get the first employee's workstation - we need someone who is currently there
    // or could complete the loop
    const firstInfo = getEmployeeWorkstationInfo(chainNodes[0])
    if (!firstInfo) return []

    // Find employees who could complete the loop
    // (those whose workstation is the first employee's target, or first employee's origin)
    return employeesData
      .filter(e => !chainNodes.includes(e.id))
      .slice(0, 10) // Limit suggestions
  }, [chainNodes, employeesData, getEmployeeWorkstationInfo])

  // Get chain node details
  const chainDetails = useMemo(() => {
    return chainNodes.map((id, index) => {
      const info = getEmployeeWorkstationInfo(id)
      if (!info) return null

      const nextIndex = (index + 1) % chainNodes.length
      const nextInfo = chainNodes.length > 1 ? getEmployeeWorkstationInfo(chainNodes[nextIndex]) : null

      return {
        ...info,
        index,
        targetWorkstationId: nextInfo?.workstationId,
        targetWorkstation: nextInfo?.workstation,
      }
    }).filter(Boolean)
  }, [chainNodes, getEmployeeWorkstationInfo])

  return {
    chainNodes,
    chainDetails,
    isOpen,
    setIsOpen,
    addToChain,
    removeFromChain,
    reorderChain,
    clearChain,
    applyChain,
    validation,
    suggestedEmployees,
  }
}
