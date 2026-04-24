import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { useTicketRealtime } from '../../hooks/useTicketRealtime'
import {
  Search,
  ArrowLeft,
  Paperclip,
  Calendar,
  Info,
  Phone,
  Monitor,
  Send,
  Shield,
  UserCircle2,
  Image as ImageIcon,
  Film,
  X,
  Download,
  MessageSquare,
  Clock,
  Building2,
  Users,
  Briefcase,
  Tag,
  Star,
  CheckCircle2,
} from 'lucide-react'
import TicketStatusBadge from '../../components/helpdesk/TicketStatusBadge'
import TicketPriorityBadge from '../../components/helpdesk/TicketPriorityBadge'
import EmojiPicker from '../../components/helpdesk/EmojiPicker'
import {
  trackPublicTicket,
  addPublicTicketRemark,
  submitPublicTicketRating,
} from '../../services/publicTicketService'

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

function formatRelative(value) {
  if (!value) return ''
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const sec = Math.floor(diff / 1000)
  if (sec < 10) return 'just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return formatDate(value)
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function AttachmentThumb({ att, onOpen, size = 'md' }) {
  // Comment-inline attachments stay small; ticket-header gallery uses default.
  const dim = size === 'sm' ? 'w-28 h-28' : 'aspect-square w-full'
  if (att.is_image || att.mime_type?.startsWith('image/')) {
    return (
      <button
        type="button"
        onClick={() => onOpen?.(att)}
        className={`relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-100 ${dim} hover:ring-2 hover:ring-indigo-400 transition`}
        title={att.original_name}
      >
        <img
          src={att.url}
          alt={att.original_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    )
  }
  if (att.is_video || att.mime_type?.startsWith('video/')) {
    const videoDim = size === 'sm' ? 'w-40 h-28' : 'aspect-square w-full'
    return (
      <div className={`relative overflow-hidden rounded-lg border border-slate-200 bg-black ${videoDim}`}>
        <video
          src={att.url}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
        />
        <div className="absolute top-1 left-1 bg-black/60 text-white rounded px-1.5 py-0.5 text-[10px] font-semibold flex items-center gap-1">
          <Film className="w-3 h-3" />
          Video
        </div>
      </div>
    )
  }
  return (
    <a
      href={att.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs max-w-xs"
    >
      <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="truncate flex-1 text-slate-700">{att.original_name}</span>
      <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
    </a>
  )
}

function Lightbox({ attachment, onClose }) {
  if (!attachment) return null
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={attachment.url}
        alt={attachment.original_name}
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

function PublicTrackTicket() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const urlTicket = searchParams.get('ticket') || ''
  const [ticketNumber, setTicketNumber] = useState(urlTicket)
  const [commentDraft, setCommentDraft] = useState('')
  const [commentFiles, setCommentFiles] = useState([])
  const [lightbox, setLightbox] = useState(null)
  const [ratingDraft, setRatingDraft] = useState(0)
  const [ratingHover, setRatingHover] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const threadRef = useRef(null)

  const insertEmoji = (emoji) => {
    const ta = textareaRef.current
    if (!ta) {
      setCommentDraft((prev) => prev + emoji)
      return
    }
    const start = ta.selectionStart ?? commentDraft.length
    const end = ta.selectionEnd ?? commentDraft.length
    const next = commentDraft.slice(0, start) + emoji + commentDraft.slice(end)
    setCommentDraft(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + emoji.length
    })
  }

  // Ticket lookup as a useQuery — data stays visible during refetches so the
  // page never blanks out when a new comment triggers a refresh.
  const ticketQuery = useQuery({
    queryKey: ['publicTicket', urlTicket],
    queryFn: async () => {
      const res = await trackPublicTicket(urlTicket)
      return res.data
    },
    enabled: !!urlTicket,
    retry: false,
    staleTime: 30_000,
  })

  const ticket = ticketQuery.data?.data
  const notFound = ticketQuery.error?.response?.status === 404

  const remarkCount = ticket?.remarks?.length ?? 0

  // Auto-scroll conversation to the bottom whenever new messages arrive
  useEffect(() => {
    if (!threadRef.current) return
    threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [remarkCount])

  const commentMutation = useMutation({
    mutationFn: ({ number, remark, attachments }) =>
      addPublicTicketRemark({ ticketNumber: number, remark, attachments }),
    onSuccess: () => {
      setCommentDraft('')
      setCommentFiles([])
      if (urlTicket) {
        queryClient.invalidateQueries({ queryKey: ['publicTicket', urlTicket] })
      }
    },
    onError: (error) => {
      const apiErrors = error.response?.data?.errors
      const first = apiErrors ? Object.values(apiErrors)[0]?.[0] : null
      Swal.fire({
        icon: 'error',
        title: 'Failed to post comment',
        text: first || error.response?.data?.message || error.message,
      })
    },
  })

  const ratingMutation = useMutation({
    mutationFn: ({ number, rating, comment }) =>
      submitPublicTicketRating({ ticketNumber: number, rating, comment }),
    onSuccess: () => {
      if (urlTicket) {
        queryClient.invalidateQueries({ queryKey: ['publicTicket', urlTicket] })
      }
      Swal.fire({
        icon: 'success',
        title: 'Thanks for your feedback!',
        timer: 1800,
        showConfirmButton: false,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Could not submit rating',
        text: error.response?.data?.message || error.message,
      })
    },
  })

  const remarks = useMemo(() => ticket?.remarks || [], [ticket])

  // Realtime: refetch the ticket when a remark arrives from Socket.io.
  const handleIncomingRemark = useCallback(
    (payload) => {
      if (!payload || payload.remark_type !== 'general') return
      if (urlTicket) {
        queryClient.invalidateQueries({ queryKey: ['publicTicket', urlTicket] })
      }
    },
    [urlTicket, queryClient]
  )

  const { connected: rtConnected } = useTicketRealtime(
    ticket?.ticket_number,
    handleIncomingRemark
  )

  // Polling fallback: if realtime is down, refresh the ticket every 4s so
  // new comments still appear (with a small delay).
  useEffect(() => {
    if (!urlTicket || rtConnected) return undefined
    const id = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['publicTicket', urlTicket] })
    }, 4000)
    return () => window.clearInterval(id)
  }, [urlTicket, rtConnected, queryClient])

  const handleLookupSubmit = (e) => {
    e.preventDefault()
    const trimmed = ticketNumber.trim()
    if (!trimmed) return
    setSearchParams({ ticket: trimmed })
    // The useQuery picks up the new urlTicket and fetches automatically
  }

  const handleFilesPicked = (e) => {
    const picked = Array.from(e.target.files || [])
    if (picked.length === 0) return
    const next = [...commentFiles, ...picked].slice(0, 5)
    setCommentFiles(next)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeCommentFile = (idx) => {
    const next = [...commentFiles]
    next.splice(idx, 1)
    setCommentFiles(next)
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    const trimmed = commentDraft.trim()
    if (!trimmed && commentFiles.length === 0) return
    commentMutation.mutate({
      number: ticket.ticket_number,
      remark: trimmed,
      attachments: commentFiles,
    })
  }

  const threadClosed = ticket && ['Closed', 'Cancelled'].includes(ticket.status)

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        to="/public-helpdesk"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Search bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">Track a Ticket</h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-4">
          Enter the ticket number you received when you submitted your concern.
        </p>
        <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="e.g. TKT-2026-000001"
            className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!ticketNumber.trim() || ticketQuery.isFetching}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Search className="w-4 h-4" />
            {ticketQuery.isFetching ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {notFound && !ticketQuery.isFetching && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-900">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Ticket not found</div>
            <div className="text-xs text-red-700 mt-0.5">
              Double-check the ticket number — the format looks like
              <span className="font-mono mx-1">TKT-2026-000001</span>.
            </div>
          </div>
        </div>
      )}

      {ticket && (
        <>
          {/* Header card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="font-mono text-xs font-semibold text-indigo-700">
                  {ticket.ticket_number}
                </span>
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
                {ticket.category && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Tag className="w-3 h-3" />
                    {ticket.category}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{ticket.title}</h3>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
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
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                    Additional details
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
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

            {/* Details grid */}
            <div className="border-t border-slate-200 bg-slate-50/60 p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <UserCircle2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Submitted by</div>
                  <div className="font-medium text-slate-800 truncate">
                    {ticket.requester?.fullname || '—'}
                  </div>
                  {ticket.requester?.branch && (
                    <div className="text-xs text-slate-500 inline-flex items-center gap-1 truncate">
                      <Building2 className="w-3 h-3" />
                      {ticket.requester.branch}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Handled by</div>
                  <div className="font-medium text-slate-800 truncate">
                    {ticket.assigned_to || <span className="italic text-slate-400">Awaiting assignment</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Submitted</div>
                  <div className="text-xs font-medium text-slate-800">
                    {formatDateTime(ticket.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Due date</div>
                  <div className="text-xs font-medium text-slate-800">
                    {formatDate(ticket.due_date)}
                  </div>
                </div>
              </div>

              {ticket.contact_number && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">Contact</div>
                    <div className="font-medium text-slate-800 truncate">{ticket.contact_number}</div>
                  </div>
                </div>
              )}

              {ticket.anydesk_number && (
                <div className="flex items-start gap-2">
                  <Monitor className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">AnyDesk</div>
                    <div className="font-medium text-slate-800 truncate">{ticket.anydesk_number}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Resolution banner */}
            {(ticket.resolved_at || ticket.closed_at || ticket.resolution_summary) && (
              <div className="border-t border-emerald-100 bg-emerald-50 p-5 sm:p-6 text-sm space-y-1">
                {ticket.resolved_at && (
                  <p className="text-emerald-900">
                    <span className="font-semibold">Resolved:</span>{' '}
                    {formatDateTime(ticket.resolved_at)}
                  </p>
                )}
                {ticket.closed_at && (
                  <p className="text-emerald-900">
                    <span className="font-semibold">Closed:</span>{' '}
                    {formatDateTime(ticket.closed_at)}
                  </p>
                )}
                {ticket.resolution_summary && (
                  <p className="text-emerald-900 whitespace-pre-wrap">
                    <span className="font-semibold">Resolution:</span> {ticket.resolution_summary}
                  </p>
                )}
              </div>
            )}

            {/* Satisfaction survey */}
            {['Resolved', 'Closed'].includes(ticket.status) && (
              <div className="border-t border-slate-200 p-5 sm:p-6 bg-yellow-50">
                {ticket.satisfaction_submitted_at ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Thank you for rating this ticket
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-5 h-5 ${
                              n <= (ticket.satisfaction_rating || 0)
                                ? 'text-yellow-500 fill-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      {ticket.satisfaction_comment ? (
                        <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
                          “{ticket.satisfaction_comment}”
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      How was our support?
                    </h4>
                    <p className="text-xs text-slate-600 mb-3">
                      Your feedback helps the IT team improve. One quick rating, then you're done.
                    </p>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onMouseEnter={() => setRatingHover(n)}
                          onMouseLeave={() => setRatingHover(0)}
                          onClick={() => setRatingDraft(n)}
                          className="p-0.5"
                          aria-label={`Rate ${n} stars`}
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              n <= (ratingHover || ratingDraft)
                                ? 'text-yellow-500 fill-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      maxLength={1000}
                      placeholder="Optional: tell us what worked or what could be better."
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <div className="flex items-center justify-end mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          ratingMutation.mutate({
                            number: ticket.ticket_number,
                            rating: ratingDraft,
                            comment: ratingComment.trim() || null,
                          })
                        }
                        disabled={ratingMutation.isPending || ratingDraft === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Star className="w-4 h-4" />
                        {ratingMutation.isPending ? 'Submitting...' : 'Submit rating'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Original attachments (from ticket submission) */}
            {ticket.attachments?.length > 0 && (
              <div className="border-t border-slate-200 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-700">
                    Original attachments ({ticket.attachments.length})
                  </h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ticket.attachments.map((a) => (
                    <AttachmentThumb key={a.id} att={a} onOpen={setLightbox} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conversation thread */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h4 className="text-base font-bold text-slate-900">Conversation</h4>
              <span
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                  rtConnected
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500',
                ].join(' ')}
                title={
                  rtConnected
                    ? 'Real-time connected — new messages appear instantly.'
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
              <span className="text-xs text-slate-500 ml-auto">
                {remarks.length} {remarks.length === 1 ? 'message' : 'messages'}
              </span>
            </div>

            {/* Thread */}
            <div
              ref={threadRef}
              className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto scroll-smooth"
            >
              {remarks.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No messages yet.</p>
                  <p className="text-xs mt-1">
                    Start the conversation with our IT team below.
                  </p>
                </div>
              ) : (
                remarks.map((r) => {
                  const isMis = r.author_type === 'mis'
                  const isEmployee = r.author_type === 'employee'
                  const isSystem = r.author_type === 'system'
                  return (
                    <div
                      key={r.id}
                      className={`flex gap-3 ${isEmployee ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                          isMis
                            ? 'bg-indigo-600'
                            : isEmployee
                              ? 'bg-slate-700'
                              : 'bg-amber-500'
                        }`}
                        title={r.author_name}
                      >
                        {isMis ? (
                          <Shield className="w-4 h-4" />
                        ) : isSystem ? (
                          <Info className="w-4 h-4" />
                        ) : (
                          getInitials(r.author_name)
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={`min-w-0 max-w-[85%] ${isEmployee ? 'text-right' : ''}`}>
                        <div
                          className={`flex items-center gap-2 mb-1 text-xs ${
                            isEmployee ? 'justify-end' : ''
                          }`}
                        >
                          <span className="font-semibold text-slate-900">
                            {isEmployee ? 'You' : r.author_name || 'System'}
                          </span>
                          {isMis && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-semibold uppercase tracking-wide">
                              <Shield className="w-2.5 h-2.5" />
                              IT
                            </span>
                          )}
                          <span className="text-slate-400" title={formatDateTime(r.created_at)}>
                            {formatRelative(r.created_at)}
                          </span>
                        </div>
                        <div
                          className={`inline-block rounded-2xl px-4 py-2.5 text-sm text-left shadow-sm ${
                            isMis
                              ? 'bg-indigo-50 border border-indigo-100 text-slate-800 rounded-tl-sm'
                              : isEmployee
                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                : 'bg-amber-50 border border-amber-100 text-amber-900 rounded-tl-sm italic'
                          }`}
                        >
                          {r.remark && r.remark !== '(attachment)' && (
                            <p className="whitespace-pre-wrap">{r.remark}</p>
                          )}
                          {r.attachments?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {r.attachments.map((a) => (
                                <AttachmentThumb
                                  key={a.id}
                                  att={a}
                                  onOpen={setLightbox}
                                  size="sm"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Composer */}
            {!threadClosed && (
              <form
                onSubmit={handleCommentSubmit}
                className="p-4 sm:p-5 border-t border-slate-200 space-y-3"
              >
                <textarea
                  ref={textareaRef}
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  rows={2}
                  maxLength={2000}
                  placeholder="Write a message to the IT team..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />

                {/* File preview */}
                {commentFiles.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {commentFiles.map((f, idx) => {
                      const isImage = f.type.startsWith('image/')
                      const isVideo = f.type.startsWith('video/')
                      const url = URL.createObjectURL(f)
                      return (
                        <div
                          key={`${f.name}-${idx}`}
                          className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square"
                        >
                          {isImage && (
                            <img src={url} alt={f.name} className="w-full h-full object-cover" />
                          )}
                          {isVideo && (
                            <video src={url} className="w-full h-full object-cover" muted />
                          )}
                          {!isImage && !isVideo && (
                            <div className="flex items-center justify-center h-full text-xs text-slate-600 p-2 text-center">
                              {f.name}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeCommentFile(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white"
                            aria-label="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 truncate">
                            {formatFileSize(f.size)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={commentFiles.length >= 5}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Photo / Video
                    </button>
                    <EmojiPicker onSelect={insertEmoji} />
                    <span className="text-xs text-slate-500">
                      {commentFiles.length}/5 {commentFiles.length === 1 ? 'file' : 'files'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFilesPicked}
                      accept="image/*,video/*"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      commentMutation.isPending ||
                      (!commentDraft.trim() && commentFiles.length === 0)
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {commentMutation.isPending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            )}

            {threadClosed && (
              <div className="p-4 sm:p-5 border-t border-slate-200 text-xs text-slate-500 italic text-center bg-slate-50/60">
                This ticket is {ticket.status.toLowerCase()}. If you need more help,
                please submit a new ticket.
              </div>
            )}
          </div>
        </>
      )}

      <Lightbox attachment={lightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}

export default PublicTrackTicket
