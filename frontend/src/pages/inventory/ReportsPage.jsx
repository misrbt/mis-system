import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  Download,
  Filter,
  X,
  Package,
  DollarSign,
  TrendingDown,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  FileType,
  Loader2,
  Printer,
} from 'lucide-react'
import reportService from '../../services/reportService'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

function ReportsPage() {
  const queryClient = useQueryClient()
  const [showFilters, setShowFilters] = useState(true)
  const [reportType, setReportType] = useState('custom')
  const [filters, setFilters] = useState({
    purchase_date_from: '',
    purchase_date_to: '',
    branch_id: '',
    category_id: '',
    status_id: '',
    vendor_id: '',
    assigned_to_employee_id: '',
    search: '',
  })
  const [exportLoading, setExportLoading] = useState({ xlsx: false, pdf: false })

  // Fetch filter options
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get('/branches')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: statuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const response = await apiClient.get('/statuses')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/vendors')
      return normalizeArrayResponse(response.data)
    },
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees')
      return normalizeArrayResponse(response.data)
    },
  })

  // Fetch report data
  const {
    data: reportData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['asset-report', filters],
    queryFn: () => reportService.getAssetReport(filters),
    enabled: false, // Manual trigger
  })

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      purchase_date_from: '',
      purchase_date_to: '',
      branch_id: '',
      category_id: '',
      status_id: '',
      vendor_id: '',
      assigned_to_employee_id: '',
      search: '',
    })
  }

  // Quick report templates
  const applyTemplate = (template) => {
    const now = new Date()
    let dateFrom, dateTo

    switch (template) {
      case 'current-month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
        dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'last-month':
        dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        dateTo = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'ytd':
        dateFrom = new Date(now.getFullYear(), 0, 1)
        dateTo = now
        break
      case 'custom':
      default:
        return
    }

    setFilters((prev) => ({
      ...prev,
      purchase_date_from: dateFrom.toISOString().split('T')[0],
      purchase_date_to: dateTo.toISOString().split('T')[0],
    }))
    setReportType(template)
  }

  // Generate report
  const handleGenerateReport = () => {
    if (!filters.purchase_date_from && !filters.purchase_date_to && !Object.values(filters).some(v => v)) {
      Swal.fire({
        icon: 'warning',
        title: 'No Filters Selected',
        text: 'Please select at least one filter or date range',
      })
      return
    }

    refetch()
  }

  // Export to Excel
  const handleExportXLSX = () => {
    if (!reportData?.data?.assets || reportData.data.assets.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'Please generate a report first',
      })
      return
    }

    setExportLoading(prev => ({ ...prev, xlsx: true }))

    try {
      const assets = reportData.data.assets

      // Prepare data for Excel
      const excelData = assets.map((asset, index) => ({
        '#': index + 1,
        'Asset Name': asset.asset_name,
        'Serial Number': asset.serial_number || '—',
        'Category': asset.category?.name || '—',
        'Brand': asset.brand || '—',
        'Model': asset.model || '—',
        'Status': asset.status?.name || '—',
        'Assigned To': asset.assigned_employee?.fullname || 'Unassigned',
        'Branch': asset.assigned_employee?.branch?.branch_name || '—',
        'Purchase Date': asset.purchase_date || '—',
        'Acq. Cost': asset.acq_cost || 0,
        'Book Value': asset.book_value || 0,
        'Vendor': asset.vendor?.company_name || '—',
        'Remarks': asset.remarks || '—',
      }))

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      const columnWidths = [
        { wch: 5 },  // #
        { wch: 25 }, // Asset Name
        { wch: 15 }, // Serial Number
        { wch: 15 }, // Category
        { wch: 15 }, // Brand
        { wch: 15 }, // Model
        { wch: 12 }, // Status
        { wch: 20 }, // Assigned To
        { wch: 15 }, // Branch
        { wch: 12 }, // Purchase Date
        { wch: 12 }, // Acq. Cost
        { wch: 12 }, // Book Value
        { wch: 20 }, // Vendor
        { wch: 30 }, // Remarks
      ]
      worksheet['!cols'] = columnWidths

      // Create workbook and add worksheet
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets')

      // Add summary sheet
      const summary = reportData.data.summary
      const summaryData = [
        { Metric: 'Total Assets', Value: summary.total_count },
        { Metric: 'Total Acquisition Cost', Value: `₱${summary.total_acquisition_cost.toLocaleString()}` },
        { Metric: 'Total Book Value', Value: `₱${summary.total_book_value.toLocaleString()}` },
        { Metric: 'Total Depreciation', Value: `₱${summary.total_depreciation.toLocaleString()}` },
      ]
      const summarySheet = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

      // Generate filename
      const filename = `asset-report-${new Date().toISOString().split('T')[0]}.xlsx`

      // Save file
      XLSX.writeFile(workbook, filename)

      Swal.fire({
        icon: 'success',
        title: 'Export Successful!',
        text: `Downloaded ${filename}`,
        timer: 2000,
      })
    } catch (error) {
      console.error('Export error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: error.message || 'Failed to export to Excel',
      })
    } finally {
      setExportLoading(prev => ({ ...prev, xlsx: false }))
    }
  }

  // Export to PDF
  const handleExportPDF = async () => {
    if (!reportData?.data?.assets || reportData.data.assets.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'Please generate a report first',
      })
      return
    }

    setExportLoading(prev => ({ ...prev, pdf: true }))

    try {
      const response = await reportService.exportPDF(filters)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `asset-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      Swal.fire({
        icon: 'success',
        title: 'Export Successful!',
        text: 'PDF downloaded successfully',
        timer: 2000,
      })
    } catch (error) {
      console.error('PDF export error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: error.response?.data?.message || 'Failed to export to PDF',
      })
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }))
    }
  }

  // Print report
  const handlePrint = () => {
    if (!reportData?.data?.assets || reportData.data.assets.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'Please generate a report first',
      })
      return
    }

    window.print()
  }

  const assets = reportData?.data?.assets || []
  const summary = reportData?.data?.summary || null

  return (
    <div className="space-y-6">
      {/* Print-only Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
          IT Asset Report
        </h1>
        <p className="text-center text-sm text-slate-600">
          RBT Bank - Information Technology Department
        </p>
        <p className="text-center text-xs text-slate-500 mt-1">
          Generated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        {(filters.purchase_date_from || filters.purchase_date_to) && (
          <p className="text-center text-xs text-slate-500 mt-1 italic">
            {filters.purchase_date_from && filters.purchase_date_to
              ? `Date Range: ${new Date(filters.purchase_date_from).toLocaleDateString()} - ${new Date(filters.purchase_date_to).toLocaleDateString()}`
              : filters.purchase_date_from
              ? `From: ${new Date(filters.purchase_date_from).toLocaleDateString()}`
              : `To: ${new Date(filters.purchase_date_to).toLocaleDateString()}`
            }
          </p>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">IT Asset Reports</h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Generate comprehensive reports with custom filters and export options
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 no-print">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Report Template
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => applyTemplate('current-month')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              reportType === 'current-month'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 hover:border-blue-300 text-slate-700'
            }`}
          >
            <Calendar className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Current Month</div>
          </button>
          <button
            onClick={() => applyTemplate('last-month')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              reportType === 'last-month'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 hover:border-blue-300 text-slate-700'
            }`}
          >
            <Calendar className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Last Month</div>
          </button>
          <button
            onClick={() => applyTemplate('ytd')}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              reportType === 'ytd'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 hover:border-blue-300 text-slate-700'
            }`}
          >
            <BarChart3 className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Year-to-Date</div>
          </button>
          <button
            onClick={() => {
              setReportType('custom')
              handleClearFilters()
            }}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              reportType === 'custom'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 hover:border-blue-300 text-slate-700'
            }`}
          >
            <FileText className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Custom</div>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 no-print">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters
          </h2>

          <div className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Purchase Date From
                </label>
                <input
                  type="date"
                  value={filters.purchase_date_from}
                  onChange={(e) => handleFilterChange('purchase_date_from', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Purchase Date To
                </label>
                <input
                  type="date"
                  value={filters.purchase_date_to}
                  onChange={(e) => handleFilterChange('purchase_date_to', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Categories</option>
                  {(Array.isArray(categories) ? categories : []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={filters.status_id}
                  onChange={(e) => handleFilterChange('status_id', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Statuses</option>
                  {(Array.isArray(statuses) ? statuses : []).map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Branch and Vendor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
                <select
                  value={filters.branch_id}
                  onChange={(e) => handleFilterChange('branch_id', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Branches</option>
                  {(Array.isArray(branches) ? branches : []).map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vendor</label>
                <select
                  value={filters.vendor_id}
                  onChange={(e) => handleFilterChange('vendor_id', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Vendors</option>
                  {(Array.isArray(vendors) ? vendors : []).map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by asset name, serial number, brand, or model..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isFetching}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generate Preview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Total Assets</div>
                <div className="text-2xl font-bold text-slate-900">{summary.total_count}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Acquisition Cost</div>
                <div className="text-xl font-bold text-slate-900">
                  ₱{summary.total_acquisition_cost.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Book Value</div>
                <div className="text-xl font-bold text-slate-900">
                  ₱{summary.total_book_value.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Depreciation</div>
                <div className="text-xl font-bold text-slate-900">
                  ₱{summary.total_depreciation.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      {assets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 no-print">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Export Options
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportXLSX}
              disabled={exportLoading.xlsx}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {exportLoading.xlsx ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-5 h-5" />
              )}
              Export as Excel (XLSX)
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exportLoading.pdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {exportLoading.pdf ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileType className="w-5 h-5" />
              )}
              Export as PDF
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
            >
              <Printer className="w-5 h-5" />
              Print Report
            </button>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {isLoading || isFetching ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Generating report...</p>
        </div>
      ) : assets.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Report Preview ({assets.length} assets)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Asset Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Serial #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Branch</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Acq. Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Book Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {assets.map((asset, index) => (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{asset.asset_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{asset.serial_number || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{asset.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {asset.status?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {asset.assigned_employee?.branch?.branch_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-900 font-medium">
                      ₱{(asset.acq_cost || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-900 font-medium">
                      ₱{(asset.book_value || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : reportData ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Assets Found</h3>
          <p className="text-slate-600 mb-4">Try adjusting your filters or date range</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Generate Report</h3>
          <p className="text-slate-600 mb-4">Select your filters and click "Generate Preview" to create a report</p>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
