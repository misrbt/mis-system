import { Eye, Edit2 } from 'lucide-react'
import {
  InlineStatusCell,
  InlineAssigneeCell,
  InlineDueDateCell,
  InlinePriorityCell,
} from './ticketInlineCells'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function getTicketColumns({
  onView,
  onEdit,
  onStatusChange,
  onPriorityChange,
  onAssignChange,
  onDueDateChange,
  assignees = [],
}) {
  return [
    {
      accessorKey: 'ticket_number',
      header: 'Ticket #',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-indigo-700">
          {row.original.ticket_number}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate max-w-xs">
            {row.original.title}
          </div>
          <div className="text-xs text-slate-500">
            {row.original.category?.name || '—'}
          </div>
        </div>
      ),
    },
    {
      id: 'requester',
      accessorFn: (row) => row.requester?.fullname || '',
      header: 'Requester',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium text-slate-800">
            {row.original.requester?.fullname || '—'}
          </div>
          <div className="text-xs text-slate-500">
            {row.original.requester?.branch?.branch_name || ''}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <InlinePriorityCell ticket={row.original} onChange={onPriorityChange} />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <InlineStatusCell ticket={row.original} onChange={onStatusChange} />
      ),
    },
    {
      id: 'assigned_to',
      accessorFn: (row) => row.assignedTo?.name || '',
      header: 'Assigned To',
      cell: ({ row }) => (
        <InlineAssigneeCell
          ticket={row.original}
          assignees={assignees}
          onChange={onAssignChange}
        />
      ),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => (
        <InlineDueDateCell ticket={row.original} onChange={onDueDateChange} />
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">{formatDate(row.original.created_at)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView?.(row.original)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit?.(row.original)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]
}
