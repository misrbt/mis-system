import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  Download,
  Filter,
  X,
  Package,
  Calendar,
  FileSpreadsheet,
  FileType,
  Loader2,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import reportService from '../../services/reportService'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx-js-style'

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState({
    report_date_from: '',
    report_date_to: '',
    branch_id: '',
    status_id: '',
  })
  const [exportLoading, setExportLoading] = useState({ xlsx: false, pdf: false })

  const setLayoutParam = (value) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value) {
      nextParams.set('layout', value)
    } else {
      nextParams.delete('layout')
    }
    setSearchParams(nextParams, { replace: true })
  }

  const statusStyle = (status) => {
    const color = status?.color
    if (!color) return {}
    return {
      backgroundColor: color,
      color: '#fff',
      border: `1px solid ${color}`,
    }
  }

  // Fetch filter options
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get('/branches')
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
      report_date_from: '',
      report_date_to: '',
      branch_id: '',
      status_id: '',
    })
    setLayoutParam(null)
  }

  // Generate report
  const handleGenerateReport = () => {
    // Validate required fields
    if (!filters.report_date_to) {
      Swal.fire({
        icon: 'warning',
        title: 'Snapshot Date Required',
        text: 'Please select the "To Date" to generate a snapshot report of assets as of that date',
      })
      return
    }

    // Hide filters after generating report
    setShowFilters(false)
    setLayoutParam('wide')
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
      const groupedByEmployee = reportData.data.grouped_by_employee

      // Prepare data for Excel with comprehensive columns
      const excelData = []

      groupedByEmployee.forEach((group) => {
        group.assets.forEach((asset, assetIndex) => {
          const isFirstAsset = assetIndex === 0

          // Calculate expiration date
          const purchaseDate = asset.purchase_date ? new Date(asset.purchase_date) : null
          const estLife = asset.estimated_life || 3
          const expirationDate = purchaseDate
            ? new Date(purchaseDate.setFullYear(purchaseDate.getFullYear() + estLife))
            : null

          let userName = ''
          if (isFirstAsset) {
            userName = group.employee?.fullname || 'Unassigned'
            if (group.employee?.position) {
              userName += ` - ${group.employee.position.title}`
            }
            if (group.employee?.branch) {
              userName += ` (${group.employee.branch.branch_name})`
            }
          }

          excelData.push({
            'Name of User': userName,
            'Equipment': asset.asset_name,
            'Serial No.': asset.serial_number || '—',
            'Date Acq': asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString('en-US') : '—',
            'Type': asset.category?.name || '—',
            'Vendor': asset.vendor?.company_name || '—',
            'Acq Cost': asset.acq_cost || 0,
            'Est. Life (Year)': asset.estimated_life || 3,
            'Expiration Date': expirationDate ? expirationDate.toLocaleDateString('en-US') : '—',
            'Current Date': new Date().toLocaleDateString('en-US'),
            'Book Value': asset.book_value || 0,
            'Remarks': asset.remarks || '—',
            'Status': asset.status?.name || '—',
          })
        })
      })

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      const columnWidths = [
        { wch: 30 }, // Name of User (with Branch)
        { wch: 30 }, // Equipment
        { wch: 18 }, // Serial No.
        { wch: 12 }, // Date Acq
        { wch: 15 }, // Type
        { wch: 25 }, // Vendor
        { wch: 14 }, // Acq Cost
        { wch: 12 }, // Est. Life (Year)
        { wch: 14 }, // Expiration Date
        { wch: 14 }, // Current Date
        { wch: 14 }, // Book Value
        { wch: 35 }, // Remarks
        { wch: 12 }, // Status
      ]
      worksheet['!cols'] = columnWidths

      // Apply styling to worksheet
      const range = XLSX.utils.decode_range(worksheet['!ref'])

      // Style header row (row 0)
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!worksheet[cellAddress]) continue

        worksheet[cellAddress].s = {
          fill: {
            fgColor: { rgb: "4F46E5" } // Indigo-600 color
          },
          font: {
            bold: true,
            color: { rgb: "FFFFFF" }, // White text
            sz: 11,
            name: 'Arial'
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          },
          border: {
            top: { style: 'thin', color: { rgb: "3730A3" } },
            bottom: { style: 'thin', color: { rgb: "3730A3" } },
            left: { style: 'thin', color: { rgb: "3730A3" } },
            right: { style: 'thin', color: { rgb: "3730A3" } }
          }
        }
      }

      // Style data rows
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!worksheet[cellAddress]) continue

          // Base styling for all cells
          const cellStyle = {
            font: {
              name: 'Arial',
              sz: 10
            },
            alignment: {
              vertical: 'center',
              wrapText: true
            },
            border: {
              top: { style: 'thin', color: { rgb: "CBD5E1" } },
              bottom: { style: 'thin', color: { rgb: "CBD5E1" } },
              left: { style: 'thin', color: { rgb: "CBD5E1" } },
              right: { style: 'thin', color: { rgb: "CBD5E1" } }
            }
          }

          // Alternating row colors
          if (row % 2 === 0) {
            cellStyle.fill = {
              fgColor: { rgb: "F8FAFC" } // Light slate background
            }
          }

          // Special alignment for specific columns
          const headers = Object.keys(excelData[0])
          const columnName = headers[col]

          if (columnName === 'Name of User') {
            cellStyle.alignment.horizontal = 'left'
            cellStyle.font.bold = true
          } else if (columnName === 'Acq Cost' || columnName === 'Book Value') {
            cellStyle.alignment.horizontal = 'right'
            cellStyle.numFmt = '#,##0.00' // Number format for currency
          } else if (columnName === 'Est. Life (Year)') {
            cellStyle.alignment.horizontal = 'center'
          } else {
            cellStyle.alignment.horizontal = 'left'
          }

          worksheet[cellAddress].s = cellStyle
        }
      }

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

      // Set column widths for summary sheet
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 25 }]

      // Style summary sheet
      const summaryRange = XLSX.utils.decode_range(summarySheet['!ref'])

      // Style header row
      for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!summarySheet[cellAddress]) continue

        summarySheet[cellAddress].s = {
          fill: {
            fgColor: { rgb: "4F46E5" } // Indigo-600 color
          },
          font: {
            bold: true,
            color: { rgb: "FFFFFF" },
            sz: 11,
            name: 'Arial'
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          },
          border: {
            top: { style: 'thin', color: { rgb: "3730A3" } },
            bottom: { style: 'thin', color: { rgb: "3730A3" } },
            left: { style: 'thin', color: { rgb: "3730A3" } },
            right: { style: 'thin', color: { rgb: "3730A3" } }
          }
        }
      }

      // Style data rows in summary
      for (let row = summaryRange.s.r + 1; row <= summaryRange.e.r; row++) {
        for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          if (!summarySheet[cellAddress]) continue

          const cellStyle = {
            font: {
              name: 'Arial',
              sz: 10,
              bold: col === 0 // Bold for metric names
            },
            alignment: {
              vertical: 'center',
              horizontal: col === 0 ? 'left' : 'right'
            },
            border: {
              top: { style: 'thin', color: { rgb: "CBD5E1" } },
              bottom: { style: 'thin', color: { rgb: "CBD5E1" } },
              left: { style: 'thin', color: { rgb: "CBD5E1" } },
              right: { style: 'thin', color: { rgb: "CBD5E1" } }
            }
          }

          // Alternating row colors
          if (row % 2 === 0) {
            cellStyle.fill = {
              fgColor: { rgb: "F8FAFC" }
            }
          }

          summarySheet[cellAddress].s = cellStyle
        }
      }

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

  const groupedByEmployee = reportData?.data?.grouped_by_employee || []
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
        {(filters.report_date_from || filters.report_date_to) && (
          <p className="text-center text-xs text-slate-500 mt-1 italic">
            {filters.report_date_from && filters.report_date_to
              ? `Report Date Range: ${new Date(filters.report_date_from).toLocaleDateString()} - ${new Date(filters.report_date_to).toLocaleDateString()}`
              : filters.report_date_from
              ? `Report Date From: ${new Date(filters.report_date_from).toLocaleDateString()}`
              : `Report Date To: ${new Date(filters.report_date_to).toLocaleDateString()}`
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
            className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-lg transition-all shadow-sm hover:shadow-md ${
              showFilters
                ? 'bg-slate-100 text-slate-700 border-2 border-slate-300 hover:bg-slate-200'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            {showFilters ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Report Generation Panel */}
      {showFilters && (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden no-print">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Generate IT Asset Report</h2>
            </div>
            <p className="text-blue-100 text-sm ml-14">
              Configure your report parameters and generate comprehensive asset insights
            </p>
          </div>

          {/* Filter Content */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Date Range Section */}
              <div className="bg-white rounded-lg border-2 border-blue-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Report Date Range</h3>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Required</span>
                </div>
                <p className="text-sm text-slate-600 mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <strong>Note:</strong> This report shows <strong>all IT assets</strong> that were acquired on or before the "To Date".
                  Assets are only excluded if they were purchased after the selected date range.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      From Date
                      <span className="text-xs font-normal text-slate-500 ml-2">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={filters.report_date_from}
                      onChange={(e) => handleFilterChange('report_date_from', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      To Date (Snapshot Date)
                      <span className="text-xs font-normal text-blue-600 ml-2">Main Filter</span>
                    </label>
                    <input
                      type="date"
                      value={filters.report_date_to}
                      onChange={(e) => handleFilterChange('report_date_to', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium bg-blue-50"
                    />
                  </div>
                </div>
              </div>

              {/* Branch Section */}
              <div className="bg-white rounded-lg border-2 border-indigo-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Branch</h3>
                  <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">Optional</span>
                </div>
                <select
                  value={filters.branch_id}
                  onChange={(e) => handleFilterChange('branch_id', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all text-slate-900 font-medium cursor-pointer"
                >
                  <option value="">All Branches</option>
                  {(Array.isArray(branches) ? branches : []).map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Section */}
              <div className="bg-white rounded-lg border-2 border-purple-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Status</h3>
                  <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">Optional</span>
                </div>
                <select
                  value={filters.status_id}
                  onChange={(e) => handleFilterChange('status_id', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all text-slate-900 font-medium cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {(Array.isArray(statuses) ? statuses : []).map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  <X className="w-5 h-5" />
                  Clear All Filters
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={isFetching}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 sm:ml-auto"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Table - Comprehensive Asset Report */}
      {isLoading || isFetching ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Generating report...</p>
        </div>
      ) : groupedByEmployee.length > 0 ? (
        <div className="space-y-6">
          {/* Export Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 no-print">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Export Options
            </h2>
            <div className="flex flex-wrap gap-3">
              {/* Print Button - Made prominent and first */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg ring-2 ring-blue-300 text-base"
              >
                <Printer className="w-6 h-6" />
                Print Report
              </button>
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
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-300">
                <thead className="bg-gradient-to-r from-indigo-600 to-blue-600">
                  <tr>
                    <th className="px-3 py-3 text-center text-xs font-bold text-white uppercase border-r border-indigo-500">Name of User</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Equipment</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Serial No.</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Date Acq</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Vendor</th>
                    <th className="px-3 py-3 text-right text-xs font-bold text-white uppercase border-r border-indigo-500">Acq Cost</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Est. Life (Year)</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Expiration Date</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Current Date</th>
                    <th className="px-3 py-3 text-right text-xs font-bold text-white uppercase border-r border-indigo-500">Book Value</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Remarks</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {groupedByEmployee.map((group, groupIndex) => {
                    return group.assets.map((asset, assetIndex) => {
                      const isFirstAsset = assetIndex === 0
                      const isLastAsset = assetIndex === group.assets.length - 1
                      const groupTopBorderClass = isFirstAsset ? 'border-t-2 border-t-indigo-300' : ''
                      const groupBottomBorderClass = isLastAsset ? 'border-b-2 border-b-indigo-300' : ''
                      const groupRowBorderClass = `${groupTopBorderClass} ${groupBottomBorderClass}`.trim()
                      const groupHeaderBorderClass = 'border-t-2 border-b-2 border-t-indigo-300 border-b-indigo-300'

                      // Calculate expiration date (purchase date + estimated life)
                      const purchaseDate = asset.purchase_date ? new Date(asset.purchase_date) : null
                      const estLife = asset.estimated_life || 3
                      const expirationDate = purchaseDate
                        ? new Date(purchaseDate.setFullYear(purchaseDate.getFullYear() + estLife))
                        : null

                      return (
                        <tr
                          key={`${groupIndex}-${asset.id}`}
                          className="hover:bg-slate-50"
                        >
                          {isFirstAsset && (
                            <td
                              rowSpan={group.assets.length}
                              className={`px-3 py-2 text-sm text-center align-middle border-r border-slate-200 ${groupHeaderBorderClass}`}
                            >
                              <div>
                                <div className="font-semibold text-slate-900">{group.employee?.fullname || 'Unassigned'}</div>
                                {group.employee?.position && (
                                  <div className="text-xs text-slate-600 mt-0.5">{group.employee.position.title}</div>
                                )}
                                {group.employee?.branch && (
                                  <div className="text-xs text-slate-600">{group.employee.branch.branch_name}</div>
                                )}
                              </div>
                            </td>
                          )}
                          <td className={`px-3 py-2 text-sm text-slate-900 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {asset.asset_name}
                          </td>
                          <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {asset.serial_number || '—'}
                          </td>
                          <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : '—'}
                          </td>
                          <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {asset.category?.name || '—'}
                          </td>
                          <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {asset.vendor?.company_name || '—'}
                          </td>
                          <td className={`px-3 py-2 text-sm text-right text-slate-900 font-medium border-r border-slate-200 ${groupRowBorderClass}`}>
                            {(asset.acq_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`px-3 py-2 text-sm text-center text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {asset.estimated_life || 3}
                          </td>
                          <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {expirationDate ? expirationDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : '—'}
                          </td>
                          <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                          </td>
                          <td className={`px-3 py-2 text-sm text-right text-slate-900 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {(asset.book_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>
                            {asset.remarks || '-'}
                          </td>
                          <td className={`px-3 py-2 text-sm ${groupRowBorderClass}`}>
                            <span
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border"
                              style={statusStyle(asset.status)}
                            >
                              {asset.status?.name || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  }).flat()}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td colSpan={12} className="px-3 py-3 text-right text-sm font-semibold text-slate-700">
                      Grand Total (Acquisition Cost)
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-emerald-700">
                      ₱{(summary?.total_acquisition_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
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
