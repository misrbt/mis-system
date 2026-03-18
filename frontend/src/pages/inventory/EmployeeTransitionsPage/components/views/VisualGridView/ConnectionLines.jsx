import { useMemo } from 'react'

export function ConnectionLines({ pendingMoves, transitionMode }) {
  // Connection lines are complex SVG overlays - for now, we use a simpler visual approach
  // The actual implementation would need DOM measurements to draw accurate lines
  // This is a placeholder that shows the concept

  const colorClass = transitionMode === 'branch' ? 'teal' : 'blue'

  if (pendingMoves.length === 0) return null

  // We'll render a summary badge instead of actual lines
  // (Full SVG line implementation requires useLayoutEffect with DOM measurements)
  return (
    <div className="absolute top-0 right-0 -mt-2 -mr-2 z-10">
      <div className={`
        px-2 py-1 rounded-full text-xs font-medium
        bg-${colorClass}-100 text-${colorClass}-700 border border-${colorClass}-200
        shadow-sm
      `}>
        {pendingMoves.length} pending move{pendingMoves.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default ConnectionLines
