import { Link } from 'react-router-dom'
import { Ticket, Inbox, Loader2, CheckCircle2, AlertCircle, UserMinus } from 'lucide-react'

const ACCENTS = {
  slate: 'text-slate-600',
  blue: 'text-blue-600',
  amber: 'text-amber-600',
  emerald: 'text-emerald-600',
  red: 'text-red-600',
  indigo: 'text-indigo-600',
}

function StatCard({ label, value, icon, color, to }) {
  const IconComp = icon
  const tone = ACCENTS[color] || ACCENTS.slate
  return (
    <Link
      to={to}
      className="group bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      title={`View ${label.toLowerCase()} tickets`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 group-hover:text-indigo-700 transition-colors">
            {label}
          </p>
          <p className={`text-2xl font-bold ${tone}`}>{value ?? 0}</p>
        </div>
        <IconComp className={`w-8 h-8 ${tone} opacity-80 group-hover:opacity-100 transition-opacity`} />
      </div>
    </Link>
  )
}

function TicketStatsCards({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard label="Total" value={stats?.total} icon={Ticket} color="indigo" to="/helpdesk/tickets" />
      <StatCard label="Open" value={stats?.open} icon={Inbox} color="slate" to="/helpdesk/tickets?status=Open" />
      <StatCard
        label="In Progress"
        value={stats?.in_progress}
        icon={Loader2}
        color="blue"
        to="/helpdesk/tickets?status=In+Progress"
      />
      <StatCard
        label="Resolved"
        value={stats?.resolved}
        icon={CheckCircle2}
        color="emerald"
        to="/helpdesk/tickets?status=Resolved"
      />
      <StatCard
        label="Overdue"
        value={stats?.overdue}
        icon={AlertCircle}
        color="red"
        to="/helpdesk/tickets?overdue=1"
      />
      <StatCard
        label="Unassigned"
        value={stats?.unassigned}
        icon={UserMinus}
        color="amber"
        to="/helpdesk/tickets?unassigned=1"
      />
    </div>
  )
}

export default TicketStatsCards
