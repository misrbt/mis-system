import { ChevronUp, ChevronDown } from 'lucide-react'

export function SortIcon({ column }) {
  if (!column.getCanSort()) return null

  const sorted = column.getIsSorted()

  return (
    <span className="ml-1 text-slate-400">
      {sorted === 'asc' ? (
        <ChevronUp className="w-3.5 h-3.5 inline" />
      ) : sorted === 'desc' ? (
        <ChevronDown className="w-3.5 h-3.5 inline" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5 inline opacity-0 group-hover:opacity-50" />
      )}
    </span>
  )
}
