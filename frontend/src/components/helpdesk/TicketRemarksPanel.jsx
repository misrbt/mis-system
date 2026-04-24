import { useMemo, useRef, useState } from 'react'
import {
  MessageSquare,
  Send,
  Settings,
  UserCheck,
  RefreshCw,
  Shield,
  UserCircle2,
  Image as ImageIcon,
  Film,
  Paperclip,
  Download,
  X,
  ChevronDown,
  Activity,
  Lock,
} from 'lucide-react'
import EmojiPicker from './EmojiPicker'

function formatDateTime(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function ActivityIcon({ type }) {
  const cls = 'w-3.5 h-3.5'
  switch (type) {
    case 'status_change':
      return <RefreshCw className={`${cls} text-blue-500`} />
    case 'assignment':
      return <UserCheck className={`${cls} text-indigo-500`} />
    case 'system':
    default:
      return <Settings className={`${cls} text-slate-500`} />
  }
}

function deriveAuthor(remark) {
  if (remark.user?.name) return { type: 'mis', name: remark.user.name }
  if (remark.employee?.fullname) return { type: 'employee', name: remark.employee.fullname }
  return { type: 'system', name: 'System' }
}

function RemarkAttachment({ att, onOpen }) {
  if (att.is_image || att.mime_type?.startsWith('image/')) {
    return (
      <button
        type="button"
        onClick={() => onOpen?.(att)}
        className="relative overflow-hidden rounded-md border border-slate-200 bg-slate-100 w-28 h-28 hover:ring-2 hover:ring-indigo-400 transition"
        title={att.original_name}
      >
        <img src={att.url} alt={att.original_name} className="w-full h-full object-cover" loading="lazy" />
      </button>
    )
  }
  if (att.is_video || att.mime_type?.startsWith('video/')) {
    return (
      <div className="relative overflow-hidden rounded-md border border-slate-200 bg-black w-40 h-28">
        <video src={att.url} className="w-full h-full object-cover" controls preload="metadata" />
        <div className="absolute top-1 left-1 bg-black/60 text-white rounded px-1 py-0.5 text-[10px] flex items-center gap-1">
          <Film className="w-2.5 h-2.5" />
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
      className="flex items-center gap-2 p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-xs max-w-xs"
    >
      <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="truncate flex-1 text-slate-700">{att.original_name}</span>
      <Download className="w-3 h-3 text-slate-400 shrink-0" />
    </a>
  )
}

function Lightbox({ attachment, onClose }) {
  if (!attachment) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
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

function TicketRemarksPanel({ remarks = [], onAddRemark, isAdding }) {
  const [draft, setDraft] = useState('')
  const [files, setFiles] = useState([])
  const [isInternal, setIsInternal] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [showActivity, setShowActivity] = useState(false)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  // Split remarks: conversation (general) vs activity log (everything else).
  // Conversation is sorted OLDEST → NEWEST (chat-style: latest at the bottom).
  // Activity log stays newest-first (audit-log style).
  const { conversation, activity } = useMemo(() => {
    const conv = []
    const act = []
    for (const r of remarks) {
      if (r.remark_type === 'general') conv.push(r)
      else act.push(r)
    }
    conv.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    return { conversation: conv, activity: act }
  }, [remarks])

  const insertEmoji = (emoji) => {
    const ta = textareaRef.current
    if (!ta) {
      setDraft((prev) => prev + emoji)
      return
    }
    const start = ta.selectionStart ?? draft.length
    const end = ta.selectionEnd ?? draft.length
    const next = draft.slice(0, start) + emoji + draft.slice(end)
    setDraft(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + emoji.length
    })
  }

  const handleFilesPicked = (e) => {
    const picked = Array.from(e.target.files || [])
    if (picked.length === 0) return
    const next = [...files, ...picked].slice(0, 5)
    setFiles(next)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (idx) => {
    const next = [...files]
    next.splice(idx, 1)
    setFiles(next)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text && files.length === 0) return
    await onAddRemark?.(text, files, isInternal)
    setDraft('')
    setFiles([])
    setIsInternal(false)
  }

  return (
    <div className="space-y-5">
      {/* Composer */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder={isInternal ? 'Internal note (requester will not see this)...' : 'Reply to the requester...'}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:border-transparent ${
            isInternal
              ? 'border-amber-300 bg-amber-50 focus:ring-amber-500'
              : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        />

        {files.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {files.map((f, idx) => {
              const isImage = f.type.startsWith('image/')
              const isVideo = f.type.startsWith('video/')
              const url = URL.createObjectURL(f)
              return (
                <div
                  key={`${f.name}-${idx}`}
                  className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-square"
                >
                  {isImage && <img src={url} alt={f.name} className="w-full h-full object-cover" />}
                  {isVideo && <video src={url} className="w-full h-full object-cover" muted />}
                  {!isImage && !isVideo && (
                    <div className="flex items-center justify-center h-full text-xs text-slate-600 p-2 text-center">
                      {f.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
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
              disabled={files.length >= 5}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              Photo / Video
            </button>
            <EmojiPicker onSelect={insertEmoji} />
            <label className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border cursor-pointer select-none transition-colors ${
              isInternal
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                className="sr-only"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              <Lock className="w-3.5 h-3.5" />
              Internal note
            </label>
            <span className="text-xs text-slate-500">
              {files.length}/5 {files.length === 1 ? 'file' : 'files'}
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
            disabled={isAdding || (!draft.trim() && files.length === 0)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {isAdding ? 'Posting...' : 'Post Reply'}
          </button>
        </div>
      </form>

      {/* Conversation */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Conversation</h3>
          <span className="text-xs text-slate-500">
            ({conversation.length} {conversation.length === 1 ? 'message' : 'messages'})
          </span>
        </div>

        {conversation.length === 0 ? (
          <div className="text-sm text-slate-500 italic py-4 text-center bg-slate-50 border border-slate-200 rounded-lg">
            No messages yet. Start the conversation above.
          </div>
        ) : (
          <ul className="space-y-2">
            {conversation.map((r) => {
              const author = deriveAuthor(r)
              const isMis = author.type === 'mis'
              const isEmployee = author.type === 'employee'

              const isInternalRemark = Boolean(r.is_internal)

              return (
                <li
                  key={r.id}
                  className={`rounded-lg p-3 border ${
                    isInternalRemark
                      ? 'bg-amber-100 border-amber-300 border-dashed'
                      : isEmployee
                        ? 'bg-amber-50 border-amber-200'
                        : isMis
                          ? 'bg-indigo-50 border-indigo-100'
                          : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900">{author.name}</span>
                      {isInternalRemark ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded bg-amber-300 text-amber-900">
                          <Lock className="w-2.5 h-2.5" />
                          Internal
                        </span>
                      ) : null}
                      {isEmployee && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded bg-amber-200 text-amber-900">
                          <UserCircle2 className="w-2.5 h-2.5" />
                          Requester
                        </span>
                      )}
                      {isMis && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded bg-indigo-200 text-indigo-900">
                          <Shield className="w-2.5 h-2.5" />
                          MIS
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{formatDateTime(r.created_at)}</span>
                  </div>
                  {r.remark && r.remark !== '(attachment)' && (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.remark}</p>
                  )}
                  {r.attachments?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.attachments.map((a) => (
                        <RemarkAttachment key={a.id} att={a} onOpen={setLightbox} />
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Activity log — status changes, assignment changes, system events */}
      {activity.length > 0 && (
        <details
          open={showActivity}
          onToggle={(e) => setShowActivity(e.currentTarget.open)}
          className="border border-slate-200 rounded-lg bg-slate-50 overflow-hidden"
        >
          <summary className="list-none cursor-pointer px-3 py-2 flex items-center gap-2 hover:bg-slate-100 transition-colors">
            <Activity className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">
              Activity log
            </span>
            <span className="text-xs text-slate-500">
              ({activity.length} {activity.length === 1 ? 'entry' : 'entries'})
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-500 ml-auto transition-transform ${
                showActivity ? 'rotate-180' : ''
              }`}
            />
          </summary>
          <ol className="border-t border-slate-200 divide-y divide-slate-200 bg-white max-h-80 overflow-y-auto">
            {activity.map((r) => {
              const author = deriveAuthor(r)
              return (
                <li key={r.id} className="px-3 py-2 flex items-start gap-2 text-xs">
                  <div className="mt-0.5 shrink-0">
                    <ActivityIcon type={r.remark_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700">{r.remark}</p>
                    <p className="text-slate-400 mt-0.5">
                      {author.name} · {formatDateTime(r.created_at)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </details>
      )}

      <Lightbox attachment={lightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}

export default TicketRemarksPanel
