import React from 'react'
import { STATUS_BADGE_CONFIG } from '../../utils/dashboardUtils'

/**
 * Reusable Status Badge Component
 */
const StatusBadge = ({ status }) => {
  const className = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG.Available

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {status}
    </span>
  )
}

export default React.memo(StatusBadge)
