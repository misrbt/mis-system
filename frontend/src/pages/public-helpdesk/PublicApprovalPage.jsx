import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Phone,
  Monitor,
  User,
  Tag,
  ArrowLeft,
  Paperclip,
} from 'lucide-react'
import TicketPriorityBadge from '../../components/helpdesk/TicketPriorityBadge'
import {
  fetchApprovalRequest,
  approveTicket,
  rejectTicket,
} from '../../services/publicTicketService'

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

function PublicApprovalPage() {
  const { token } = useParams()
  const queryClient = useQueryClient()
  const [approverName, setApproverName] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['approval', token],
    queryFn: async () => (await fetchApprovalRequest(token)).data?.data,
    retry: false,
    enabled: Boolean(token),
  })

  const approveMutation = useMutation({
    mutationFn: () => approveTicket(token, approverName.trim() || null),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Ticket approved',
        text: 'The IT team has been notified and will pick it up shortly.',
        timer: 2500,
        showConfirmButton: false,
      })
      queryClient.invalidateQueries({ queryKey: ['approval', token] })
    },
    onError: (e) => {
      Swal.fire({
        icon: 'error',
        title: 'Could not approve',
        text: e.response?.data?.message || e.message,
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () =>
      rejectTicket(token, {
        reason: rejectionReason.trim(),
        approverName: approverName.trim() || null,
      }),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Ticket rejected',
        text: 'The requester has been notified through the track page.',
        timer: 2500,
        showConfirmButton: false,
      })
      setShowRejectForm(false)
      setRejectionReason('')
      queryClient.invalidateQueries({ queryKey: ['approval', token] })
    },
    onError: (e) => {
      Swal.fire({
        icon: 'error',
        title: 'Could not reject',
        text: e.response?.data?.message || e.message,
      })
    },
  })

  const status = data?.approval_status
  const isProcessed = status === 'approved' || status === 'rejected'

  const customFieldEntries = useMemo(
    () => (data?.custom_fields ? Object.entries(data.custom_fields) : []),
    [data]
  )

  if (!token) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Missing approval token</h1>
        <p className="text-sm text-slate-600 mt-2">
          This approval link is invalid. Check the email and open the full URL.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <Clock className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
        <p className="mt-3 text-sm text-slate-500">Loading approval request…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <XCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h1 className="mt-3 text-xl font-bold text-slate-900">Approval request not found</h1>
        <p className="text-sm text-slate-600 mt-2">
          This link may have expired or been invalidated. If you believe this is a
          mistake, please contact MIS.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <Link
          to="/public-helpdesk"
          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to helpdesk home
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Ticket Approval Request
        </h1>
        <p className="text-sm text-slate-600">
          A new {data.priority?.toLowerCase()} priority ticket needs your decision
          before it reaches the IT team.
        </p>
      </div>

      {/* Status banner */}
      {status === 'pending' ? (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-amber-900">Pending your review</div>
            <div className="text-xs text-amber-700">
              Review the details below, then approve or reject.
            </div>
          </div>
        </div>
      ) : status === 'approved' ? (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-emerald-900">Approved</div>
            <div className="text-xs text-emerald-700">
              Decision recorded {formatDateTime(data.approved_at)}. The IT team has been notified.
            </div>
          </div>
        </div>
      ) : status === 'rejected' ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <ShieldX className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-red-900">Rejected</div>
            <div className="text-xs text-red-700">
              Decision recorded {formatDateTime(data.rejected_at)}.
              {data.rejection_reason ? (
                <span className="block mt-1">Reason: {data.rejection_reason}</span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Ticket details */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-indigo-700">
                {data.ticket_number}
              </span>
              <TicketPriorityBadge priority={data.priority} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{data.title}</h2>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <div>Submitted</div>
            <div>{formatDateTime(data.created_at)}</div>
          </div>
        </div>

        {data.priority_justification ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-amber-800 mb-1">
              Why the requester flagged this {data.priority?.toLowerCase()}
            </div>
            <p className="text-sm text-amber-900 whitespace-pre-wrap">
              {data.priority_justification}
            </p>
          </div>
        ) : null}

        <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Requester</div>
              <div className="font-medium text-slate-800">
                {data.requester?.fullname || '—'}
              </div>
            </div>
          </div>
          {data.requester?.branch ? (
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Branch</div>
                <div className="font-medium text-slate-800">{data.requester.branch}</div>
              </div>
            </div>
          ) : null}
          {data.category ? (
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Category</div>
                <div className="font-medium text-slate-800">{data.category}</div>
              </div>
            </div>
          ) : null}
          {data.contact_number ? (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">Contact</div>
                <div className="font-medium text-slate-800">{data.contact_number}</div>
              </div>
            </div>
          ) : null}
          {data.anydesk_number ? (
            <div className="flex items-start gap-2">
              <Monitor className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">AnyDesk</div>
                <div className="font-medium text-slate-800">{data.anydesk_number}</div>
              </div>
            </div>
          ) : null}
        </div>

        {customFieldEntries.length > 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">
              Additional details
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {customFieldEntries.map(([key, value]) => (
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

        {data.attachments?.length > 0 ? (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Paperclip className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">
                Attachments ({data.attachments.length})
              </span>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {data.attachments.map((a) => (
                <li key={a.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  {a.mime_type?.startsWith('image/') ? (
                    <a href={a.url} target="_blank" rel="noreferrer">
                      <img src={a.url} alt={a.original_name} className="w-full h-24 object-cover" />
                    </a>
                  ) : (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-2 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{a.original_name}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Decision form — bold + solid-colored buttons for unambiguous visibility. */}
      {!isProcessed ? (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-md p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your decision</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Pick one. This action is final and goes straight to the IT team.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your name (optional, for the audit log)
            </label>
            <input
              type="text"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              placeholder="e.g. Jane Dela Cruz"
              maxLength={120}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {!showRejectForm ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                style={{ backgroundColor: '#059669', color: '#ffffff', borderColor: '#047857' }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-bold border-2 rounded-lg shadow-sm hover:brightness-95 active:brightness-90 disabled:opacity-60 transition"
              >
                <ShieldCheck className="w-5 h-5" />
                {approveMutation.isPending ? 'Approving…' : 'Approve'}
              </button>
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                style={{ backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#b91c1c' }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-bold border-2 rounded-lg shadow-sm hover:brightness-95 active:brightness-90 transition"
              >
                <ShieldX className="w-5 h-5" />
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for rejection
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  maxLength={1000}
                  placeholder="Brief explanation the requester will see on their track page."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#b91c1c' }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-bold border-2 rounded-lg shadow-sm hover:brightness-95 active:brightness-90 disabled:opacity-60 transition"
                >
                  <ShieldX className="w-5 h-5" />
                  {rejectMutation.isPending ? 'Rejecting…' : 'Confirm rejection'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectionReason('')
                  }}
                  style={{ backgroundColor: '#ffffff', color: '#1e293b', borderColor: '#94a3b8' }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold border-2 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 text-center">
          <p className="text-sm text-slate-600">
            This ticket has already been {status === 'approved' ? 'approved' : 'rejected'}.
            You can safely close this page.
          </p>
        </div>
      )}
    </div>
  )
}

export default PublicApprovalPage
