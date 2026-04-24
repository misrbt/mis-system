import { PRIORITY_STYLES } from './ticketConstants'

function TicketPriorityBadge({ priority }) {
  const cls = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {priority}
    </span>
  )
}

export default TicketPriorityBadge
