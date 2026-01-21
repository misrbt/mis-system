/**
 * Employee Header Component
 * Displays employee information in a gradient card
 */

import React from 'react'
import { User, Briefcase, Building2, Package } from 'lucide-react'
import { formatCurrency } from '../../utils/assetFormatters'

const EmployeeHeader = ({ employee, assetCount = 0, totalAcqCost = 0 }) => {
  // Guard against undefined employee
  if (!employee) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg shadow-lg p-4 sm:p-6 md:p-4 text-white">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-lg sm:text-lg font-bold mb-2">{employee.fullname}</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-6 text-xs">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-100" />
              <span>{employee.position?.title || 'No Position'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-100" />
              <span>{employee.branch?.branch_name || 'No Branch'}</span>
            </div>
          </div>
        </div>

        {/* Asset Stats in Right Corner */}
        {assetCount > 0 && (
          <div className="flex flex-col gap-2 text-right bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
            <div className="flex items-center gap-2 justify-end">
              <Package className="w-4 h-4 text-indigo-100" />
              <span className="text-sm font-bold">{assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs font-semibold text-indigo-100">Total: {formatCurrency(totalAcqCost)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(EmployeeHeader)
