import { Edit, Trash2 } from 'lucide-react'

export const getEmployeeColumns = (onEdit, onDelete) => [
  {
    accessorKey: 'fullname',
    header: 'Full Name',
    cell: (info) => <div className="text-sm font-semibold text-slate-900">{info.getValue()}</div>,
  },
  {
    accessorKey: 'branch.branch_name',
    header: 'Branch',
    cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.branch?.branch_name || '--'}</span>,
  },
  {
    accessorKey: 'department.name',
    header: 'Department',
    cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.department?.name || '--'}</span>,
  },
  {
    accessorKey: 'position.title',
    header: 'Position',
    cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.position?.title || '--'}</span>,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:shadow-sm"
          title="Edit employee"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-sm"
          title="Delete employee"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    ),
    enableSorting: false,
  },
]
