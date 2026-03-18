import { useState, useCallback } from 'react'

/**
 * Hook for managing drag-and-drop state in the Visual Grid View
 */
export function useDragAndDrop({ onModify, employeesData, workstations }) {
  const [activeEmployee, setActiveEmployee] = useState(null)
  const [overId, setOverId] = useState(null)

  const handleDragStart = useCallback((event) => {
    const { active } = event
    const employee = employeesData.find(e => e.id === parseInt(active.id))
    setActiveEmployee(employee || null)
  }, [employeesData])

  const handleDragOver = useCallback((event) => {
    const { over } = event
    setOverId(over?.id || null)
  }, [])

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const employeeId = parseInt(active.id)
      const employee = employeesData.find(e => e.id === employeeId)

      if (!employee) {
        setActiveEmployee(null)
        setOverId(null)
        return
      }

      // Parse the drop target - could be a workstation or branch
      const overId = over.id.toString()

      if (overId.startsWith('workstation-')) {
        const workstationId = parseInt(overId.replace('workstation-', ''))
        const workstation = workstations.find(ws => ws.id === workstationId)

        if (workstation) {
          // CRITICAL: Set workstation_id FIRST for unassigned employees
          // Otherwise the removal logic triggers when branch/position are set with null workstation
          onModify(employeeId, 'to_workstation_id', workstationId, employee)
          onModify(employeeId, 'to_branch_id', workstation.branch_id, employee)
          onModify(employeeId, 'to_position_id', workstation.position_id || employee.position_id, employee)
        }
      } else if (overId.startsWith('branch-')) {
        const branchId = parseInt(overId.replace('branch-', ''))
        onModify(employeeId, 'to_branch_id', branchId, employee)
      }
    }

    setActiveEmployee(null)
    setOverId(null)
  }, [employeesData, workstations, onModify])

  const handleDragCancel = useCallback(() => {
    setActiveEmployee(null)
    setOverId(null)
  }, [])

  return {
    activeEmployee,
    overId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}
