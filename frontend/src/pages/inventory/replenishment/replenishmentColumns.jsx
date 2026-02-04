import { Edit, Trash2, UserPlus, Building2 } from 'lucide-react'

export const getReplenishmentColumns = ({
  statusColorMap,
  openEditModal,
  openAssignModal,
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
    accessorKey: 'asset_name',
    header: 'Asset Name',
    cell: ({ getValue }) => (
      <div className="text-sm font-medium text-slate-900">
        {getValue() || emptyValue}
      </div>
    ),
    size: 180,
  },
  {
    accessorKey: 'serial_number',
    header: 'Serial No.',
    cell: ({ getValue }) => (
      <div className="text-sm text-slate-700 font-mono">
        {getValue() || emptyValue}
      </div>
    ),
    size: 140,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <div className="text-sm text-slate-700">
        {row.original.category?.name || emptyValue}
      </div>
    ),
    size: 120,
  },
  {
    id: 'brand_model',
    header: 'Brand / Model',
    cell: ({ row }) => {
      const brand = row.original.brand
      const model = row.original.model
      const display = [brand, model].filter(Boolean).join(' ')
      return (
        <div className="text-sm text-slate-700">
          {display || emptyValue}
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border"
          style={{
            backgroundColor: statusColorMap[status?.id] || '#f8fafc',
            color: statusColorMap[status?.id] ? '#f1f1f1' : '#000',
            borderColor: statusColorMap[status?.id] || '#e2e8f0',
          }}
        >
          {status?.name || emptyValue}
        </span>
      )
    },
    size: 110,
  },
  {
    id: 'assigned_to',
    header: 'Assigned To',
    cell: ({ row }) => {
      const employee = row.original.assigned_employee
      const branch = row.original.assigned_branch

      if (employee) {
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-green-600" />
              <span className="text-sm font-medium text-slate-900">
                {employee.fullname}
              </span>
            </div>
            <span className="text-xs text-slate-500 ml-5">
              {employee.branch?.branch_name || 'No Branch'}
            </span>
          </div>
        )
      }

      if (branch) {
        return (
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-sm font-medium text-slate-900">
              {branch.branch_name}
            </span>
          </div>
        )
      }

      return (
        <span className="text-sm text-slate-400 italic">Unassigned</span>
      )
    },
    size: 180,
  },
  {
    accessorKey: 'purchase_date',
    header: 'Purchase Date',
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <div className="text-sm text-slate-700">
          {value ? new Date(value).toLocaleDateString() : emptyValue}
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: 'acq_cost',
    header: 'Acq. Cost',
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <div className="text-sm text-slate-700">
          {value !== null && value !== undefined && value !== ''
            ? `${currencyPrefix}${Number(value).toLocaleString()}`
            : emptyValue}
        </div>
      )
    },
    size: 100,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openAssignModal(row.original)}
          className="p-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200"
          title="Assign to employee or branch"
        >
          <UserPlus className="w-4 h-4" />
        </button>
        <button
          onClick={() => openEditModal(row.original)}
          className="p-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
          title="Edit replenishment"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(row.original)}
          className="p-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
          title="Delete replenishment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
    enableSorting: false,
    size: 140,
  },
]
