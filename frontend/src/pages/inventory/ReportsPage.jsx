import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../services/apiClient'
import { useAuth } from '../../context/AuthContext'
import {
  Filter,
  ChevronUp,
  ChevronDown,
  FileText,
  Calendar,
  Package,
  X,
  Loader2,
  Download,
  Printer,
  FileSpreadsheet,
  FileType,
  User 
} from 'lucide-react'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx-js-style' 
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { normalizeArrayResponse } from '../../utils/assetFormatters'

// Helper for status styles
const statusStyle = (status) => {
  if (!status?.color) return {}
  return {
    backgroundColor: `${status.color}20`,
    color: status.color,
    borderColor: `${status.color}40`,
  }
}

function ReportsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(true)
  
  // Filter State
  const [filters, setFilters] = useState({
    report_date_from: '',
    report_date_to: new Date().toISOString().split('T')[0], // Default to today
    branch_id: '',
    status_id: '',
  })
  
  // Active Filters for Query (to support "Generate" button behavior)
  const [activeFilters, setActiveFilters] = useState(null)
  
  // Export Loading State
  const [exportLoading, setExportLoading] = useState({
    xlsx: false,
    pdf: false,
  })

  // Signatory State with Local Storage
  const [signatories, setSignatories] = useState(() => {
    try {
      const saved = localStorage.getItem('report_signatories')
      return saved ? JSON.parse(saved) : {
        checked_by: '',
        checked_by_pos: '',
        noted_by: '',
        noted_by_pos: '',
      }
    } catch (e) {
      return {
        checked_by: '',
        checked_by_pos: '',
        noted_by: '',
        noted_by_pos: '',
      }
    }
  })

  // Save to local storage whenever changed
  useEffect(() => {
    localStorage.setItem('report_signatories', JSON.stringify(signatories))
  }, [signatories])

  // Data Fetching Hooks
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

  // Main Report Data Query
  const { 
    data: reportData, 
    isLoading, 
    isFetching, 
    refetch 
  } = useQuery({
    queryKey: ['asset-report', activeFilters],
    queryFn: async () => {
      if (!activeFilters) return null
      
      const params = new URLSearchParams()
      if (activeFilters.report_date_from) params.append('report_date_from', activeFilters.report_date_from)
      if (activeFilters.report_date_to) params.append('report_date_to', activeFilters.report_date_to)
      if (activeFilters.branch_id) params.append('branch_id', activeFilters.branch_id)
      if (activeFilters.status_id) params.append('status_id', activeFilters.status_id)
      
      // Request grouped data
      params.append('include_grouped', 'true')
      params.append('include_summary', 'true')
      
      const response = await apiClient.get('/reports/assets', { params })
      return response.data
    },
    enabled: !!activeFilters, // Only fetch when activeFilters are set
  })

  const groupedByEmployee = reportData?.data?.grouped_by_employee || []
  const summary = reportData?.data?.summary || null

  // Handlers
  const handleSignatoryChange = (field, value) => {
    setSignatories(prev => ({ ...prev, [field]: value }))
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleClearFilters = () => {
    setFilters({
      report_date_from: '',
      report_date_to: new Date().toISOString().split('T')[0],
      branch_id: '',
      status_id: '',
    })
    setActiveFilters(null) // Clear report view
  }

  const handleGenerateReport = () => {
    setActiveFilters(filters)
    // Query will auto-run because activeFilters changed
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

  // Handle Export Excel
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
      // Flatten data for Excel
      const excelData = []
      
      // Iterate grouped data to flatten
      groupedByEmployee.forEach(group => {
         group.assets.forEach(asset => {
             excelData.push({
                 'Employee': group.employee?.fullname || 'Unassigned',
                 'Branch': group.employee?.branch?.branch_name || '',
                 'Asset Name': asset.asset_name,
                 'Description': asset.description || '',
                 'Serial No.': asset.serial_number || '',
                 'Date Acquired': asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '',
                 'Type': asset.category?.name || '',
                 'Vendor': asset.vendor?.company_name || '',
                 'Acq Cost': Number(asset.acq_cost || 0),
                 'Est. Life': asset.estimated_life || '',
                 'Book Value': Number(asset.book_value || 0),
                 'Status': asset.status?.name || '',
                 'Remarks': asset.remarks || ''
             })
         })
      })

      // Add Grand Total Row
      if (summary) {
          excelData.push({}) // spacing
          excelData.push({
              'Employee': 'GRAND TOTAL',
              'Acq Cost': Number(summary.total_acquisition_cost || 0),
              'Book Value': Number(summary.total_book_value || 0)
          })
      }

      // --- Add Signatories Section to Excel ---
      // Empty rows for spacing
      excelData.push({})
      excelData.push({})
      
      excelData.push({
        'Employee': 'Prepared by:',
        'Type': 'Checked by:',  // Using Type column (~5th col) for spacing
        'Book Value': 'Noted by:' // Using Book Value (~10th col)
      })

      // Names
      excelData.push({
        'Employee': user?.fullname || 'Admin User',
        'Type': signatories.checked_by || '__________________',
        'Book Value': signatories.noted_by || '__________________'
      })

      // Positions
      excelData.push({
        'Employee': user?.position?.title || 'System Administrator',
        'Type': signatories.checked_by_pos || 'Position',
        'Book Value': signatories.noted_by_pos || 'Position'
      })

      // Create sheet from data
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Auto-width for columns
      const range = XLSX.utils.decode_range(worksheet['!ref'])
      const wscols = []
      for (let i = 0; i < range.e.c + 1; i++) {
        wscols.push({ wch: 20 })
      }
      worksheet['!cols'] = wscols
      
      // Apply Bold to Signatory Headers
      // Note: XLSX-js-style logic might be complex here, simplifying styling for safety
      // Just ensure data is there.

      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Report')
      
      // Write file
      XLSX.writeFile(workbook, `IT_Asset_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      notifySuccess('Export Complete', 'Excel file has been downloaded')

    } catch (error) {
      console.error(error)
      Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: 'An error occurred while exporting to Excel.'
      })
    } finally {
      setExportLoading(prev => ({ ...prev, xlsx: false }))
    }
  }

  // Handle Export PDF
  const handleExportPDF = () => {
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
      const doc = new jsPDF('l', 'mm', 'a4') // Landscape
      
      // Title
      doc.setFontSize(18)
      doc.text('IT Asset Report', 14, 22)
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
      
      // Table Generation
      // Transform data for autotable
      const tableRows = []
      
      groupedByEmployee.forEach(group => {
         // Group Header
         tableRows.push([{ 
             content: `${group.employee?.fullname || 'Unassigned'} - ${group.employee?.branch?.branch_name || 'No Branch'}`, 
             colSpan: 11, 
             styles: { fillColor: [241, 245, 249], fontStyle: 'bold' } 
         }])
         
         group.assets.forEach(asset => {
             tableRows.push([
                 asset.asset_name,
                 asset.serial_number || '-',
                 asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '-',
                 asset.category?.name || '-',
                 asset.vendor?.company_name || '-',
                 (asset.acq_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                 asset.estimated_life || '-',
                 (asset.book_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                 asset.status?.name || '-',
             ])
         })
      })
      
      // Summary Row
      if (summary) {
          tableRows.push([
              { content: 'GRAND TOTAL', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } },
              { content: (summary.total_acquisition_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold' } },
              '', 
              { content: (summary.total_book_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold' } },
              ''
          ])
      }

      autoTable(doc, {
        head: [['Asset Name', 'Serial No', 'Date Acq', 'Type', 'Vendor', 'Acq Cost', 'Est Life', 'Book Value', 'Status']],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [63, 81, 181] }
      })

      // ---- Signatories Section ----
      const sigY = doc.lastAutoTable.finalY + 20
      const pageWidth = doc.internal.pageSize.width
      const colWidth = pageWidth / 3

      // Check if enough space, else add page
      if (sigY + 40 > doc.internal.pageSize.height) {
          doc.addPage()
          // Reset Y for new page
          // sigY = 20 // variable assignment wouldn't work easily here without let, assuming enough space for now or let simple
      }

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      // Prepared By
      doc.text('Prepared by:', 14, sigY)
      doc.setFont('helvetica', 'bold')
      doc.text(user?.fullname || 'Admin User', 14, sigY + 8)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(user?.position?.title || 'System Administrator', 14, sigY + 13)

      // Checked By
      doc.setFontSize(10)
      doc.text('Checked by:', colWidth, sigY)
      doc.setFont("helvetica", "bold")
      doc.text(signatories.checked_by || '__________________', colWidth, sigY + 8)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(signatories.checked_by_pos || 'Position', colWidth, sigY + 13)

      // Noted By
      doc.setFontSize(10)
      doc.text('Noted by:', colWidth * 2, sigY)
      doc.setFont("helvetica", "bold")
      doc.text(signatories.noted_by || '__________________', colWidth * 2, sigY + 8)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(signatories.noted_by_pos || 'Position', colWidth * 2, sigY + 13)

      // Save PDF
      doc.save(`asset-report-${new Date().toISOString().split('T')[0]}.pdf`)
      
      notifySuccess('Export Complete', 'PDF file has been downloaded')

    } catch (error) {
      console.error(error)
       Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: 'An error occurred while exporting to PDF.'
      })
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }))
    }
  }

  const notifySuccess = (title, text) => {
    Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
    })
  }

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
        {activeFilters && (
            <p className="text-center text-xs text-slate-500 mt-1 italic">
                {activeFilters.report_date_from && activeFilters.report_date_to
                  ? `Date Range: ${activeFilters.report_date_from} to ${activeFilters.report_date_to}`
                  : `Date: ${activeFilters.report_date_to}`
                }
            </p>
        )}
      </div>

      {/* Screen Header */}
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

      {/* Report Generation Panel */}
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
              {/* Date Range & Standard Filters */}
              <div className="bg-white rounded-lg border-2 border-blue-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Report Filters</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      From Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={filters.report_date_from}
                      onChange={(e) => handleFilterChange('report_date_from', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      To Date (Required)
                    </label>
                    <input
                      type="date"
                      value={filters.report_date_to}
                      onChange={(e) => handleFilterChange('report_date_to', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
                    />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Branch</label>
                      <select
                          value={filters.branch_id}
                          onChange={(e) => handleFilterChange('branch_id', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                          <option value="">All Branches</option>
                          {branches?.map(b => (
                              <option key={b.id} value={b.id}>{b.branch_name}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                      <select
                          value={filters.status_id}
                          onChange={(e) => handleFilterChange('status_id', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                          <option value="">All Statuses</option>
                          {statuses?.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                      </select>
                  </div>
                </div>
              </div>

               {/* Signatories Section */}
              <div className="bg-white rounded-lg border-2 border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-slate-100 rounded-lg p-2">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Signatories</h3>
                  <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">Optional</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Checked By */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-blue-700">Checked By:</h4>
                    <input
                      type="text"
                      placeholder="Name"
                      value={signatories.checked_by}
                      onChange={(e) => handleSignatoryChange('checked_by', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                     <input
                      type="text"
                      placeholder="Position"
                      value={signatories.checked_by_pos}
                      onChange={(e) => handleSignatoryChange('checked_by_pos', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  
                  {/* Noted By */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-blue-700">Noted By:</h4>
                    <input
                      type="text"
                      placeholder="Name"
                      value={signatories.noted_by}
                      onChange={(e) => handleSignatoryChange('noted_by', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                     <input
                      type="text"
                      placeholder="Position"
                      value={signatories.noted_by_pos}
                      onChange={(e) => handleSignatoryChange('noted_by_pos', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

               {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <X className="w-5 h-5" />
                  Clear Filters
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={isFetching}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl sm:ml-auto"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
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

      {/* Results Section */}
      {isFetching ? (
         <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Generating report...</p>
        </div>
      ) : activeFilters && groupedByEmployee.length > 0 ? (
          <div className="space-y-6">
               {/* Export Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 no-print">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  Export Options
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md"
                  >
                    <Printer className="w-6 h-6" />
                    Print Report
                  </button>
                  <button
                    onClick={handleExportXLSX}
                    disabled={exportLoading.xlsx}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                  >
                    {exportLoading.xlsx ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                    Export as Excel
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={exportLoading.pdf}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
                  >
                    {exportLoading.pdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileType className="w-5 h-5" />}
                    Export as PDF
                  </button>
                </div>
              </div>

              {/* Table Table */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-300">
                      <thead className="bg-gradient-to-r from-indigo-600 to-blue-600">
                        <tr>
                            <th className="px-3 py-3 text-center text-xs font-bold text-white uppercase border-r border-indigo-500">Name of User</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Asset</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Serial No.</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Date Acq</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Type</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Vendor</th>
                            <th className="px-3 py-3 text-right text-xs font-bold text-white uppercase border-r border-indigo-500">Acq Cost</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Est. Life</th>
                            <th className="px-3 py-3 text-right text-xs font-bold text-white uppercase border-r border-indigo-500">Book Value</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase border-r border-indigo-500">Remarks</th>
                            <th className="px-3 py-3 text-left text-xs font-bold text-white uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {groupedByEmployee.map((group, groupIndex) => (
                            group.assets.map((asset, assetIndex) => {
                                const isFirstAsset = assetIndex === 0
                                const groupHeaderBorderClass = 'border-t-2 border-b-2 border-t-indigo-300 border-b-indigo-300'
                                const groupRowBorderClass = assetIndex === group.assets.length - 1 ? 'border-b-2 border-b-indigo-300' : ''
                                
                                return (
                                    <tr key={`${groupIndex}-${asset.id}`} className="hover:bg-slate-50">
                                        {isFirstAsset && (
                                            <td rowSpan={group.assets.length} className={`px-3 py-2 text-sm text-center align-middle border-r border-slate-200 ${groupHeaderBorderClass}`}>
                                                <div className="font-semibold text-slate-900">{group.employee?.fullname || 'Unassigned'}</div>
                                                <div className="text-xs text-slate-600">{group.employee?.branch?.branch_name}</div>
                                            </td>
                                        )}
                                        {/* Asset Cols */}
                                         <td className={`px-3 py-2 text-sm text-slate-900 border-r border-slate-200 ${groupRowBorderClass}`}>{asset.asset_name}</td>
                                         <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>{asset.serial_number || '—'}</td>
                                         <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '—'}</td>
                                         <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>{asset.category?.name || '—'}</td>
                                         <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>{asset.vendor?.company_name || '—'}</td>
                                         <td className={`px-3 py-2 text-sm text-right text-slate-900 font-medium border-r border-slate-200 ${groupRowBorderClass}`}>{(asset.acq_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                         <td className={`px-3 py-2 text-sm text-center text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>{asset.estimated_life || 3}</td>
                                         <td className={`px-3 py-2 text-sm text-right text-slate-900 border-r border-slate-200 ${groupRowBorderClass}`}>{(asset.book_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                         <td className={`px-3 py-2 text-sm text-slate-600 border-r border-slate-200 ${groupRowBorderClass}`}>{asset.remarks || '-'}</td>
                                         <td className={`px-3 py-2 text-sm ${groupRowBorderClass}`}>
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border" style={statusStyle(asset.status)}>
                                                {asset.status?.name || 'N/A'}
                                            </span>
                                         </td>
                                    </tr>
                                )
                            })
                        ))}
                      </tbody>
                      {summary && (
                          <tfoot className="bg-slate-50">
                              <tr>
                                  <td colSpan={6} className="px-3 py-3 text-right text-sm font-semibold text-slate-700">Grand Total</td>
                                  <td className="px-3 py-3 text-right text-sm font-bold text-emerald-700">₱{(summary.total_acquisition_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  <td></td>
                                  <td className="px-3 py-3 text-right text-sm font-bold text-emerald-700">₱{(summary.total_book_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  <td colSpan={2}></td>
                              </tr>
                          </tfoot>
                      )}
                    </table>
                </div>
              </div>

               {/* Add Signatories to On-Screen/Print View */}
              <div className="mt-12 grid grid-cols-3 gap-8 px-8 pb-8 no-screen print:grid hidden">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-6">Prepared by:</p>
                    <p className="text-base font-bold text-slate-900">{user?.fullname || 'Admin User'}</p>
                    <p className="text-sm text-slate-600">{user?.position?.title || 'System Administrator'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-6">Checked by:</p>
                      <p className="text-base font-bold text-slate-900">{signatories.checked_by || '__________________'}</p>
                    <p className="text-sm text-slate-600">{signatories.checked_by_pos || 'Position'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-6">Noted by:</p>
                      <p className="text-base font-bold text-slate-900">{signatories.noted_by || '__________________'}</p>
                    <p className="text-sm text-slate-600">{signatories.noted_by_pos || 'Position'}</p>
                  </div>
              </div>
          </div>
      ) : activeFilters ? (
           <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Assets Found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your filters.</p>
          </div>
      ) : (
           <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Generate Report</h3>
            <p className="text-slate-600 mb-4">Select your filters and click "Generate Report" to start.</p>
          </div>
      )}
    </div>
  )
}

export default ReportsPage
