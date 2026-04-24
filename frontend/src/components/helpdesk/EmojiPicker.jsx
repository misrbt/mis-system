import { useState, useRef, useEffect } from 'react'
import { Smile } from 'lucide-react'

const EMOJI_GROUPS = [
  {
    name: 'Smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😊', '🙂', '😉', '😌',
      '😍', '🥰', '😎', '🤓', '🧐', '🤔', '😐', '😑',
      '😕', '🙁', '😢', '😭', '😤', '😠', '😡', '🤬',
      '😱', '😨', '😰', '😥', '😓', '🤯', '😴', '🤗',
    ],
  },
  {
    name: 'Gestures',
    emojis: [
      '👍', '👎', '👌', '🙏', '👏', '💪', '🤝', '✋',
      '🤚', '👋', '👉', '👈', '👆', '👇', '✌️', '🤞',
    ],
  },
  {
    name: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💯'],
  },
  {
    name: 'IT & Work',
    emojis: [
      '💻', '🖥️', '📱', '⌨️', '🖱️', '🖨️', '📧', '📞',
      '☎️', '📡', '💾', '📀', '🔌', '🔋', '🔔', '📎',
      '📝', '📂', '📁', '📊', '📈', '📉', '⚙️', '🛠️',
    ],
  },
  {
    name: 'Status',
    emojis: [
      '✅', '❌', '⭕', '❗', '❓', '✔️', '✖️', '⚠️',
      '🔴', '🟢', '🟡', '🟠', '🔵', '⚫', '⚪', '🚀',
      '🔥', '⭐', '🎉', '👀', '💡', '💭', '🕒', '⏰',
    ],
  },
]

function EmojiPicker({ onSelect, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handlePick = (emoji) => {
    onSelect?.(emoji)
    // Keep the picker open so the user can pick multiple; they can click outside to close
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Add emoji"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
      >
        <Smile className="w-4 h-4" />
        Emoji
      </button>

      {open && (
        <div
          className={[
            'absolute bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-80',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
        >
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-100 p-1.5 overflow-x-auto">
            {EMOJI_GROUPS.map((g, idx) => (
              <button
                key={g.name}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  idx === activeTab
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="p-2 max-h-56 overflow-y-auto">
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJI_GROUPS[activeTab].emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handlePick(emoji)}
                  className="text-xl hover:bg-slate-100 rounded p-1.5 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400 text-center">
            Click any emoji to insert. Click outside to close.
          </div>
        </div>
      )}
    </div>
  )
}

export default EmojiPicker
