import React from 'react'
import { ArrowLeft, Activity, Monitor, Package, Plus, RefreshCw, User } from 'lucide-react'

const AssetComponentsHeader = ({
  asset,
  components,
  onBack,
  onAdd,
}) => {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Monitor className="w-4 h-4" />
              <span>Desktop PC Components</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {asset?.brand} {asset?.model}
            </h1>
          </div>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Component
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs font-medium">Total Components</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{components.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {components.filter((c) => c.status?.name?.toLowerCase().includes('active')).length}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs font-medium">In Repair</span>
            </div>
            <p className="text-2xl font-bold text-amber-900">
              {components.filter((c) => c.status?.name?.toLowerCase().includes('repair')).length}
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <User className="w-4 h-4" />
              <span className="text-xs font-medium">Assigned</span>
            </div>
            <p className="text-2xl font-bold text-indigo-900">
              {components.filter((c) => c.assigned_employee).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(AssetComponentsHeader)
