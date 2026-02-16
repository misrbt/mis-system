import { useNavigate } from 'react-router-dom'
import { X, Wrench, ArrowRight, Building2, Hash, Layers, User, Clock } from 'lucide-react'
import Modal from '../Modal'

/**
 * Under Repair Reminder Modal
 * Notification-style popup when user accesses inventory and there are assets with "Under Repair" status.
 */
function UnderRepairReminderModal({
  isOpen,
  onClose,
  onDismiss,
  underRepairAssets = [],
  underRepairCount = 0,
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
          className="absolute -top-1 -right-1 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Notification Header Banner — amber to match Under Repair status color */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-white leading-tight">
                Under Repair Notification
              </h2>
              <p className="text-amber-100 text-xs mt-0.5">
                {underRepairCount} asset{underRepairCount !== 1 ? 's' : ''} currently under repair
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex-shrink-0">
              <span className="text-xl font-bold text-white">{underRepairCount}</span>
            </div>
          </div>
        </div>

        {/* Asset List */}
        {underRepairAssets.length > 0 && (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 mb-5">
            {underRepairAssets.slice(0, 8).map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg border border-slate-200 bg-white hover:border-amber-200 hover:shadow-sm transition-all"
              >
                {/* Asset Name Row */}
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate flex-1">
                    {asset.asset_name}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {asset.days_under_repair === 0
                      ? 'Today'
                      : `${asset.days_under_repair}d`}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-3.5 py-2.5 text-xs">
                  {asset.serial_number && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{asset.serial_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Layers className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{asset.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{asset.branch}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{asset.assigned_to}</span>
                  </div>
                </div>
              </div>
            ))}

            {underRepairAssets.length > 8 && (
              <p className="text-xs text-slate-500 text-center py-1">
                +{underRepairAssets.length - 8} more asset{underRepairAssets.length - 8 !== 1 ? 's' : ''} under repair
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleGoToRepairs}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
          >
            <span>Go to Repairs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default UnderRepairReminderModal
