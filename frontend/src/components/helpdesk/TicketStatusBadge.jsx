import { STATUS_STYLES } from './ticketConstants'

function TicketStatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || STATUS_STYLES.Open
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="leading-none">{status}</span>
    </span>
  )
}

export default TicketStatusBadge
