/**
 * Employee Header Component
 * Displays employee information in a gradient card
 */

import React from 'react'
import { User, Briefcase, Building2 } from 'lucide-react'

const EmployeeHeader = ({ employee }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-white">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-16 h-16 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-xs sm:text-sm text-indigo-100 mb-1">Employee</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{employee.fullname}</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-6 text-sm">
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
      </div>
    </div>
  )
}

export default React.memo(EmployeeHeader)
