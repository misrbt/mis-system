import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table'
import { TABLE_COLUMNS } from '../constants'

/**
 * Configures and manages the TanStack Table instance
 */
export function useEmployeeTable({
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
}) {
  // Pre-filter data before passing to TanStack Table
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

  const table = useReactTable({
    data: tableData,
    columns: TABLE_COLUMNS,
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

  return table
}
