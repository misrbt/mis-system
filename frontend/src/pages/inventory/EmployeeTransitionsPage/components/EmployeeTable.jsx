import { Users, ArrowRight } from 'lucide-react'
import { EmployeeTableRow } from './EmployeeTableRow'
import { EmployeeTableCard } from './EmployeeTableCard'
import { PaginationControls } from './PaginationControls'
import { SortIcon } from './SortIcon'

export function EmployeeTable({
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
}) {
  const paginatedRows = table.getRowModel().rows

  const renderEmptyState = () => (
    <div className="px-6 py-12 text-center bg-white">
      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p className="text-sm font-medium text-slate-900">No employees found</p>
      <p className="text-xs text-slate-600 mt-1">Try adjusting your filters</p>
    </div>
  )

  const renderLoadingState = () => (
    <tr>
      <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">
        Loading employees...
      </td>
    </tr>
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {table.getHeaderGroups()[0].headers.map(header => (
                <th
                  key={header.id}
                  className={`px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider group ${
                    header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-slate-100 transition-colors' : ''
                  }`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="inline-flex items-center gap-1">
                    {header.id === 'destWorkstation' && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                    {{
                      employee: 'Employee',
                      currentWorkstation: 'Current Workstation',
                      destWorkstation: 'New Workstation',
                      status: 'Status',
                      action: 'Action',
                    }[header.id]}
                    <SortIcon column={header.column} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loadingEmployees ? (
              renderLoadingState()
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan="5">{renderEmptyState()}</td>
              </tr>
            ) : (
              paginatedRows.map(row => {
                const employee = row.original
                const isModified = !!modifications[employee.id]
                const isInExchange = employeesInExchanges.has(employee.id)

                return (
                  <EmployeeTableRow
                    key={employee.id}
                    employee={employee}
                    employeesData={employeesData}
                    isModified={isModified}
                    isInExchange={isInExchange}
                    modifications={modifications}
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
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden divide-y divide-slate-100 bg-slate-50/50">
        {loadingEmployees ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Loading employees...
          </div>
        ) : paginatedRows.length === 0 ? (
          renderEmptyState()
        ) : (
          paginatedRows.map(row => {
            const employee = row.original
            const isModified = !!modifications[employee.id]
            const isInExchange = employeesInExchanges.has(employee.id)

            return (
              <EmployeeTableCard
                key={employee.id}
                employee={employee}
                employeesData={employeesData}
                isModified={isModified}
                isInExchange={isInExchange}
                modifications={modifications}
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
            )
          })
        )}
      </div>

      {/* Pagination */}
      {!loadingEmployees && <PaginationControls table={table} />}
    </div>
  )
}
