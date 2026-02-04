import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Download, Calendar, FileSpreadsheet } from 'lucide-react'
import apiClient from '../../services/apiClient'
import * as XLSX from 'xlsx-js-style'

function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  // Fetch audit logs from inventory audit logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo) params.append('date_to', dateTo)
      
      const response = await apiClient.get('/audit-logs', { params })
      return response.data?.data || []
    },
  })

  // Export to Excel
  const handleExportExcel = () => {
    const excelData = filteredLogs.map(log => ({
      'Date & Time': new Date(log.timestamp || log.created_at).toLocaleString(),
      'User': log.user?.name || 'System',
      'Action': log.action || log.action_type,
      'Entity': log.entity_type,
      'Entity ID': log.entity_id,
      'Details': log.details || log.description || '',
      'IP Address': log.ip_address || 'N/A'
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs')
    XLSX.writeFile(workbook, `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Filter logs
  const filteredLogs = logs?.filter((log) => {
    const matchesSearch = 
      log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAction = !actionFilter || log.action === actionFilter || log.action_type === actionFilter

    return matchesSearch && matchesAction
  }) || []

  const getActionColor = (action) => {
    const actionLower = (action || '').toLowerCase()
    if (actionLower.includes('create') || actionLower.includes('add')) return 'bg-green-100 text-green-700'
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'bg-blue-100 text-blue-700'
    if (actionLower.includes('delete') || actionLower.includes('remove')) return 'bg-red-100 text-red-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-600 mt-2">Track all system activities and changes</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-colors font-semibold"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">From Date</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">To Date</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Action Type</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="flex-1 outline-none text-sm"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Entity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-600">
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-600">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(log.timestamp || log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-indigo-600">
                            {(log.user?.name || 'S').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {log.user?.name || 'System'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action || log.action_type)}`}>
                        {log.action || log.action_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.entity_type || 'N/A'} 
                      {log.entity_id && <span className="text-slate-400"> (#{log.entity_id})</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">
                      {log.details || log.description || 'No details'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <p className="text-sm text-slate-600">Total Logs</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{filteredLogs.length}</p>
      </div>
    </div>
  )
}

export default AuditLogs
