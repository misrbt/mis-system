import { Fragment, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  FileSpreadsheet,
  FileText,
  FileType,
  Printer,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Shield,
  UserCircle2,
  Globe,
  Settings,
} from 'lucide-react'
import {
  fetchHelpdeskAuditLogs,
  exportHelpdeskAuditLogs,
} from '../../services/helpdeskAuditLogService'
import {
  exportToPDF,
  exportToExcel,
  exportToWord,
  printReport,
} from '../../utils/helpdeskReportExport'

const ACTION_OPTIONS = [
  'ticket.created',
  'ticket.updated',
  'ticket.status_changed',
  'ticket.priority_changed',
  'ticket.assigned',
  'ticket.escalated',
  'ticket.deleted',
  'ticket.restored',
  'remark.added',
  'attachment.uploaded',
  'attachment.deleted',
  'satisfaction.submitted',
]

const ACTOR_TYPE_META = {
  user: { label: 'MIS', icon: Shield, cls: 'bg-indigo-100 text-indigo-700' },
  employee: { label: 'Employee', icon: UserCircle2, cls: 'bg-amber-100 text-amber-800' },
  public: { label: 'Public', icon: Globe, cls: 'bg-cyan-100 text-cyan-800' },
  system: { label: 'System', icon: Settings, cls: 'bg-slate-100 text-slate-700' },
}

function ActorBadge({ type, name }) {
  const meta = ACTOR_TYPE_META[type] ?? ACTOR_TYPE_META.system
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded ${meta.cls}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
      {name ? <span className="ml-1 font-normal text-slate-800">— {name}</span> : null}
    </span>
  )
}

function formatDiff(changes) {
  if (!changes || typeof changes !== 'object') return null
  const keys = Object.keys(changes)
  if (keys.length === 0) return null
  return keys.map((k) => {
    const c = changes[k]
    return `${k}: ${c?.old ?? '∅'} → ${c?.new ?? '∅'}`
  }).join(' · ')
}

function ExpandRow({ log }) {
  return (
    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs space-y-2">
      {log.changes ? (
        <div>
          <div className="font-semibold text-slate-700 mb-1">Field changes</div>
          <pre className="whitespace-pre-wrap text-slate-700 bg-white border border-slate-200 rounded p-2">{JSON.stringify(log.changes, null, 2)}</pre>
        </div>
      ) : null}
      {log.metadata ? (
        <div>
          <div className="font-semibold text-slate-700 mb-1">Metadata</div>
          <pre className="whitespace-pre-wrap text-slate-700 bg-white border border-slate-200 rounded p-2">{JSON.stringify(log.metadata, null, 2)}</pre>
        </div>
      ) : null}
      {log.user_agent ? (
        <div>
          <span className="font-semibold text-slate-700">User agent:</span>{' '}
          <span className="text-slate-600 break-all">{log.user_agent}</span>
        </div>
      ) : null}
    </div>
  )
}

function HelpdeskAuditLogs() {
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [actorType, setActorType] = useState('')
  const [ticketNumber, setTicketNumber] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const params = useMemo(() => {
    const p = {}
    if (search) p.search = search
    if (action) p.action = action
    if (actorType) p.actor_type = actorType
    if (ticketNumber) p.ticket_number = ticketNumber
    if (dateFrom) p.date_from = dateFrom
    if (dateTo) p.date_to = dateTo
    p.per_page = 100
    return p
  }, [search, action, actorType, ticketNumber, dateFrom, dateTo])

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['helpdesk-audit-logs', params],
    queryFn: async () => (await fetchHelpdeskAuditLogs(params)).data,
  })

  const logs = data?.data || []

  const clearFilters = () => {
    setSearch('')
    setAction('')
    setActorType('')
    setTicketNumber('')
    setDateFrom('')
    setDateTo('')
  }

  const buildSections = async () => {
    // Pull the full filtered set for export (not just the current page).
    const res = await exportHelpdeskAuditLogs({ ...params, per_page: undefined })
    const rows = (res.data?.data || []).map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.action,
      (ACTOR_TYPE_META[log.actor_type]?.label || log.actor_type) + (log.actor_name ? ` — ${log.actor_name}` : ''),
      log.ticket_number || '',
      log.ip_address || '',
      formatDiff(log.changes) || '',
    ])
    return [
      {
        heading: 'Helpdesk Audit Logs',
        columns: ['Timestamp', 'Action', 'Actor', 'Ticket #', 'IP', 'Changes'],
        rows,
      },
    ]
  }

  const handleExport = async (format) => {
    const sections = await buildSections()
    const meta = {
      title: 'Helpdesk Audit Logs',
      dateRange: { from: dateFrom || 'earliest', to: dateTo || 'latest' },
    }
    if (format === 'pdf') exportToPDF(sections, meta)
    else if (format === 'xlsx') exportToExcel(sections, meta)
    else if (format === 'docx') await exportToWord(sections, meta)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Helpdesk Audit Logs</h1>
          <p className="text-sm text-slate-600">Every helpdesk mutation, attributed to a user, employee, or public caller.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Search</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Actor, action, ticket #"
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All actions</option>
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Actor type</label>
            <select
              value={actorType}
              onChange={(e) => setActorType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All</option>
              <option value="user">MIS user</option>
              <option value="employee">Employee</option>
              <option value="public">Public</option>
              <option value="system">System</option>
            </select>
          </div>
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
        </div>
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={clearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear filters
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('xlsx')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100"
            >
              <FileType className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
            >
              <FileText className="w-4 h-4" />
              Word
            </button>
            <button
              onClick={printReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-xs uppercase text-slate-500">
                <th className="px-4 py-2 text-left w-8"></th>
                <th className="px-4 py-2 text-left">Timestamp</th>
                <th className="px-4 py-2 text-left">Actor</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Ticket #</th>
                <th className="px-4 py-2 text-left">IP</th>
                <th className="px-4 py-2 text-left">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">No audit entries match the current filters.</td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isOpen = expandedId === log.id
                  return (
                    <Fragment key={log.id}>
                      <tr className="hover:bg-slate-50">
                        <td className="px-2 py-2 align-top">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isOpen ? null : log.id)}
                            className="p-1 rounded hover:bg-slate-100"
                            aria-label={isOpen ? 'Collapse' : 'Expand'}
                          >
                            {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-600 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <ActorBadge type={log.actor_type} name={log.actor_name} />
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-slate-800">{log.action}</td>
                        <td className="px-4 py-2 font-mono text-xs text-indigo-700">{log.ticket_number || '—'}</td>
                        <td className="px-4 py-2 text-xs text-slate-500">{log.ip_address || '—'}</td>
                        <td className="px-4 py-2 text-xs text-slate-600 max-w-md truncate">{formatDiff(log.changes) || '—'}</td>
                      </tr>
                      {isOpen ? (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <ExpandRow log={log} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default HelpdeskAuditLogs
