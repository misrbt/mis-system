import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock, X, Wrench, ArrowRight, Calendar, Building2 } from 'lucide-react'
import Modal from '../Modal'

/**
 * Repair Reminder Modal
 * Shows popup when user accesses inventory with overdue or due-soon repairs
 */
function RepairReminderModal({
  isOpen,
  onClose,
  onDismiss,
  overdueRepairs = [],
  dueSoonRepairs = [],
  overdueCount = 0,
  dueSoonCount = 0,
}) {
  const navigate = useNavigate()

  const handleGoToRepairs = () => {
    onDismiss()
    navigate('/inventory/repairs')
  }

  const handleDismiss = () => {
    onDismiss()
    onClose()
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In Repair': 'bg-blue-100 text-blue-800 border-blue-200',
      Completed: 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      showCloseButton={false}
    >
      <div className="relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Repair Reminders</h2>
            <p className="text-sm text-slate-500">
              You have repairs requiring attention
            </p>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 mb-6">
          {overdueCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-700">
                {overdueCount} Overdue
              </span>
            </div>
          )}
          {dueSoonCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                {dueSoonCount} Due Soon
              </span>
            </div>
          )}
        </div>

        {/* Overdue Repairs Section */}
        {overdueRepairs.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                Overdue
              </h3>
            </div>
            <div className="space-y-2">
              {overdueRepairs.slice(0, 3).map((repair) => (
                <div
                  key={repair.id}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="font-medium text-slate-900 truncate">
                          {repair.asset_name}
                        </p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span className={`px-2 py-0.5 rounded-full border ${getStatusBadge(repair.status)}`}>
                          {repair.status === 'In Repair' ? 'Under Repair' : repair.status}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {formatDate(repair.expected_return_date)}
                        </span>
                        <span className="font-medium text-red-600">
                          {repair.days_overdue} day{repair.days_overdue !== 1 ? 's' : ''} overdue
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Building2 className="w-3 h-3" />
                        {repair.vendor_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {overdueRepairs.length > 3 && (
                <p className="text-xs text-red-600 text-center mt-2">
                  +{overdueRepairs.length - 3} more overdue repair{overdueRepairs.length - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Due Soon Repairs Section */}
        {dueSoonRepairs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wide">
                Due Soon
              </h3>
            </div>
            <div className="space-y-2">
              {dueSoonRepairs.slice(0, 3).map((repair) => (
                <div
                  key={repair.id}
                  className="p-3 bg-amber-50 border border-amber-100 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="font-medium text-slate-900 truncate">
                          {repair.asset_name}
                        </p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span className={`px-2 py-0.5 rounded-full border ${getStatusBadge(repair.status)}`}>
                          {repair.status === 'In Repair' ? 'Under Repair' : repair.status}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {formatDate(repair.expected_return_date)}
                        </span>
                        <span className="font-medium text-amber-600">
                          {repair.days_until_due === 0
                            ? 'Due today'
                            : `${repair.days_until_due} day${repair.days_until_due !== 1 ? 's' : ''} left`}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Building2 className="w-3 h-3" />
                        {repair.vendor_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {dueSoonRepairs.length > 3 && (
                <p className="text-xs text-amber-600 text-center mt-2">
                  +{dueSoonRepairs.length - 3} more repair{dueSoonRepairs.length - 3 !== 1 ? 's' : ''} due soon
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Dismiss (remind on next login)
          </button>
          <button
            onClick={handleGoToRepairs}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Go to Repairs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default RepairReminderModal
