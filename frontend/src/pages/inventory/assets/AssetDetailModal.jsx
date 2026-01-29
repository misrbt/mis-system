import React from 'react'
import Modal from '../../../components/Modal'
import { X, Calendar, DollarSign, Package, User, FileText, Building, Wrench, Clock, Tag, QrCode } from 'lucide-react'
import { formatCurrency, formatDate } from '../../../utils/assetFormatters'

const AssetDetailModal = ({ isOpen, onClose, asset, onEdit, onDelete, onViewHistory }) => {
  if (!asset) return null

  const EMPTY_VALUE = '—'
  const CURRENCY_PREFIX = '₱'

  const InfoRow = ({ icon: Icon, label, value, valueClassName = '' }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
        <div className={`text-sm text-slate-900 break-words ${valueClassName}`}>
          {value || EMPTY_VALUE}
        </div>
      </div>
    </div>
  )

  const Badge = ({ children, color = 'slate' }) => {
    const colorMap = {
      slate: 'bg-slate-100 text-slate-700 border-slate-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colorMap[color]}`}>
        {children}
      </span>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asset Details" size="xl">
      <div className="space-y-6">
        {/* Header with Asset Name and Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{asset.asset_name}</h3>
              <div className="flex flex-wrap items-center gap-2">
                {asset.category && (
                  <Badge color="blue">
                    <Package className="w-3 h-3 mr-1" />
                    {asset.category.name}
                  </Badge>
                )}
                {asset.subcategory && (
                  <Badge color="purple">
                    {asset.subcategory.name}
                  </Badge>
                )}
                {asset.status && (
                  <span 
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border"
                    style={{
                      backgroundColor: asset.status.color || '#f8fafc',
                      color: asset.status.color ? '#f1f1f1' : '#000',
                      borderColor: asset.status.color || '#e2e8f0',
                    }}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {asset.status.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              {asset.serial_number && (
                <div className="bg-white rounded-lg p-2 border border-slate-200 text-center">
                  <QrCode className="w-12 h-12 mx-auto text-slate-700 mb-1" />
                  <div className="text-xs font-mono text-slate-600">{asset.serial_number}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Basic Information
              </h4>
              <div className="space-y-0">
                <InfoRow 
                  icon={Package} 
                  label="Serial Number" 
                  value={asset.serial_number}
                  valueClassName="font-mono text-xs"
                />
                <InfoRow 
                  icon={Building} 
                  label="Brand" 
                  value={asset.brand || asset.equipment?.brand}
                />
                <InfoRow 
                  icon={Wrench} 
                  label="Model" 
                  value={asset.model || asset.equipment?.model}
                />
                {asset.vendor && (
                  <InfoRow 
                    icon={Building} 
                    label="Vendor" 
                    value={asset.vendor.company_name}
                  />
                )}
              </div>
            </div>

            {/* Assignment Information */}
            {asset.assigned_employee && (
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Assignment
                </h4>
                <div className="space-y-0">
                  <InfoRow 
                    icon={User} 
                    label="Employee" 
                    value={asset.assigned_employee.fullname}
                    valueClassName="font-semibold"
                  />
                  <InfoRow 
                    icon={Building} 
                    label="Position" 
                    value={asset.assigned_employee.position?.title}
                  />
                  <InfoRow 
                    icon={Building} 
                    label="Branch" 
                    value={asset.assigned_employee.branch?.branch_name}
                  />
                  <InfoRow 
                    icon={Building} 
                    label="Department" 
                    value={asset.assigned_employee.department?.name}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Financial Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                Financial Details
              </h4>
              <div className="space-y-0">
                <InfoRow 
                  icon={DollarSign} 
                  label="Acquisition Cost" 
                  value={asset.acq_cost ? formatCurrency(asset.acq_cost, CURRENCY_PREFIX) : null}
                  valueClassName="font-semibold text-green-700"
                />
                <InfoRow 
                  icon={DollarSign} 
                  label="Book Value" 
                  value={asset.book_value ? formatCurrency(asset.book_value, CURRENCY_PREFIX) : null}
                  valueClassName="font-semibold text-blue-700"
                />
                <InfoRow 
                  icon={Calendar} 
                  label="Purchase Date" 
                  value={asset.purchase_date ? formatDate(asset.purchase_date) : null}
                />
                <InfoRow 
                  icon={Clock} 
                  label="Estimated Life" 
                  value={asset.estimate_life ? `${asset.estimate_life} years` : null}
                />
                {asset.waranty_expiration_date && (
                  <InfoRow 
                    icon={Calendar} 
                    label="Warranty Expiration" 
                    value={formatDate(asset.waranty_expiration_date)}
                  />
                )}
              </div>
            </div>

            {/* Specifications */}
            {asset.specifications && Object.keys(asset.specifications).length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-600" />
                  Specifications
                </h4>
                <div className="space-y-2">
                  {Object.entries(asset.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                      <span className="text-xs font-medium text-slate-500 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-slate-900 font-medium">
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remarks */}
        {asset.remarks && (
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              Remarks
            </h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{asset.remarks}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          {onViewHistory && (
            <button
              type="button"
              onClick={() => {
                onViewHistory(asset)
                onClose()
              }}
              className="px-5 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              View History
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit(asset)
                onClose()
              }}
              className="px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Edit Asset
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(asset)
                onClose()
              }}
              className="px-5 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete Asset
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AssetDetailModal
