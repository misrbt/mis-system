import { useMemo, useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { useTicketRealtime } from '../../hooks/useTicketRealtime'
import { ArrowLeft, Calendar, User, UserCheck, Tag, Phone, Monitor, ScrollText, ChevronDown, Send, Globe2, Pencil } from 'lucide-react'
import TicketStatusBadge from '../../components/helpdesk/TicketStatusBadge'
import { TICKET_STATUSES, TICKET_PRIORITIES } from '../../components/helpdesk/ticketConstants'
import TicketPriorityBadge from '../../components/helpdesk/TicketPriorityBadge'
import TicketRemarksPanel from '../../components/helpdesk/TicketRemarksPanel'
import TicketAttachmentsPanel from '../../components/helpdesk/TicketAttachmentsPanel'
import {
  fetchTicket,
  fetchTicketAssignees,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  addTicketRemark,
  uploadTicketAttachments,
  deleteTicketAttachment,
  fetchEscalationPreview,
  escalateTicket,
} from '../../services/ticketService'
import { fetchTicketAuditLog } from '../../services/helpdeskAuditLogService'

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

function formatDateTime(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function normalizeList(raw) {
  if (!raw) return []
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: ticketRes, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => (await fetchTicket(id)).data?.data,
  })

  const { data: assigneesRaw } = useQuery({
    queryKey: ['ticket-assignees'],
    queryFn: async () => (await fetchTicketAssignees()).data,
    staleTime: 5 * 60 * 1000,
  })

  const assignees = useMemo(() => normalizeList(assigneesRaw), [assigneesRaw])
  const ticket = ticketRes
  const [statusDraft, setStatusDraft] = useState('')
  const [resolutionDraft, setResolutionDraft] = useState('')
  const [auditOpen, setAuditOpen] = useState(false)
  const [isEditingPriority, setIsEditingPriority] = useState(false)

  const { data: auditLog = [] } = useQuery({
    queryKey: ['ticket-audit-log', id],
    queryFn: async () => (await fetchTicketAuditLog(id)).data?.data || [],
    enabled: auditOpen && Boolean(id),
  })

  // Realtime: refresh this ticket (including remarks/attachments) whenever
  // another browser adds a comment.
  const handleIncomingRemark = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['ticket', id] })
  }, [queryClient, id])
  const { connected: rtConnected } = useTicketRealtime(
    ticket?.ticket_number,
    handleIncomingRemark
  )

  // Polling fallback: if realtime is down, refetch every 4s so new comments
  // still appear with a small delay instead of requiring a manual refresh.
  useEffect(() => {
    if (!ticket?.ticket_number || rtConnected) return undefined
    const tId = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
    }, 4000)
    return () => window.clearInterval(tId)
  }, [ticket?.ticket_number, rtConnected, queryClient, id])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['ticket', id] })
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
    queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
  }

  const statusMutation = useMutation({
    mutationFn: (payload) => updateTicketStatus(id, payload),
    onSuccess: () => {
      invalidate()
      setStatusDraft('')
      setResolutionDraft('')
      Swal.fire({ icon: 'success', title: 'Status updated', timer: 1500, showConfirmButton: false })
    },
    onError: (e) =>
      Swal.fire({
        icon: 'error',
        title: 'Failed to update status',
        text: e.response?.data?.message || e.message,
      }),
  })

  const assignMutation = useMutation({
    mutationFn: (userId) => assignTicket(id, userId),
    onSuccess: () => {
      invalidate()
      Swal.fire({ icon: 'success', title: 'Assignee updated', timer: 1500, showConfirmButton: false })
    },
    onError: (e) =>
      Swal.fire({
        icon: 'error',
        title: 'Failed to assign',
        text: e.response?.data?.message || e.message,
      }),
  })

  const remarkMutation = useMutation({
    mutationFn: ({ text, attachments, isInternal }) =>
      addTicketRemark(id, text, 'general', attachments, Boolean(isInternal)),
    onSuccess: () => invalidate(),
    onError: (e) => {
      const apiErrors = e.response?.data?.errors
      const first = apiErrors ? Object.values(apiErrors)[0]?.[0] : null
      Swal.fire({
        icon: 'error',
        title: 'Failed to add remark',
        text: first || e.response?.data?.message || e.message,
      })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (files) => uploadTicketAttachments(id, files),
    onSuccess: () => {
      invalidate()
      Swal.fire({ icon: 'success', title: 'Uploaded', timer: 1500, showConfirmButton: false })
    },
    onError: (e) =>
      Swal.fire({
        icon: 'error',
        title: 'Upload failed',
        text: e.response?.data?.message || e.message,
      }),
  })

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId) => deleteTicketAttachment(id, attachmentId),
    onSuccess: () => invalidate(),
    onError: (e) =>
      Swal.fire({
        icon: 'error',
        title: 'Failed to delete attachment',
        text: e.response?.data?.message || e.message,
      }),
  })

  const priorityMutation = useMutation({
    mutationFn: (priority) => updateTicket(id, { priority }),
    onSuccess: (_res, newPriority) => {
      invalidate()
      setIsEditingPriority(false)
      Swal.fire({
        icon: 'success',
        title: `Priority set to ${newPriority}`,
        timer: 1400,
        showConfirmButton: false,
      })
    },
    onError: (e) => {
      setIsEditingPriority(false)
      Swal.fire({
        icon: 'error',
        title: 'Failed to update priority',
        text: e.response?.data?.message || e.message,
      })
    },
  })

  const handlePriorityChange = (e) => {
    const next = e.target.value
    if (next && next !== ticket.priority) {
      priorityMutation.mutate(next)
    } else {
      setIsEditingPriority(false)
    }
  }

  const escalateMutation = useMutation({
    mutationFn: () => escalateTicket(id),
    onSuccess: (res) => {
      invalidate()
      const count = res?.data?.data?.recipients?.length ?? 0
      Swal.fire({
        icon: 'success',
        title: 'Forwarded to the President',
        text: `Email sent to ${count} executive approver${count === 1 ? '' : 's'}.`,
        timer: 2200,
        showConfirmButton: false,
      })
    },
    onError: (e) =>
      Swal.fire({
        icon: 'error',
        title: 'Failed to forward ticket',
        text: e.response?.data?.message || e.message,
      }),
  })

  const handleEscalate = async () => {
    try {
      const { data } = await fetchEscalationPreview(id)
      const recipients = data?.data?.recipients || []

      if (recipients.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No global approver configured',
          html: 'Add at least one <strong>Global approver</strong> in <em>Helpdesk → Approvers</em> before you can forward tickets to executive review.',
        })
        return
      }

      const list = recipients
        .map(
          (r) =>
            `<li class="flex items-center gap-2 py-0.5"><span class="font-semibold">${r.name}</span><span class="text-slate-500 text-xs">${r.email}</span></li>`,
        )
        .join('')

      const result = await Swal.fire({
        icon: 'question',
        title: 'Forward to the President?',
        html: `
          <div class="text-left text-sm">
            <p class="mb-2 text-slate-700">The ticket details will be emailed to:</p>
            <ul class="list-none bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">${list}</ul>
            <p class="text-xs text-slate-500">This is informational — the ticket remains with the IT team. You can only do this once per ticket.</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Yes, forward now',
        confirmButtonColor: '#b45309',
        cancelButtonText: 'Cancel',
      })

      if (result.isConfirmed) {
        escalateMutation.mutate()
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Could not load recipient list',
        text: e.response?.data?.message || e.message,
      })
    }
  }

  const canEscalate =
    ['High', 'Urgent'].includes(ticket?.priority) && !ticket?.escalated_at

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        Loading ticket...
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        <Link to="/helpdesk/tickets" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          Ticket not found.
        </div>
      </div>
    )
  }

  const handleStatusSubmit = (e) => {
    e.preventDefault()
    if (!statusDraft) return
    const payload = { status: statusDraft }
    if (resolutionDraft.trim()) payload.resolution_summary = resolutionDraft.trim()
    statusMutation.mutate(payload)
  }

  const handleAssigneeChange = (e) => {
    const value = e.target.value
    assignMutation.mutate(value ? Number(value) : null)
  }

  const handleDeleteAttachment = async (att) => {
    const res = await Swal.fire({
      icon: 'warning',
      title: 'Delete attachment?',
      text: att.original_name,
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Delete',
    })
    if (res.isConfirmed) {
      deleteAttachmentMutation.mutate(att.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/helpdesk/tickets')}
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </button>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-indigo-700">
                {ticket.ticket_number}
              </span>
              <TicketStatusBadge status={ticket.status} />
              {isEditingPriority ? (
                <div className="inline-flex items-center gap-1">
                  <select
                    autoFocus
                    defaultValue={ticket.priority}
                    onChange={handlePriorityChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsEditingPriority(false)
                    }}
                    disabled={priorityMutation.isPending}
                    className="px-2.5 py-1 text-xs font-semibold rounded-full border border-indigo-400 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                  >
                    {TICKET_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsEditingPriority(false)}
                    disabled={priorityMutation.isPending}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingPriority(true)}
                  title="Click to change priority"
                  className="inline-flex items-center gap-1 cursor-pointer rounded-full ring-1 ring-transparent hover:ring-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                >
                  <TicketPriorityBadge priority={ticket.priority} />
                  <Pencil className="w-3 h-3 text-slate-400" />
                </button>
              )}
              <span className="text-xs text-slate-500">
                <Tag className="inline w-3 h-3 mr-0.5" />
                {ticket.category?.name || '—'}
              </span>
              {ticket.escalated_at && (
                <span
                  title={`Escalated to the President by ${ticket.escalatedBy?.name || 'MIS'} on ${formatDateTime(ticket.escalated_at)}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300"
                >
                  <Globe2 className="w-3 h-3" />
                  Escalated to President
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
            <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
              {ticket.description}
            </p>
            {ticket.priority_justification ? (
              <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wide text-amber-800 mb-1">
                  Priority justification
                </div>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">
                  {ticket.priority_justification}
                </p>
              </div>
            ) : null}
            {ticket.custom_fields && Object.keys(ticket.custom_fields).length > 0 ? (
              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                  Additional details
                </div>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  {Object.entries(ticket.custom_fields).map(([key, value]) => (
                    <div key={key} className="flex items-baseline gap-2">
                      <dt className="text-xs font-semibold text-slate-500 capitalize shrink-0">
                        {String(key).replace(/_/g, ' ')}:
                      </dt>
                      <dd className="text-slate-800 truncate">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

          {/* Right-rail actions — currently only the executive forward. */}
          {(canEscalate || ticket.escalated_at) && (
            <div className="shrink-0 md:min-w-[14rem]">
              {canEscalate ? (
                <button
                  type="button"
                  onClick={handleEscalate}
                  disabled={escalateMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-60 shadow-sm"
                  title="Forward this ticket to the configured Global approvers (President, C-suite) for executive visibility."
                >
                  <Send className="w-4 h-4" />
                  {escalateMutation.isPending ? 'Forwarding...' : 'Forward to President'}
                </button>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Globe2 className="w-3.5 h-3.5" />
                    Forwarded to the President
                  </div>
                  <div className="mt-0.5 text-amber-800">
                    {formatDateTime(ticket.escalated_at)}
                    {ticket.escalatedBy?.name && (
                      <span> · by {ticket.escalatedBy.name}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-slate-400 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-slate-500">Requester</div>
              <div className="font-medium text-slate-800 truncate">
                {ticket.requester?.fullname || '—'}
              </div>
              <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                {ticket.requester?.branch?.branch_name && (
                  <div className="truncate">
                    <span className="font-semibold text-slate-600">Branch:</span>{' '}
                    {ticket.requester.branch.branch_name}
                  </div>
                )}
                {ticket.requester?.obo?.name && (
                  <div className="truncate">
                    <span className="font-semibold text-slate-600">OBO:</span>{' '}
                    {ticket.requester.obo.name}
                  </div>
                )}
                {ticket.requester?.department?.name && (
                  <div className="truncate">
                    <span className="font-semibold text-slate-600">Section:</span>{' '}
                    {ticket.requester.department.name}
                  </div>
                )}
                {ticket.requester?.position?.title && (
                  <div className="truncate">
                    <span className="font-semibold text-slate-600">Position:</span>{' '}
                    {ticket.requester.position.title}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Assigned To</div>
              <select
                value={ticket.assigned_to_user_id || ''}
                onChange={handleAssigneeChange}
                disabled={assignMutation.isPending}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {assignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">Due Date</div>
              <div className="font-medium text-slate-800">{formatDate(ticket.due_date)}</div>
              <div className="text-xs text-slate-500">
                Created {formatDateTime(ticket.created_at)}
              </div>
            </div>
          </div>

          {ticket.contact_number && (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-slate-500">Contact Number</div>
                <div className="font-medium text-slate-800 truncate">{ticket.contact_number}</div>
              </div>
            </div>
          )}

          {ticket.anydesk_number && (
            <div className="flex items-start gap-2">
              <Monitor className="w-4 h-4 text-slate-400 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-slate-500">AnyDesk Number</div>
                <div className="font-medium text-slate-800 truncate">{ticket.anydesk_number}</div>
              </div>
            </div>
          )}
        </div>

        {(ticket.resolved_at || ticket.closed_at || ticket.resolution_summary) && (
          <div className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600">
            {ticket.resolved_at && (
              <p>
                <span className="font-semibold text-emerald-700">Resolved:</span>{' '}
                {formatDateTime(ticket.resolved_at)}
              </p>
            )}
            {ticket.closed_at && (
              <p>
                <span className="font-semibold text-slate-700">Closed:</span>{' '}
                {formatDateTime(ticket.closed_at)}
              </p>
            )}
            {ticket.resolution_summary && (
              <p className="mt-1 whitespace-pre-wrap">
                <span className="font-semibold">Resolution:</span> {ticket.resolution_summary}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick status change */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Change Status</h2>
        <form
          onSubmit={handleStatusSubmit}
          className="flex flex-col md:flex-row md:items-end gap-3"
        >
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              New Status
            </label>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select status...</option>
              {TICKET_STATUSES.filter((s) => s !== ticket.status).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-[2]">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Resolution Summary (optional)
            </label>
            <input
              type="text"
              value={resolutionDraft}
              onChange={(e) => setResolutionDraft(e.target.value)}
              placeholder="What was done?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={!statusDraft || statusMutation.isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {statusMutation.isPending ? 'Updating...' : 'Update Status'}
          </button>
        </form>
      </div>

      {/* Two-column: attachments + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <TicketAttachmentsPanel
            attachments={ticket.attachments || []}
            onUpload={(files) => uploadMutation.mutate(files)}
            onDelete={handleDeleteAttachment}
            isUploading={uploadMutation.isPending}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Activity & Remarks</h2>
            <span
              className={[
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                rtConnected
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500',
              ].join(' ')}
              title={
                rtConnected
                  ? 'Real-time connected — new replies appear instantly.'
                  : 'Real-time offline — refreshing every 4 seconds.'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  rtConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {rtConnected ? 'Live' : 'Polling'}
            </span>
          </div>
          <TicketRemarksPanel
            remarks={ticket.remarks || []}
            onAddRemark={(text, attachments, isInternal) =>
              remarkMutation.mutate({ text, attachments, isInternal })
            }
            isAdding={remarkMutation.isPending}
          />

          {/* Raw audit trail (admin-only detail) */}
          <details
            open={auditOpen}
            onToggle={(e) => setAuditOpen(e.currentTarget.open)}
            className="mt-4 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden"
          >
            <summary className="list-none cursor-pointer px-3 py-2 flex items-center gap-2 hover:bg-slate-100 transition-colors">
              <ScrollText className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">Raw audit trail (admin)</span>
              <span className="text-xs text-slate-500">({auditLog.length} entries)</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 ml-auto transition-transform ${
                  auditOpen ? 'rotate-180' : ''
                }`}
              />
            </summary>
            <div className="border-t border-slate-200 bg-white max-h-96 overflow-y-auto">
              {auditLog.length === 0 ? (
                <div className="px-3 py-4 text-xs text-slate-500 italic">No audit entries yet.</div>
              ) : (
                <ul className="divide-y divide-slate-100 text-xs">
                  {auditLog.map((log) => (
                    <li key={log.id} className="px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-slate-800">{log.action}</span>
                        <span className="text-slate-400">{formatDateTime(log.created_at)}</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {log.actor_type} — {log.actor_name || 'n/a'}
                        {log.ip_address ? <span className="ml-2 text-slate-400">IP: {log.ip_address}</span> : null}
                      </div>
                      {log.changes ? (
                        <pre className="mt-1 p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px] whitespace-pre-wrap text-slate-700">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPage
