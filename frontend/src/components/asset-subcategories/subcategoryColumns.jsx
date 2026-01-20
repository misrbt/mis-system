import { Edit, Trash2, Package } from 'lucide-react'

export const getSubcategoryColumns = (onEdit, onDelete) => [
  {
    accessorKey: 'category.name',
    header: 'Category',
    cell: (info) => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        <Package className="w-3 h-3" />
        {info.getValue() || '--'}
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Subcategory Name',
    cell: (info) => <div className="text-sm font-semibold text-slate-900">{info.getValue()}</div>,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: (info) => (
      <div className="text-sm text-slate-600 max-w-md truncate" title={info.getValue() || ''}>
        {info.getValue() || '--'}
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
          title="Edit subcategory"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-sm"
          title="Delete subcategory"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    ),
    enableSorting: false,
  },
]
