import { useMemo } from 'react'
import { TRANSITION_MODES } from '../constants'

/**
 * Detects exchange patterns in branch transition modifications
 * Returns exchanges and set of employee IDs involved in exchanges
 */
export function useExchangeDetection(transitionMode, modifications, employeesData) {
  const exchanges = useMemo(() => {
    if (transitionMode !== TRANSITION_MODES.BRANCH) return []

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
        return (
          otherMod.to_branch_id === emp.branch_id &&
          otherMod.to_position_id === emp.position_id
        )
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
            return (
              otherMod.to_branch_id === currentEmp.branch_id &&
              otherMod.to_position_id === currentEmp.position_id
            )
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

  return { exchanges, employeesInExchanges }
}
