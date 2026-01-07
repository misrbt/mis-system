import React from 'react'

/**
 * Skeleton loader for cards
 */
export const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
    <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
    <div className="h-3 bg-slate-200 rounded w-20"></div>
  </div>
)

/**
 * Skeleton loader for tables
 */
export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-slate-200 rounded flex-1"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  </div>
)

/**
 * Skeleton loader for charts
 */
export const SkeletonChart = ({ height = 300 }) => (
  <div
    className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
    style={{ height: `${height}px` }}
  >
    <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
    <div className="h-full bg-slate-100 rounded"></div>
  </div>
)

export default { SkeletonCard, SkeletonTable, SkeletonChart }
