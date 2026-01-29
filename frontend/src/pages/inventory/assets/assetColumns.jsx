import { Edit, Eye, History, Trash2, User } from 'lucide-react'
import SearchableSelect from '../../../components/SearchableSelect'
import Swal from 'sweetalert2'

export const getAssetColumns = ({
  editingCell,
  setEditingCell,
  employeeOptions,
  handleInlineEdit,
  employeeAcqTotals,
  isLoadingTotals,
  categories,
  statusOptions,
  statusColorMap,
  navigate,
  openEditModal,
  handleDelete,
  emptyValue,
  currencyPrefix,
}) => [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
    ),
    enableSorting: false,
    size: 40,
  },
  {
    accessorKey: 'assigned_employee',
    header: 'Employee Info',
    cell: ({ row }) => {
      const employee = row.original.assigned_employee
      const isEditing = editingCell === `${row.id}-assigned_employee`
      const currentEmployeeId = row.original.assigned_to_employee_id || employee?.id || ''

      if (isEditing) {
        return (
          <div className="min-w-[220px]">
            <SearchableSelect
              label="Assign to"
              hideLabel
              options={employeeOptions}
              value={currentEmployeeId}
              onChange={(value) => {
                handleInlineEdit(row.original.id, 'assigned_to_employee_id', value)
                setEditingCell(null)
              }}
              displayField="name"
              secondaryField="position"
              tertiaryField="branch"
              placeholder="Select employee..."
              emptyMessage="No employees found"
            />
          </div>
        )
      }

      if (!employee) {
        return (
          <div
            className="flex items-center gap-2 text-slate-400 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
            onDoubleClick={() => setEditingCell(`${row.id}-assigned_employee`)}
          >
            <User className="w-4 h-4" />
            <span className="text-xs italic">Unassigned</span>
          </div>
        )
      }
      return (
        <div
          className="flex flex-col gap-1.5 py-1 cursor-pointer hover:bg-slate-100 px-2 rounded"
          onDoubleClick={() => setEditingCell(`${row.id}-assigned_employee`)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {employee.fullname}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-1">
            <span className="text-xs text-slate-600 truncate">
              {employee.position?.title || 'No Position'}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-1">
            <span className="text-xs text-slate-500 truncate">
              {employee.branch?.branch_name || 'No Branch'}
            </span>
          </div>
        </div>
      )
    },
    size: 220,
  },
  {
    accessorKey: 'asset_name',
    header: 'Asset Name',
    cell: ({ row, getValue }) => {
      const isEditing = editingCell === `${row.id}-asset_name`
      if (isEditing) {
        const inputId = `asset-name-${row.id}`
        return (
          <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-slate-600 mb-1">
              Asset Name
            </label>
            <input
              autoFocus
              id={inputId}
              type="text"
              defaultValue={getValue()}
              onBlur={(e) => handleInlineEdit(row.original.id, 'asset_name', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInlineEdit(row.original.id, 'asset_name', e.target.value)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
      }
      return (
        <div
          className="text-sm text-slate-900 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
          onDoubleClick={() => setEditingCell(`${row.id}-asset_name`)}
        >
          {getValue()}
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: 'serial_number',
    header: 'Serial No.',
    cell: ({ row, getValue }) => {
      const isEditing = editingCell === `${row.id}-serial_number`
      if (isEditing) {
        const inputId = `serial-number-${row.id}`
        return (
          <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-slate-600 mb-1">
              Serial Number
            </label>
            <input
              autoFocus
              id={inputId}
              type="text"
              defaultValue={getValue() || ''}
              onBlur={(e) => handleInlineEdit(row.original.id, 'serial_number', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInlineEdit(row.original.id, 'serial_number', e.target.value)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
      }
      return (
        <div
          className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
          onDoubleClick={() => setEditingCell(`${row.id}-serial_number`)}
        >
          {getValue() || emptyValue}
        </div>
      )
    },
    size: 130,
  },
  {
    accessorKey: 'purchase_date',
    header: 'Purchase Date',
    cell: ({ row }) => {
      const isEditing = editingCell === `${row.id}-purchase_date`
      const value = row.original.purchase_date

      if (isEditing) {
        const inputId = `purchase-date-${row.id}`
        return (
          <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-slate-600 mb-1">
              Purchase Date
            </label>
            <input
              autoFocus
              id={inputId}
              type="date"
              defaultValue={value || ''}
              onBlur={(e) => handleInlineEdit(row.original.id, 'purchase_date', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInlineEdit(row.original.id, 'purchase_date', e.target.value)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
      }

      return (
        <div
          className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
          onDoubleClick={() => setEditingCell(`${row.id}-purchase_date`)}
        >
          {value ? new Date(value).toLocaleDateString() : emptyValue}
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const isEditing = editingCell === `${row.id}-category`
      const currentCategoryId = row.original.asset_category_id || row.original.category?.id || ''

      if (isEditing) {
        const inputId = `category-${row.id}`
        return (
          <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-slate-600 mb-1">
              Category
            </label>
            <select
              autoFocus
              id={inputId}
              defaultValue={currentCategoryId}
              onChange={(e) => handleInlineEdit(row.original.id, 'asset_category_id', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInlineEdit(row.original.id, 'asset_category_id', e.target.value)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {(categories || []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name || cat.category_name}
                </option>
              ))}
            </select>
          </div>
        )
      }

      return (
        <div
          className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
          onDoubleClick={() => setEditingCell(`${row.id}-category`)}
        >
          {row.original.category?.name || row.original.category?.category_name || emptyValue}
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: 'acq_cost',
    header: 'Acq.cost',
    cell: ({ row, getValue }) => {
      const isEditing = editingCell === `${row.id}-acq_cost`
      const value = getValue()
      const employeeKey =
        row.original.assigned_to_employee_id ?? row.original.assigned_employee?.id ?? 'unassigned'
      const totalValue = employeeAcqTotals[employeeKey]

      if (isEditing) {
        const inputId = `acq-cost-${row.id}`
        return (
          <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-slate-600 mb-1">
              Acquisition Cost
            </label>
            <input
              autoFocus
              id={inputId}
              type="number"
              step="0.01"
              defaultValue={value || ''}
              onBlur={(e) => handleInlineEdit(row.original.id, 'acq_cost', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInlineEdit(row.original.id, 'acq_cost', e.target.value)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
      }

      return (
        <div
          className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
          onDoubleClick={() => setEditingCell(`${row.id}-acq_cost`)}
          title="Acquisition cost of this asset"
        >
          {value !== null && value !== undefined && value !== ''
            ? `${currencyPrefix}${Number(value).toLocaleString()}`
            : emptyValue}
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: 'estimate_life',
    header: 'Est. Life',
    cell: ({ row, getValue }) => {
      const isEditing = editingCell === `${row.id}-estimate_life`
      const value = getValue()

      if (isEditing) {
        const inputId = `estimate-life-${row.id}`
        return (
          <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-slate-600 mb-1">
              Estimated Life (years)
            </label>
            <input
              autoFocus
              id={inputId}
              type="number"
              step="1"
              min="0"
              defaultValue={value || ''}
              onBlur={(e) => handleInlineEdit(row.original.id, 'estimate_life', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInlineEdit(row.original.id, 'estimate_life', e.target.value)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
      }

      return (
        <div
          className="text-sm text-slate-700 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
          onDoubleClick={() => setEditingCell(`${row.id}-estimate_life`)}
        >
          {value || emptyValue} yrs
        </div>
      )
    },
    size: 90,
  },
  {
    accessorKey: 'book_value',
    header: 'Book Value',
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <div className="text-sm text-slate-900 font-normal">
          {value ? `${currencyPrefix}${Number(value).toLocaleString()}` : emptyValue}
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const isEditing = editingCell === `${row.id}-status`
      const currentStatusId = row.original.status_id || status?.id || ''

      if (isEditing) {
        const inputId = `status-${row.id}`
        return (
          <div>
            <label htmlFor={inputId} className="block text-xs font-medium text-slate-600 mb-1">
              Status
            </label>
            <select
              autoFocus
              id={inputId}
              defaultValue={currentStatusId}
              onChange={(e) => handleInlineEdit(row.original.id, 'status_id', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleInlineEdit(row.original.id, 'status_id', e.target.value)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              className="w-full px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select status</option>
              {(statusOptions || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )
      }

      return (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border cursor-pointer"
          style={{
            backgroundColor: statusColorMap[status?.id] || '#f8fafc',
            color: statusColorMap[status?.id] ? '#f1f1f1' : '#000',
            borderColor: statusColorMap[status?.id] || '#e2e8f0',
          }}
          onDoubleClick={() => setEditingCell(`${row.id}-status`)}
        >
          {status?.name || '-'}
        </span>
      )
    },
    size: 120,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const assignedEmployeeId = row.original.assigned_to_employee_id
      const hasEmployee = Boolean(assignedEmployeeId)

      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (hasEmployee) {
                navigate(`/inventory/employees/${assignedEmployeeId}/assets`)
              } else {
                Swal.fire({
                  icon: 'info',
                  title: 'Not Assigned',
                  text: 'This asset is not assigned to any employee',
                })
              }
            }}
            disabled={!hasEmployee}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              hasEmployee
                ? 'text-green-700 bg-green-50 hover:bg-green-100'
                : 'text-gray-400 bg-gray-50 cursor-not-allowed opacity-50'
            }`}
            title={hasEmployee ? "View employee's all assets" : 'Asset not assigned'}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate(`/inventory/assets/${row.original.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all duration-200"
            title="View asset timeline & history"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openEditModal(row.original)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
            title="Edit asset"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Edit</span>
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
            title="Delete asset"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Delete</span>
          </button>
        </div>
      )
    },
    enableSorting: false,
    size: 200,
  },
]
