import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import {
  ArrowRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  Repeat,
  Users,
  Trophy,
  UserCheck,
  Calendar,
  Eye,
  Building2,
} from 'lucide-react'
import TicketStatsCards from '../../components/helpdesk/TicketStatsCards'
import TicketStatusBadge from '../../components/helpdesk/TicketStatusBadge'
import TicketPriorityBadge from '../../components/helpdesk/TicketPriorityBadge'
import { fetchTickets, fetchTicketStatistics } from '../../services/ticketService'
import {
  fetchHelpdeskSummary,
  fetchHelpdeskVolumeTrend,
  fetchHelpdeskBreakdowns,
  fetchTopRequesters,
  fetchTopResolvers,
  fetchHelpdeskWorkload,
  fetchRecurringIssues,
  fetchTicketsByBranch,
  fetchBranchesWithRequesters,
} from '../../services/helpdeskReportService'
import { useAuth } from '../../context/AuthContext'

const RANGE_OPTIONS = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: '90d', label: 'Last 90 Days' },
]

function resolveRange(id) {
  const today = new Date()
  const iso = (d) => d.toISOString().slice(0, 10)
  if (id === 'week') {
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay())
    return { from: iso(start), to: iso(today) }
  }
  if (id === '90d') {
    const start = new Date(today)
    start.setDate(today.getDate() - 89)
    return { from: iso(start), to: iso(today) }
  }
  // month (default)
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  return { from: iso(start), to: iso(today) }
}

function normalizeList(raw) {
  if (!raw) return []
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

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

function fmtMins(value) {
  if (value == null) return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (n < 60) return `${Math.round(n)} min`
  const hrs = n / 60
  if (hrs < 24) return `${hrs.toFixed(1)} h`
  return `${(hrs / 24).toFixed(1)} d`
}

function TicketRow({ ticket }) {
  return (
    <Link
      to={`/helpdesk/tickets/${ticket.id}`}
      className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-indigo-700">
            {ticket.ticket_number}
          </span>
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
        </div>
        <div className="text-sm text-slate-800 font-medium mt-1 truncate">{ticket.title}</div>
        <div className="text-xs text-slate-500">
          {ticket.requester?.fullname || 'Unknown requester'} · {formatDate(ticket.created_at)}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
    </Link>
  )
}

/** Compact SLA strip — two numbers with units + subtitle. */
function SlaTile({ label, value, hint, tone = 'slate' }) {
  const toneMap = {
    indigo: 'text-indigo-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    slate: 'text-slate-600',
  }
  return (
    <div className="flex-1 min-w-0 p-3 bg-white rounded-lg border border-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-bold ${toneMap[tone] || toneMap.slate}`}>{value}</p>
      {hint ? <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p> : null}
    </div>
  )
}

function HelpdeskDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rangeId, setRangeId] = useState('month')
  const range = useMemo(() => resolveRange(rangeId), [rangeId])
  const rangeParams = useMemo(
    () => ({ date_from: range.from, date_to: range.to }),
    [range]
  )

  // --- Core KPIs (all-time, clickable cards keep working) ---
  const { data: stats } = useQuery({
    queryKey: ['ticket-statistics'],
    queryFn: async () => (await fetchTicketStatistics()).data?.data,
  })

  // --- Period-scoped summary (SLA + satisfaction for the selected range) ---
  const { data: periodSummary } = useQuery({
    queryKey: ['hd-dashboard-summary', rangeParams],
    queryFn: async () => (await fetchHelpdeskSummary(rangeParams)).data?.data,
  })

  // --- Period breakdowns (priority, category) ---
  const { data: breakdowns } = useQuery({
    queryKey: ['hd-dashboard-breakdowns', rangeParams],
    queryFn: async () => (await fetchHelpdeskBreakdowns(rangeParams)).data?.data,
  })

  // --- Volume trend ---
  const { data: volume = [] } = useQuery({
    queryKey: ['hd-dashboard-volume', rangeParams],
    queryFn: async () => (await fetchHelpdeskVolumeTrend(rangeParams)).data?.data || [],
  })

  // --- Workload (current, not period-scoped) ---
  const { data: workload = [] } = useQuery({
    queryKey: ['hd-dashboard-workload'],
    queryFn: async () => (await fetchHelpdeskWorkload()).data?.data || [],
  })

  // --- Top requesters / resolvers (period-scoped, both clickable) ---
  const { data: topReq = [] } = useQuery({
    queryKey: ['hd-dashboard-top-req', rangeParams],
    queryFn: async () => (await fetchTopRequesters({ ...rangeParams, limit: 8 })).data?.data || [],
  })
  const { data: topRes = [] } = useQuery({
    queryKey: ['hd-dashboard-top-res', rangeParams],
    queryFn: async () => (await fetchTopResolvers({ ...rangeParams, limit: 8 })).data?.data || [],
  })

  // --- Recurring issues (always 90-day default, fixed window) ---
  const { data: recurring = [] } = useQuery({
    queryKey: ['hd-dashboard-recurring'],
    queryFn: async () => (await fetchRecurringIssues({ days: 90, threshold: 3 })).data?.data || [],
  })

  // --- Tickets per branch (period-scoped) ---
  const { data: byBranch = [] } = useQuery({
    queryKey: ['hd-dashboard-by-branch', rangeParams],
    queryFn: async () => (await fetchTicketsByBranch(rangeParams)).data?.data || [],
  })

  // --- Branches with their top requesters (period-scoped) ---
  const { data: branchesDetail = [] } = useQuery({
    queryKey: ['hd-dashboard-branches-detail', rangeParams],
    queryFn: async () =>
      (await fetchBranchesWithRequesters({ ...rangeParams, per_branch: 5, limit: 15 })).data
        ?.data || [],
  })

  const byBranchChart = useMemo(
    () =>
      byBranch.map((b) => ({
        id: b.branch_id,
        name: b.branch_name || '(No branch)',
        open: Number(b.open) || 0,
        in_progress: Number(b.in_progress) || 0,
        pending: Number(b.pending) || 0,
        resolved: Number(b.resolved) || 0,
        closed: Number(b.closed) || 0,
        cancelled: Number(b.cancelled) || 0,
        total: Number(b.total) || 0,
      })),
    [byBranch]
  )
  const byBranchTotal = useMemo(
    () => byBranchChart.reduce((acc, b) => acc + b.total, 0),
    [byBranchChart]
  )

  // --- Recent + Mine (existing) ---
  const { data: recentRaw, isLoading: loadingRecent } = useQuery({
    queryKey: ['tickets', 'recent'],
    queryFn: async () =>
      (await fetchTickets({ all: true, sort_by: 'created_at', sort_order: 'desc' })).data,
  })
  const { data: mineRaw, isLoading: loadingMine } = useQuery({
    queryKey: ['tickets', 'mine', user?.id],
    queryFn: async () =>
      (
        await fetchTickets({
          all: true,
          assigned_to_user_id: user?.id,
          sort_by: 'due_date',
          sort_order: 'asc',
        })
      ).data,
    enabled: Boolean(user?.id),
  })

  const recent = useMemo(() => normalizeList(recentRaw).slice(0, 8), [recentRaw])
  const mine = useMemo(
    () =>
      normalizeList(mineRaw)
        .filter((t) => !['Resolved', 'Closed', 'Cancelled'].includes(t.status))
        .slice(0, 8),
    [mineRaw]
  )

  const priorityChart = useMemo(() => {
    const order = ['Urgent', 'High', 'Medium', 'Low']
    const src = breakdowns?.by_priority || {}
    return order.map((name) => ({ name, value: Number(src[name] || 0) }))
  }, [breakdowns])

  // Total workload for percent bars
  const workloadTotal = useMemo(
    () => workload.reduce((acc, w) => acc + (w.active || 0), 0),
    [workload]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Helpdesk Dashboard</h1>
          <p className="text-sm text-slate-600">
            End-user concerns, SLA health, and IT workload — at a glance.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRangeId(opt.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                rangeId === opt.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clickable KPI cards (all-time counts) */}
      <TicketStatsCards stats={stats} />

      {/* Period-scoped SLA strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SlaTile
          label="Created this period"
          value={periodSummary?.total ?? 0}
          hint={`${range.from} → ${range.to}`}
          tone="indigo"
        />
        <SlaTile
          label="Avg first response"
          value={fmtMins(periodSummary?.avg_first_response_minutes)}
          hint="Time to first IT reply"
          tone="amber"
        />
        <SlaTile
          label="Avg resolution"
          value={fmtMins(periodSummary?.avg_resolution_minutes)}
          hint="Open → Resolved"
          tone="emerald"
        />
        <SlaTile
          label="Satisfaction"
          value={
            periodSummary?.satisfaction_avg
              ? `${periodSummary.satisfaction_avg} / 5`
              : '—'
          }
          hint={
            periodSummary?.satisfaction_count
              ? `${periodSummary.satisfaction_count} ratings`
              : 'No ratings yet'
          }
          tone="indigo"
        />
      </div>

      {/* Volume trend + Priority mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Ticket Volume</h2>
            </div>
            <Link
              to={`/helpdesk/reports`}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              See full report →
            </Link>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={volume}>
                <defs>
                  <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="#6366f1"
                  fill="url(#created)"
                  name="Created"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  fill="url(#resolved)"
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Priority Mix</h2>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={priorityChart} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={70} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Click a priority on the reports page to drill into specific tickets.
          </p>
        </div>
      </div>

      {/* Tickets by Branch — stacked by status. Every branch listed. */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Tickets by Branch</h2>
          </div>
          <span className="text-[11px] text-slate-500">
            {byBranchTotal} {byBranchTotal === 1 ? 'ticket' : 'tickets'} · {range.from} → {range.to}
          </span>
        </div>
        {byBranchChart.length === 0 ? (
          <div className="py-6 text-sm text-slate-500 italic text-center">
            No branches found.
          </div>
        ) : (
          <>
            {/* Compact fixed height (scrollable if many branches) so the
                list card below stays visible without scrolling. */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: 280 }}
            >
              <div style={{ width: '100%', height: Math.max(180, byBranchChart.length * 22 + 30) }}>
                <ResponsiveContainer>
                  <BarChart
                    data={byBranchChart}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                    barCategoryGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      fontSize={10}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#64748b"
                      fontSize={10}
                      width={130}
                      tickFormatter={(v) => (v?.length > 18 ? `${v.slice(0, 17)}…` : v)}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} ticket${value === 1 ? '' : 's'}`,
                        name,
                      ]}
                      cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                    <Bar
                      dataKey="open"
                      name="Open"
                      stackId="a"
                      fill="#64748b"
                      cursor="pointer"
                      onClick={(p) =>
                        p?.id &&
                        navigate(`/helpdesk/tickets?branch_id=${p.id}&status=Open`)
                      }
                    />
                    <Bar
                      dataKey="in_progress"
                      name="In Progress"
                      stackId="a"
                      fill="#3b82f6"
                      cursor="pointer"
                      onClick={(p) =>
                        p?.id &&
                        navigate(
                          `/helpdesk/tickets?branch_id=${p.id}&status=In+Progress`
                        )
                      }
                    />
                    <Bar
                      dataKey="pending"
                      name="Pending"
                      stackId="a"
                      fill="#f59e0b"
                      cursor="pointer"
                      onClick={(p) =>
                        p?.id &&
                        navigate(`/helpdesk/tickets?branch_id=${p.id}&status=Pending`)
                      }
                    />
                    <Bar
                      dataKey="resolved"
                      name="Resolved"
                      stackId="a"
                      fill="#10b981"
                      cursor="pointer"
                      onClick={(p) =>
                        p?.id &&
                        navigate(`/helpdesk/tickets?branch_id=${p.id}&status=Resolved`)
                      }
                    />
                    <Bar
                      dataKey="closed"
                      name="Closed"
                      stackId="a"
                      fill="#6b7280"
                      radius={[0, 4, 4, 0]}
                      cursor="pointer"
                      onClick={(p) =>
                        p?.id &&
                        navigate(`/helpdesk/tickets?branch_id=${p.id}&status=Closed`)
                      }
                    />
                    <Bar
                      dataKey="cancelled"
                      name="Cancelled"
                      stackId="a"
                      fill="#ef4444"
                      cursor="pointer"
                      onClick={(p) =>
                        p?.id &&
                        navigate(
                          `/helpdesk/tickets?branch_id=${p.id}&status=Cancelled`
                        )
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Click a segment to open that branch's tickets for that status.
            </p>
          </>
        )}
      </div>

      {/* Branches → Top Requesters drill-down */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Branches & Their Top Requesters</h2>
          </div>
          <span className="text-[11px] text-slate-500">Who is raising concerns where</span>
        </div>
        {branchesDetail.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500 italic">
            No tickets from any branch in this period.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {branchesDetail.map((branch) => {
              const branchKey = branch.branch_id ?? 'null'
              const maxInBranch = Math.max(
                1,
                ...(branch.top_requesters || []).map((r) => r.count)
              )
              return (
                <li key={branchKey} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (branch.branch_id) {
                          navigate(`/helpdesk/tickets?branch_id=${branch.branch_id}`)
                        }
                      }}
                      disabled={!branch.branch_id}
                      className="flex items-center gap-2 text-left disabled:cursor-default"
                    >
                      <span className="inline-flex items-center justify-center min-w-[2.25rem] h-8 px-2 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                        {branch.total}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 hover:text-indigo-700 transition-colors">
                          {branch.branch_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {branch.active_employees}{' '}
                          {branch.active_employees === 1 ? 'employee' : 'employees'} submitted
                          tickets
                        </div>
                      </div>
                    </button>
                  </div>
                  {branch.top_requesters?.length > 0 ? (
                    <ul className="space-y-1.5 ml-11">
                      {branch.top_requesters.map((req, idx) => {
                        const pct = Math.round((req.count / maxInBranch) * 100)
                        return (
                          <li key={req.employee_id}>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/helpdesk/tickets?requester_employee_id=${req.employee_id}`
                                )
                              }
                              className="w-full text-left group"
                            >
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="flex items-center gap-2 min-w-0">
                                  <span className="text-slate-400 font-mono w-4">{idx + 1}.</span>
                                  <span className="text-slate-700 group-hover:text-indigo-700 truncate font-medium">
                                    {req.employee_name}
                                  </span>
                                </span>
                                <span className="font-semibold text-indigo-700 shrink-0">
                                  {req.count}
                                </span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-6">
                                <div
                                  className="h-full bg-indigo-400 group-hover:bg-indigo-600 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic ml-11">
                      No requesters in this branch.
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Workload + Recurring Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Workload */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Active Workload by Assignee</h2>
            </div>
            <span className="text-xs text-slate-500">
              {workloadTotal} active {workloadTotal === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>
          {workload.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500 italic">Nobody is holding active tickets right now.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {workload.map((w) => {
                const pct = workloadTotal > 0 ? Math.round((w.active / workloadTotal) * 100) : 0
                return (
                  <li key={w.user_id}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/helpdesk/tickets?assigned_to_user_id=${w.user_id}`)
                      }
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-slate-800 truncate">{w.user_name}</span>
                          {w.overdue > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                              <AlertTriangle className="w-3 h-3" />
                              {w.overdue} overdue
                            </span>
                          ) : null}
                        </div>
                        <span className="text-xs font-semibold text-indigo-700">{w.active} active</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                        <span>
                          {w.open} open · {w.in_progress} in progress · {w.pending} pending
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          oldest {w.oldest_days}d
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Recurring Issues — the bridge to inventory/repair */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-amber-50">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Recurring Concerns (last 90 days)</h2>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Possible repair candidates</span>
          </div>
          {recurring.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500 italic">
              No user has raised the same category 3+ times in the last 90 days.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {recurring.slice(0, 10).map((r) => (
                <li key={`${r.requester_employee_id}-${r.category_id}`}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/helpdesk/tickets?requester_employee_id=${r.requester_employee_id}&category_id=${r.category_id}`
                      )
                    }
                    className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
                          {r.count}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate">{r.requester_name}</div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {r.category} · {r.branch || '—'}
                          </div>
                        </div>
                      </div>
                      {r.open_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                          {r.open_count} open
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        First: {formatDate(r.first_seen)} · Last: {formatDate(r.last_seen)}
                      </span>
                      <span className="font-mono text-indigo-700 truncate max-w-xs">
                        {r.ticket_numbers?.slice(0, 3).join(' · ')}
                        {r.ticket_numbers?.length > 3 ? ' …' : ''}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top Requesters + Top Resolvers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Top Requesters</h2>
            </div>
            <span className="text-[11px] text-slate-500">{range.from} → {range.to}</span>
          </div>
          {topReq.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500 italic">No tickets created in this period.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {topReq.map((r, idx) => (
                <li key={r.employee_id ?? idx}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/helpdesk/tickets?requester_employee_id=${r.employee_id}`)
                    }
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{r.employee_name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {r.branch || '—'} · {r.section || '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] shrink-0">
                      <span className="text-slate-500">
                        {r.open} open · {r.resolved} resolved
                      </span>
                      <span className="font-semibold text-indigo-700">{r.total}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Top Troubleshooters</h2>
            </div>
            <span className="text-[11px] text-slate-500">Most tickets fixed in the period</span>
          </div>
          {topRes.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500 italic">No resolutions yet in this period.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {topRes.map((r, idx) => (
                <li key={r.user_id ?? idx}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/helpdesk/tickets?assigned_to_user_id=${r.user_id}`)
                    }
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{r.user_name}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Avg resolve {fmtMins(r.avg_resolution_minutes)} · Satisfaction {r.satisfaction_avg ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] shrink-0">
                      <span className="text-slate-500">{r.resolved} resolved</span>
                      <span className="font-semibold text-emerald-700">{r.total}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Tickets + My Assigned (existing behavior, kept) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900">Recent Tickets</h2>
            </div>
            <Link
              to="/helpdesk/tickets"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </Link>
          </div>
          <div>
            {loadingRecent ? (
              <div className="px-4 py-6 text-sm text-slate-500">Loading...</div>
            ) : recent.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500 italic">No tickets yet.</div>
            ) : (
              recent.map((t) => <TicketRow key={t.id} ticket={t} />)
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900">My Assigned (Active)</h2>
            </div>
            <Link
              to="/helpdesk/tickets?assignee=me"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </Link>
          </div>
          <div>
            {loadingMine ? (
              <div className="px-4 py-6 text-sm text-slate-500">Loading...</div>
            ) : mine.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500 italic">Nothing assigned to you.</div>
            ) : (
              mine.map((t) => <TicketRow key={t.id} ticket={t} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpdeskDashboard
