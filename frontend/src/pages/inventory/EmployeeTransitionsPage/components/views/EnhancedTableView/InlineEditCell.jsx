import { useState, useRef, useEffect } from 'react'
import { Check, X } from 'lucide-react'

export function InlineEditCell({
  value,
  options,
  onChange,
  disabled,
  placeholder,
  transitionMode,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)
  const selectRef = useRef(null)

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    setTempValue(value)
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleConfirm = () => {
    onChange(tempValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempValue(value)
    setIsEditing(false)
  }

  const displayValue = options.find(opt => opt.value === value)?.label || placeholder || '-'

  if (disabled) {
    return (
      <span className="text-slate-500 text-sm cursor-not-allowed">
        {displayValue}
      </span>
    )
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`text-sm text-left px-2 py-1 -mx-2 -my-1 rounded hover:bg-${colorClass}-50 transition-colors w-full`}
      >
        {displayValue}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <select
        ref={selectRef}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleConfirm}
        className={`flex-1 px-2 py-1 text-sm border border-${colorClass}-300 rounded focus:ring-2 focus:ring-${colorClass}-500 focus:border-transparent`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleConfirm}
        className={`p-1 rounded text-${colorClass}-600 hover:bg-${colorClass}-100 transition-colors`}
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={handleCancel}
        className="p-1 rounded text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default InlineEditCell
