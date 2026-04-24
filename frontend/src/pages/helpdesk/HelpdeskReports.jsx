import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  FileSpreadsheet,
  FileText,
  FileType,
  Printer,
  RefreshCw,
  Ticket as TicketIcon,
  Clock,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Star,
} from 'lucide-react'
import {
  fetchHelpdeskSummary,
  fetchTopRequesters,
  fetchTopResolvers,
  fetchHelpdeskBreakdowns,
  fetchHelpdeskVolumeTrend,
  fetchHelpdeskDetailedTickets,
} from '../../services/helpdeskReportService'
import {
  exportToPDF,
  exportToExcel,
  exportToWord,
  printReport,
} from '../../utils/helpdeskReportExport'

function monthStart() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
function monthEnd() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
}

function KPI({ label, value, icon: Icon, tone = 'slate', suffix }) {
  const toneMap = {
    slate: 'text-slate-600',
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  }
  const cls = toneMap[tone] || toneMap.slate
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-600">{label}</p>
          <p className={`text-2xl font-bold ${cls}`}>
            {value ?? 0}
            {suffix ? <span className="text-sm font-semibold text-slate-400 ml-1">{suffix}</span> : null}
          </p>
        </div>
        {Icon ? <Icon className={`w-8 h-8 opacity-70 ${cls}`} /> : null}
      </div>
    </div>
  )
}

function DataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-xs uppercase text-slate-500">
            {columns.map((c) => (
              <th key={c} className="px-4 py-2 text-left">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-6 text-center text-slate-400 italic">No data</td></tr>
          ) : rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              {row.map((cell, i) => (
                <td key={i} className="px-4 py-2 text-slate-700">{cell ?? '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HelpdeskReports() {
  const [dateFrom, setDateFrom] = useState(monthStart())
  const [dateTo, setDateTo] = useState(monthEnd())
  const [generation, setGeneration] = useState(0)

  const params = useMemo(
    () => ({ date_from: dateFrom, date_to: dateTo, _v: generation }),
    [dateFrom, dateTo, generation]
  )

  const { data: summary } = useQuery({
    queryKey: ['hd-report-summary', params],
    queryFn: async () => (await fetchHelpdeskSummary(params)).data?.data,
  })
  const { data: topReq = [] } = useQuery({
    queryKey: ['hd-report-top-requesters', params],
    queryFn: async () => (await fetchTopRequesters(params)).data?.data || [],
  })
  const { data: topRes = [] } = useQuery({
    queryKey: ['hd-report-top-resolvers', params],
    queryFn: async () => (await fetchTopResolvers(params)).data?.data || [],
  })
  const { data: breakdowns } = useQuery({
    queryKey: ['hd-report-breakdowns', params],
    queryFn: async () => (await fetchHelpdeskBreakdowns(params)).data?.data,
  })
  const { data: volume = [] } = useQuery({
    queryKey: ['hd-report-volume', params],
    queryFn: async () => (await fetchHelpdeskVolumeTrend(params)).data?.data || [],
  })
  const { data: tickets = [] } = useQuery({
    queryKey: ['hd-report-tickets', params],
    queryFn: async () => {
      const res = await fetchHelpdeskDetailedTickets({ ...params, all: true })
      return res.data?.data || []
    },
  })

  const fmtMins = (m) => (m == null ? '—' : `${Math.round(Number(m))} min`)

  // Build the shared sections array used for all three export formats.
  const buildSections = () => {
    const kpiRows = [
      ['Total', summary?.total ?? 0],
      ['Open', summary?.open ?? 0],
      ['In Progress', summary?.in_progress ?? 0],
      ['Pending', summary?.pending ?? 0],
      ['Resolved', summary?.resolved ?? 0],
      ['Closed', summary?.closed ?? 0],
      ['Cancelled', summary?.cancelled ?? 0],
      ['Overdue', summary?.overdue ?? 0],
      ['Unassigned', summary?.unassigned ?? 0],
      ['Avg first response', fmtMins(summary?.avg_first_response_minutes)],
      ['Avg resolution', fmtMins(summary?.avg_resolution_minutes)],
      ['Satisfaction avg', summary?.satisfaction_avg ?? '—'],
      ['Satisfaction responses', summary?.satisfaction_count ?? 0],
    ]

    const requesterRows = topReq.map((r, i) => [
      i + 1,
      r.employee_name,
      r.branch || '—',
      r.section || '—',
      r.total,
      r.open,
      r.resolved,
      fmtMins(r.avg_resolution_minutes),
    ])

    const resolverRows = topRes.map((r, i) => [
      i + 1,
      r.user_name,
      r.total,
      r.resolved,
      fmtMins(r.avg_first_response_minutes),
      fmtMins(r.avg_resolution_minutes),
      r.overdue_count,
      r.satisfaction_avg ?? '—',
    ])

    const toPairs = (o) => Object.entries(o || {}).map(([k, v]) => [k, v])

    const ticketRows = tickets.map((t) => [
      t.ticket_number,
      t.title,
      t.requester?.fullname || '—',
      t.category?.name || '—',
      t.priority,
      t.status,
      t.assignedTo?.name || '—',
      t.due_date || '—',
      t.created_at ? new Date(t.created_at).toLocaleDateString() : '—',
    ])

    return [
      { heading: 'Summary KPIs', columns: ['Metric', 'Value'], rows: kpiRows },
      {
        heading: 'Top Requesters',
        columns: ['#', 'Employee', 'Branch', 'Section', 'Total', 'Open', 'Resolved', 'Avg Resolution'],
        rows: requesterRows,
      },
      {
        heading: 'Top Resolvers (IT)',
        columns: ['#', 'Agent', 'Handled', 'Resolved', 'Avg First Response', 'Avg Resolution', 'Overdue', 'Satisfaction'],
        rows: resolverRows,
      },
      {
        heading: 'Breakdown by Status',
        columns: ['Status', 'Count'],
        rows: toPairs(breakdowns?.by_status),
      },
      {
        heading: 'Breakdown by Priority',
        columns: ['Priority', 'Count'],
        rows: toPairs(breakdowns?.by_priority),
      },
      {
        heading: 'Breakdown by Category',
        columns: ['Category', 'Count'],
        rows: toPairs(breakdowns?.by_category),
      },
      {
        heading: 'Breakdown by Branch',
        columns: ['Branch', 'Count'],
        rows: toPairs(breakdowns?.by_branch),
      },
      {
        heading: 'Detailed Tickets',
        columns: ['Ticket #', 'Title', 'Requester', 'Category', 'Priority', 'Status', 'Assignee', 'Due', 'Created'],
        rows: ticketRows,
      },
    ]
  }

  const handleExport = async (format) => {
    const sections = buildSections()
    const meta = {
      title: 'Helpdesk Report',
      dateRange: { from: dateFrom, to: dateTo },
    }
    if (format === 'pdf') exportToPDF(sections, meta)
    else if (format === 'xlsx') exportToExcel(sections, meta)
    else if (format === 'docx') await exportToWord(sections, meta)
  }

  const chartify = (obj) => Object.entries(obj || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Helpdesk Reports</h1>
          <p className="text-sm text-slate-600">Summary, leaderboards, breakdowns, and trends. Export for records.</p>
        </div>
      </div>

      {/* Filter + export bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm no-print">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-slate-600">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={() => setGeneration((g) => g + 1)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <RefreshCw className="w-4 h-4" />
            Generate
          </button>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleExport('xlsx')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100"
            >
              <FileType className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
            >
              <FileText className="w-4 h-4" /> Word
            </button>
            <button
              onClick={printReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KPI label="Total" value={summary?.total} icon={TicketIcon} tone="indigo" />
        <KPI label="Open" value={summary?.open} icon={TicketIcon} tone="slate" />
        <KPI label="In Progress" value={summary?.in_progress} icon={Clock} tone="blue" />
        <KPI label="Resolved" value={summary?.resolved} icon={CheckCircle2} tone="emerald" />
        <KPI label="Overdue" value={summary?.overdue} icon={AlertTriangle} tone="red" />
        <KPI label="Avg 1st Reply" value={summary?.avg_first_response_minutes ? Math.round(summary.avg_first_response_minutes) : 0} suffix="min" icon={Timer} tone="amber" />
        <KPI label="Avg Resolution" value={summary?.avg_resolution_minutes ? Math.round(summary.avg_resolution_minutes) : 0} suffix="min" icon={Timer} tone="blue" />
        <KPI label="Satisfaction" value={summary?.satisfaction_avg ?? '—'} suffix={summary?.satisfaction_count ? `(${summary.satisfaction_count})` : undefined} icon={Star} tone="yellow" />
      </div>

      {/* Trend chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-2">Volume Trend</h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={volume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#6366f1" name="Created" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          ['Status', breakdowns?.by_status],
          ['Priority', breakdowns?.by_priority],
          ['Category', breakdowns?.by_category],
          ['Branch', breakdowns?.by_branch],
        ].map(([label, data]) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-2">By {label}</h2>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={chartify(data)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Top Requesters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Top Requesters</h2>
          <p className="text-xs text-slate-500">Employees who submitted the most tickets in the selected range.</p>
        </div>
        <DataTable
          columns={['#', 'Employee', 'Branch', 'Section', 'Total', 'Open', 'Resolved', 'Avg Resolution']}
          rows={topReq.map((r, i) => [
            i + 1,
            r.employee_name,
            r.branch || '—',
            r.section || '—',
            r.total,
            r.open,
            r.resolved,
            fmtMins(r.avg_resolution_minutes),
          ])}
        />
      </div>

      {/* Top Resolvers */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Top Resolvers (IT)</h2>
          <p className="text-xs text-slate-500">IT agents ranked by tickets handled.</p>
        </div>
        <DataTable
          columns={['#', 'Agent', 'Handled', 'Resolved', 'Avg 1st Reply', 'Avg Resolution', 'Overdue', 'Satisfaction']}
          rows={topRes.map((r, i) => [
            i + 1,
            r.user_name,
            r.total,
            r.resolved,
            fmtMins(r.avg_first_response_minutes),
            fmtMins(r.avg_resolution_minutes),
            r.overdue_count,
            r.satisfaction_avg ?? '—',
          ])}
        />
      </div>

      {/* Detailed ticket list */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Detailed Tickets</h2>
          <p className="text-xs text-slate-500">Every ticket created in the selected range.</p>
        </div>
        <DataTable
          columns={['Ticket #', 'Title', 'Requester', 'Category', 'Priority', 'Status', 'Assignee', 'Due', 'Created']}
          rows={tickets.map((t) => [
            t.ticket_number,
            t.title,
            t.requester?.fullname || '—',
            t.category?.name || '—',
            t.priority,
            t.status,
            t.assignedTo?.name || '—',
            t.due_date || '—',
            t.created_at ? new Date(t.created_at).toLocaleDateString() : '—',
          ])}
        />
      </div>
    </div>
  )
}

export default HelpdeskReports
