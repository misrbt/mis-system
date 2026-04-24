export const TICKET_STATUSES = [
  'Open',
  'In Progress',
  'Pending',
  'Resolved',
  'Closed',
  'Cancelled',
]

export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

export const STATUS_STYLES = {
  Open: 'bg-slate-100 text-slate-700 border-slate-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Closed: 'bg-gray-100 text-gray-700 border-gray-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
}

export const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Urgent: 'bg-red-100 text-red-700 border-red-200',
}
