import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, XCircle, ArrowRight } from 'lucide-react'

export function EmployeeChip({
  employee,
  isModified,
  isInExchange,
  transitionMode,
  onClear,
  isDragging = false,
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: employee.id.toString(),
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  const getBgColor = () => {
    if (isDragging) return `bg-${colorClass}-100 shadow-lg`
    if (isInExchange) return 'bg-purple-100'
    if (isModified) return `bg-${colorClass}-50`
    return 'bg-white'
  }

  const getBorderColor = () => {
    if (isDragging) return `border-${colorClass}-400`
    if (isInExchange) return 'border-purple-300'
    if (isModified) return `border-${colorClass}-300`
    return 'border-slate-200'
  }

  const getAvatarColor = () => {
    if (isInExchange) return 'bg-purple-500'
    if (isModified) return `bg-${colorClass}-500`
    return 'bg-slate-400'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded-lg border
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${getBgColor()} ${getBorderColor()}
        ${isDragging ? 'opacity-90 z-50' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Drag handle */}
      <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />

      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor()}`}>
        {employee.fullname?.charAt(0)?.toUpperCase()}
      </div>

      {/* Name and status */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800 truncate">
          {employee.fullname}
        </div>
        {isModified && (
          <div className="flex items-center gap-1 text-[10px]">
            <ArrowRight className={`w-3 h-3 ${isInExchange ? 'text-purple-500' : `text-${colorClass}-500`}`} />
            <span className={isInExchange ? 'text-purple-600' : `text-${colorClass}-600`}>
              {isInExchange ? 'In exchange' : 'Moving'}
            </span>
          </div>
        )}
      </div>

      {/* Clear button */}
      {isModified && onClear && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClear()
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-0.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Undo change"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default EmployeeChip
