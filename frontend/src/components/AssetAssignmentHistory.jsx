import { useMemo } from 'react'
import { User, MapPin, Calendar, ArrowRight, Clock } from 'lucide-react'

function AssetAssignmentHistory({ assignments, loading = false, currentEmployeeId = null }) {
  const sortedAssignments = useMemo(() => {
    if (!assignments) return []
    return [...assignments].sort((a, b) =>
      new Date(b.movement_date) - new Date(a.movement_date)
    )
  }, [assignments])

  const calculateDuration = (assignmentDate, returnDate) => {
    const start = new Date(assignmentDate)
    const end = returnDate ? new Date(returnDate) : new Date()
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24))
    return days
  }

  const getReturnDate = (assignment, index) => {
    // If there's a next assignment (previous in chronological order), use its date as return date
    if (index < sortedAssignments.length - 1) {
      const nextAssignment = sortedAssignments[index + 1]
      if (nextAssignment.movement_type === 'returned') {
        return nextAssignment.movement_date
      }
    }
    // Check if this assignment was followed by a return movement
    if (assignment.movement_type === 'returned') {
      return assignment.movement_date
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-24"></div>
        ))}
      </div>
    )
  }

  if (!sortedAssignments.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">No Assignment History</p>
        <p className="text-sm mt-1">This asset has not been assigned to any employee yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Branch/Location</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Assignment Date</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Return Date</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Duration</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
          </tr>
        </thead>
        <tbody>
          {sortedAssignments.map((assignment, index) => {
            // Only show assigned and transferred movements
            if (!['assigned', 'transferred'].includes(assignment.movement_type)) {
              return null
            }

            const toEmployee = assignment.to_employee
            const toBranch = assignment.to_employee?.branch || assignment.to_branch
            const assignmentDate = new Date(assignment.movement_date)
            const returnDate = getReturnDate(assignment, index)
            const duration = calculateDuration(assignment.movement_date, returnDate)
            const isCurrent = !returnDate && toEmployee?.id === currentEmployeeId

            return (
              <tr
                key={assignment.id}
                className={`
                  border-b border-gray-200 transition-colors
                  ${isCurrent ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
              >
                {/* Employee */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full
                      ${isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                    `}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {toEmployee?.fullname || 'N/A'}
                        {isCurrent && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      {toEmployee?.position && (
                        <div className="text-sm text-gray-500">
                          {toEmployee.position.position_name}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Branch/Location */}
                <td className="py-4 px-4">
                  {toBranch ? (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{toBranch.branch_name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>

                {/* Assignment Date */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {assignmentDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {assignmentDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Return Date */}
                <td className="py-4 px-4">
                  {returnDate ? (
                    <div className="flex items-center gap-2 text-gray-700">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {new Date(returnDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(returnDate).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium bg-green-100 text-green-700 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      Present
                    </span>
                  )}
                </td>

                {/* Duration */}
                <td className="py-4 px-4">
                  <div className="text-gray-700">
                    <span className="font-semibold text-lg">{duration}</span>
                    <span className="text-sm text-gray-500 ml-1">
                      {duration === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </td>

                {/* Reason */}
                <td className="py-4 px-4">
                  {assignment.reason ? (
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {assignment.reason}
                      </p>
                      {assignment.remarks && (
                        <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">
                          {assignment.remarks}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm italic">No reason provided</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AssetAssignmentHistory
