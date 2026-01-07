import { ChevronRight, Edit, Trash2, MessageSquare } from 'lucide-react'

export const getRepairColumns = (handleStatusChange, openEditModal, handleDelete, getStatusBadge, openRemarksModal) => [
  {
    accessorKey: 'asset.asset_name',
    header: 'Asset',
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-semibold text-slate-900">{row.original.asset?.asset_name || '—'}</div>
        <div className="text-xs text-slate-500">{row.original.asset?.category?.name || ''}</div>
      </div>
    ),
  },
  {
    accessorKey: 'vendor.company_name',
    header: 'Vendor',
    cell: (info) => <div className="text-sm text-slate-700">{info.getValue() || '—'}</div>,
  },
  {
    accessorKey: 'repair_date',
    header: 'Repair Date',
    cell: ({ getValue }) => {
      const value = getValue()
      return <div className="text-sm text-slate-700">{value ? new Date(value).toLocaleDateString() : '—'}</div>
    },
  },
  {
    accessorKey: 'expected_return_date',
    header: 'Expected Return',
    cell: ({ getValue }) => {
      const value = getValue()
      return <div className="text-sm text-slate-700">{value ? new Date(value).toLocaleDateString() : '—'}</div>
    },
  },
  {
    accessorKey: 'repair_cost',
    header: 'Cost',
    cell: ({ getValue }) => {
      const value = getValue()
      const formatted = value
        ? `P${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'N/A'
      return <div className="text-sm text-slate-900 font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const nextStatus = {
        Pending: 'In Repair',
        'In Repair': 'Completed',
        Completed: 'Returned',
      }[status]

      // Display labels for status
      const statusDisplay = {
        'In Repair': 'Under Repair',
      }[status] || status

      const nextStatusDisplay = {
        'In Repair': 'Under Repair',
      }[nextStatus] || nextStatus

      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(status)}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            <span className="leading-none">{statusDisplay}</span>
          </span>
          {nextStatus && (
            <button
              onClick={() => handleStatusChange(row.original, nextStatus)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:border-blue-300 hover:text-blue-700 transition-colors"
              title={`Change status to ${nextStatusDisplay}`}
            >
              <span className="text-[10px] uppercase tracking-wide text-slate-400">Next</span>
              <span>{nextStatusDisplay}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openRemarksModal(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200"
          title="View remarks history"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Remarks</span>
        </button>
        <button
          onClick={() => openEditModal(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
          title="Edit repair"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => handleDelete(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
          title="Delete repair"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    ),
    enableSorting: false,
  },
]
