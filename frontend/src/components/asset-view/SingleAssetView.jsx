/**
 * Single Asset View Component
 * Displays detailed view of individual asset with movement tracking
 */

import React, { useState } from 'react'
import { useNavigate, createPortal } from 'react-router-dom'
import {
  Package,
  User,
  ArrowLeft,
  Activity,
  ArrowRight,
  CornerUpLeft,
  RefreshCw,
  History,
  BarChart3,
  ChevronDown,
  Users,
  Wrench,
  MapPin,
  Clock,
  X,
  QrCode,
  Barcode,
} from 'lucide-react'
import AssetMovementTimeline from '../AssetMovementTimeline'
import AssetAssignmentHistory from '../AssetAssignmentHistory'
import TransferAssetModal from '../TransferAssetModal'
import ReturnAssetModal from '../ReturnAssetModal'
import StatusUpdateModal from '../StatusUpdateModal'
import RepairFormModal from '../RepairFormModal'

const SingleAssetView = ({
  asset,
  statistics,
  movements,
  assignments,
  isLoadingMovements,
  isLoadingAssignments,
  statuses,
  statusColorMap,
  statusPickerFor,
  onStatusPickerToggle,
  onQuickStatusChange,
  codeModal,
  onCodeModalClose,
  onDownloadCode,
  onPrintCode,
}) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('timeline')
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false)

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Asset Not Found</h2>
        <button
          onClick={() => navigate('/inventory/assets')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Assets
        </button>
      </div>
    )
  }

  const currentEmployee = asset?.assigned_employee
  const currentStatus = asset?.status
  const currentAssignmentDays = statistics?.current_assignment_days || 0

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {codeModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-200"
            onClick={onCodeModalClose}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {codeModal.type === 'qr' ? (
                      <QrCode className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Barcode className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">
                      {codeModal.type === 'qr' ? 'QR Code' : 'Barcode'}
                    </div>
                    <div className="text-lg font-semibold text-slate-800">{codeModal.title}</div>
                  </div>
                </div>
                <button
                  onClick={onCodeModalClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                  {/* Image container */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <img
                      src={codeModal.src}
                      alt={codeModal.title || 'Code'}
                      className="w-full max-w-lg object-contain"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <button
                      onClick={onDownloadCode}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download</span>
                    </button>

                    <button
                      onClick={onPrintCode}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print</span>
                    </button>

                    <button
                      onClick={onCodeModalClose}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Back button and Asset info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/inventory/assets')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {asset.brand} {asset.model}
                </h1>
                <p className="text-sm text-gray-600">Serial: {asset.serial_number}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 items-center">
              <div className="relative">
                <button
                  onClick={() => onStatusPickerToggle(asset.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <span
                    className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold border"
                    style={{
                      backgroundColor: statusColorMap[asset?.status_id] || '#E2E8F0',
                      color: statusColorMap[asset?.status_id] ? '#fff' : '#1e293b',
                      borderColor: statusColorMap[asset?.status_id] || '#cbd5e1',
                    }}
                  >
                    {asset?.status?.name || 'Status'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {statusPickerFor === asset.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    <select
                      value={asset?.status_id || ''}
                      onChange={(e) => {
                        onQuickStatusChange(asset.id, e.target.value)
                        onStatusPickerToggle(null)
                      }}
                      className="w-full px-3 py-2 text-sm border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select status</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsTransferModalOpen(true)}
                disabled={!currentEmployee}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Transfer
              </button>
              <button
                onClick={() => setIsReturnModalOpen(true)}
                disabled={!currentEmployee}
                className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <CornerUpLeft className="w-4 h-4" />
                Return
              </button>
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Update Status
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Assignments</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {statistics?.assignment_count || 0}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <ArrowRight className="w-4 h-4" />
                <span className="text-xs font-medium">Transfers</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {statistics?.transfer_count || 0}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <Wrench className="w-4 h-4" />
                <span className="text-xs font-medium">Repairs</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {statistics?.repair_count || 0}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium">Status Changes</span>
              </div>
              <p className="text-2xl font-bold text-indigo-900">
                {statistics?.status_change_count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Asset Info */}
          <div className="col-span-4 space-y-6">
            {/* Current Assignment Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Current Assignment
              </h3>
              {currentEmployee ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{currentEmployee.fullname}</p>
                      {currentEmployee.position && (
                        <p className="text-sm text-gray-600">{currentEmployee.position.position_name}</p>
                      )}
                      {currentEmployee.branch && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {currentEmployee.branch.branch_name}
                        </div>
                      )}
                    </div>
                  </div>
                  {currentAssignmentDays > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          Assigned for <strong>{currentAssignmentDays} days</strong>
                        </span>
                      </div>
                    </div>
                  )}
                  {/* View All Employee Assets Button */}
                  <div className="pt-3 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/inventory/employees/${currentEmployee.id}/assets`)}
                      className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      View All {currentEmployee.fullname.split(' ')[0]}'s Assets
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 text-sm">Not assigned</p>
                  <p className="text-gray-400 text-xs mt-1">Asset is in inventory</p>
                </div>
              )}
            </div>

            {/* Current Status & Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Asset Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="font-medium text-gray-900">{currentStatus?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{asset.category?.name || 'N/A'}</span>
                </div>
                {asset.purchase_date && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Purchase Date</span>
                    <span className="font-medium text-gray-900">
                      {new Date(asset.purchase_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {asset.acq_cost && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Acquisition Cost</span>
                    <span className="font-medium text-gray-900">
                      ₱{parseFloat(asset.acq_cost).toLocaleString()}
                    </span>
                  </div>
                )}
                {asset.book_value !== null && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Book Value</span>
                    <span className="font-medium text-gray-900">
                      ₱{parseFloat(asset.book_value).toLocaleString()}
                    </span>
                  </div>
                )}
                {asset.vendor && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Vendor</span>
                    <span className="font-medium text-gray-900">{asset.vendor.company_name}</span>
                  </div>
                )}
                {asset.warranty_expiration && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Warranty Expiration</span>
                    <span className="font-medium text-gray-900">
                      {new Date(asset.warranty_expiration).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Movement History */}
          <div className="col-span-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex gap-0">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'timeline'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    Movement Timeline
                  </button>
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                      activeTab === 'assignments'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Assignment History
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'timeline' && (
                  <AssetMovementTimeline
                    movements={movements}
                    loading={isLoadingMovements}
                  />
                )}
                {activeTab === 'assignments' && (
                  <AssetAssignmentHistory
                    assignments={assignments}
                    loading={isLoadingAssignments}
                    currentEmployeeId={currentEmployee?.id}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransferAssetModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        asset={asset}
      />
      <ReturnAssetModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        asset={asset}
      />
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        asset={asset}
        onAfterUpdate={() => {
          // Auto-open repair modal when status changes to "Under Repair"
          setIsRepairModalOpen(true)
        }}
      />
      <RepairFormModal
        isOpen={isRepairModalOpen}
        onClose={() => setIsRepairModalOpen(false)}
        asset={asset}
      />
    </div>
  )
}

export default React.memo(SingleAssetView)
