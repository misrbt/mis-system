import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { EmployeeTable } from '../../EmployeeTable'
import { FiltersBar } from '../../FiltersBar'
import { BulkSelectionBar } from './BulkSelectionBar'

export function EnhancedTableView({
  table,
  loadingEmployees,
  employeesData,
  modifications,
  employeesInExchanges,
  transitionMode,
  branches,
  positions,
  workstations,
  loadingBranches,
  loadingPositions,
  loadingWorkstations,
  onModify,
  onClear,
  globalFilter,
  branchFilter,
  showModifiedOnly,
  hasFilters,
  onGlobalFilterChange,
  onBranchFilterChange,
  onToggleModifiedOnly,
  onClearFilters,
  onPageReset,
}) {
  const [selectedRows, setSelectedRows] = useState(new Set())

  const filteredTotal = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const rowStart = filteredTotal === 0 ? 0 : pageIndex * pageSize + 1
  const rowEnd = Math.min((pageIndex + 1) * pageSize, filteredTotal)

  const handleClearSelection = useCallback(() => {
    setSelectedRows(new Set())
  }, [])

  const handleBulkClear = useCallback(() => {
    selectedRows.forEach(id => onClear(id))
    setSelectedRows(new Set())
  }, [selectedRows, onClear])

  const handleBulkAssign = useCallback((field, value) => {
    selectedRows.forEach(id => {
      const employee = employeesData.find(e => e.id === id)
      if (employee) {
        onModify(id, field, value, employee)
      }
    })
  }, [selectedRows, employeesData, onModify])

  const someSelected = selectedRows.size > 0

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
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
        onGlobalFilterChange={onGlobalFilterChange}
        onBranchFilterChange={onBranchFilterChange}
        onToggleModifiedOnly={onToggleModifiedOnly}
        onClearFilters={onClearFilters}
        onPageReset={onPageReset}
      />

      {/* Bulk Selection Bar */}
      <AnimatePresence>
        {someSelected && (
          <BulkSelectionBar
            selectedCount={selectedRows.size}
            transitionMode={transitionMode}
            branches={branches}
            positions={positions}
            workstations={workstations}
            onClearSelection={handleClearSelection}
            onBulkClear={handleBulkClear}
            onBulkAssign={handleBulkAssign}
          />
        )}
      </AnimatePresence>

      {/* Employee Table */}
      <EmployeeTable
        table={table}
        loadingEmployees={loadingEmployees}
        employeesData={employeesData}
        modifications={modifications}
        employeesInExchanges={employeesInExchanges}
        transitionMode={transitionMode}
        branches={branches}
        positions={positions}
        workstations={workstations}
        loadingBranches={loadingBranches}
        loadingPositions={loadingPositions}
        loadingWorkstations={loadingWorkstations}
        onModify={onModify}
        onClear={onClear}
      />
    </div>
  )
}

export default EnhancedTableView
