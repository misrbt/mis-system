import { useRef } from 'react'
import { Paperclip, Trash2, Download, Upload } from 'lucide-react'

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function TicketAttachmentsPanel({ attachments = [], onUpload, onDelete, isUploading }) {
  const fileRef = useRef(null)

  const handleChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    onUpload?.(files)
    if (fileRef.current) fileRef.current.value = ''
  }

  const images = attachments.filter((a) => a.is_image)
  const others = attachments.filter((a) => !a.is_image)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Attachments ({attachments.length})
        </h3>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-60 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.log,.zip"
        />
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm italic text-slate-500 py-4 text-center">No attachments.</p>
      ) : (
        <div className="space-y-4">
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((a) => (
                <div
                  key={a.id}
                  className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-50"
                >
                  <a href={a.url} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={a.url}
                      alt={a.original_name}
                      className="w-full h-32 object-cover"
                    />
                  </a>
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs p-2 flex items-center justify-between gap-2">
                    <span className="truncate">{a.original_name}</span>
                    <button
                      type="button"
                      onClick={() => onDelete?.(a)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                      aria-label="Delete attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {others.length > 0 && (
            <ul className="space-y-2">
              {others.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-indigo-700 hover:underline truncate block"
                      >
                        {a.original_name}
                      </a>
                      <div className="text-xs text-slate-500">
                        {a.mime_type} · {formatFileSize(a.size)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => onDelete?.(a)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default TicketAttachmentsPanel
