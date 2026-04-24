import { useState, useRef, useEffect } from 'react'
import { ChevronDown, CalendarDays } from 'lucide-react'
import TicketStatusBadge from './TicketStatusBadge'
import TicketPriorityBadge from './TicketPriorityBadge'
import { TICKET_STATUSES, TICKET_PRIORITIES } from './ticketConstants'

function formatDueDate(value) {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return null
  }
}

export function InlineStatusCell({ ticket, onChange }) {
  const [editing, setEditing] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    if (editing) selectRef.current?.focus()
  }, [editing])

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group inline-flex items-center gap-1 rounded hover:ring-2 hover:ring-indigo-300 hover:ring-offset-1 transition-all"
        title={`Click to change status (currently ${ticket.status})`}
      >
        <TicketStatusBadge status={ticket.status} />
        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
      </button>
    )
  }

  const handleChange = (e) => {
    const next = e.target.value
    setEditing(false)
    if (next && next !== ticket.status) {
      onChange?.(ticket, next)
    }
  }

  return (
    <select
      ref={selectRef}
      value={ticket.status}
      onChange={handleChange}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setEditing(false)
      }}
      className="text-xs border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
    >
      {TICKET_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}

export function InlinePriorityCell({ ticket, onChange }) {
  const [editing, setEditing] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    if (editing) selectRef.current?.focus()
  }, [editing])

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group inline-flex items-center gap-1 rounded-full hover:ring-2 hover:ring-indigo-300 hover:ring-offset-1 transition-all"
        title={`Click to change priority (currently ${ticket.priority})`}
      >
        <TicketPriorityBadge priority={ticket.priority} />
        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
      </button>
    )
  }

  const handleChange = (e) => {
    const next = e.target.value
    setEditing(false)
    if (next && next !== ticket.priority) {
      onChange?.(ticket, next)
    }
  }

  return (
    <select
      ref={selectRef}
      value={ticket.priority}
      onChange={handleChange}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setEditing(false)
      }}
      className="text-xs border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
    >
      {TICKET_PRIORITIES.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  )
}

export function InlineAssigneeCell({ ticket, assignees, onChange }) {
  const [editing, setEditing] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    if (editing) selectRef.current?.focus()
  }, [editing])

  if (!editing) {
    const name = ticket.assignedTo?.name
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group inline-flex items-center gap-1 text-left rounded px-2 py-1 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
        title={name ? `Click to reassign (currently ${name})` : 'Click to assign'}
      >
        {name ? (
          <span className="text-sm text-slate-700">{name}</span>
        ) : (
          <span className="text-xs italic text-slate-400">Unassigned</span>
        )}
        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
      </button>
    )
  }

  const handleChange = (e) => {
    const raw = e.target.value
    setEditing(false)
    const next = raw ? Number(raw) : null
    const current = ticket.assigned_to_user_id ?? null
    if (next !== current) {
      onChange?.(ticket, next)
    }
  }

  return (
    <select
      ref={selectRef}
      value={ticket.assigned_to_user_id || ''}
      onChange={handleChange}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setEditing(false)
      }}
      className="text-xs border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
    >
      <option value="">Unassigned</option>
      {assignees.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  )
}

export function InlineDueDateCell({ ticket, onChange }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.showPicker?.()
    }
  }, [editing])

  const currentValue = ticket.due_date ? String(ticket.due_date).slice(0, 10) : ''
  const isOverdue =
    ticket.due_date &&
    !['Resolved', 'Closed', 'Cancelled'].includes(ticket.status) &&
    new Date(ticket.due_date) < new Date(new Date().toDateString())

  if (!editing) {
    const formatted = formatDueDate(ticket.due_date)
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`group inline-flex items-center gap-1 text-left rounded px-2 py-1 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors ${
          isOverdue ? 'text-red-600 font-semibold' : 'text-slate-700'
        }`}
        title={formatted ? 'Click to change due date' : 'Click to set a due date'}
      >
        <CalendarDays className="w-3.5 h-3.5 opacity-70" />
        {formatted ? (
          <span className="text-sm">{formatted}</span>
        ) : (
          <span className="text-xs italic text-slate-400">Set due date</span>
        )}
      </button>
    )
  }

  const commit = (raw) => {
    setEditing(false)
    const next = raw || null
    const current = currentValue || null
    if (next !== current) {
      onChange?.(ticket, next)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="date"
        defaultValue={currentValue}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setEditing(false)
        }}
        className="text-xs border border-slate-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
      />
      {currentValue && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => commit('')}
          className="text-xs text-red-600 hover:underline px-1"
          title="Clear due date"
        >
          Clear
        </button>
      )}
    </div>
  )
}
