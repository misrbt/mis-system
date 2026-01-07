import { Edit, Trash2 } from 'lucide-react'

export const getBranchColumns = (onEdit, onDelete) => [
  {
    accessorKey: 'branch_name',
    header: 'Branch Name',
    cell: (info) => (
      <div className="flex items-center gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{info.getValue()}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'brak',
    header: 'BRAK',
    cell: (info) => (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">{info.getValue()}</span>
      </div>
    ),
  },
  {
    accessorKey: 'brcode',
    header: 'Branch Code',
    cell: (info) => (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {info.getValue()}
        </span>
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:shadow-sm"
          title="Edit branch"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-sm"
          title="Delete branch"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    ),
    enableSorting: false,
  },
]
