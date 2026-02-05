import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Printer, FileSpreadsheet, Building2 } from 'lucide-react'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx-js-style'

function SoftwareLicenseReportPage() {
  const [filters, setFilters] = useState({
    branch_id: '',
  })
  const [reportData, setReportData] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch branches for filter
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await apiClient.get('/branches')
      return response.data.success ? response.data.data : []
    },
  })

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      const params = new URLSearchParams()
      if (filters.branch_id) params.append('branch_id', filters.branch_id)

      const response = await apiClient.get(`/software-licenses?${params.toString()}`)

      if (response.data.success) {
        setReportData(response.data.data)
        if (response.data.data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'No Data',
            text: 'No software licenses found for the selected filters.',
          })
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to generate report',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = () => {
    if (!reportData || reportData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'Please generate a report first',
      })
      return
    }

    try {
      const selectedBranch = filters.branch_id
        ? branches?.find(b => String(b.id) === String(filters.branch_id))
        : null

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Prepare data for Excel
      const excelData = []

      // Header rows
      excelData.push(['RBT Bank Inc.'])
      excelData.push(['MIS Department'])
      excelData.push(['Software License Report'])
      excelData.push([selectedBranch ? selectedBranch.branch_name : 'All Branches'])
      excelData.push([`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`])
      excelData.push([]) // Empty row

      // Table headers
      excelData.push([
        'Employee',
        'Position',
        'Section',
        'Category',
        'Operating System',
        'Office Tools',
        'Licensed',
        'Client Access',
        'Remarks',
      ])

      // Table data
      reportData.forEach((license) => {
        excelData.push([
          license.employee?.fullname || 'Unassigned',
          license.position?.title || '—',
          license.section?.name || '—',
          license.asset_category?.name || license.assetCategory?.name || '—',
          license.operating_system || '—',
          license.office_tool
            ? `${license.office_tool.name}${license.office_tool.version ? ' ' + license.office_tool.version : ''}`
            : license.officeTool
            ? `${license.officeTool.name}${license.officeTool.version ? ' ' + license.officeTool.version : ''}`
            : '—',
          license.licensed || '—',
          license.client_access || '—',
          license.remarks || '—',
        ])
      })

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData)

      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Employee
        { wch: 20 }, // Position
        { wch: 20 }, // Section
        { wch: 15 }, // Category
        { wch: 20 }, // OS
        { wch: 25 }, // Office Tools
        { wch: 10 }, // Licensed
        { wch: 12 }, // Client Access
        { wch: 30 }, // Remarks
      ]

      // Style header rows
      const headerStyle = {
        font: { bold: true, sz: 14, color: { rgb: '1E293B' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      }

      const subHeaderStyle = {
        font: { sz: 12, color: { rgb: '475569' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      }

      const titleStyle = {
        font: { bold: true, sz: 16, color: { rgb: '0F172A' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      }

      // Apply styles to header rows
      ws['A1'] = { ...ws['A1'], s: headerStyle }
      ws['A2'] = { ...ws['A2'], s: subHeaderStyle }
      ws['A3'] = { ...ws['A3'], s: titleStyle }
      ws['A4'] = { ...ws['A4'], s: subHeaderStyle }
      ws['A5'] = { ...ws['A5'], s: { ...subHeaderStyle, font: { sz: 10, italic: true, color: { rgb: '64748B' } } } }

      // Merge header cells
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // RBT Bank Inc.
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // MIS Department
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }, // Title
        { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } }, // Branch
        { s: { r: 4, c: 0 }, e: { r: 4, c: 8 } }, // Date
      ]

      // Style table header row
      const tableHeaderStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
        fill: { fgColor: { rgb: '3F51B5' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } },
        },
      }

      const headerRow = 6 // 0-indexed
      for (let col = 0; col < 9; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col })
        if (!ws[cellRef]) ws[cellRef] = { v: '' }
        ws[cellRef].s = tableHeaderStyle
      }

      // Style data rows
      const dataStyle = {
        font: { sz: 9 },
        alignment: { vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
          left: { style: 'thin', color: { rgb: 'E2E8F0' } },
          right: { style: 'thin', color: { rgb: 'E2E8F0' } },
        },
      }

      for (let row = 7; row < excelData.length; row++) {
        for (let col = 0; col < 9; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
          if (!ws[cellRef]) ws[cellRef] = { v: '' }
          ws[cellRef].s = dataStyle
        }
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Software Licenses')

      // Generate file
      const fileName = `software-license-report-${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, fileName)

      Swal.fire({
        icon: 'success',
        title: 'Export Complete',
        text: 'Excel file has been downloaded',
        timer: 2000,
      })
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'An error occurred while exporting to Excel.',
      })
    }
  }

  const selectedBranch = filters.branch_id
    ? branches?.find(b => String(b.id) === String(filters.branch_id))
    : null

  return (
    <div className="space-y-6">
      {/* Header - Hide on print */}
      <div className="no-print">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">Software License Report</h2>
          </div>
          <p className="text-indigo-100 text-sm">
            Generate and export software license reports
          </p>
        </div>
      </div>

      {/* Filters - Hide on print */}
      <div className="no-print bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
            <select
              value={filters.branch_id}
              onChange={(e) => setFilters({ ...filters, branch_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Branches</option>
              {branches?.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>

          {reportData && reportData.length > 0 && (
            <>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>

              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export to Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Print Header */}
          <div className="hidden print:block px-6 py-4 border-b border-slate-200">
            <p className="text-center text-sm font-bold text-slate-900 leading-tight">
              RBT Bank Inc.
            </p>
            <p className="text-center text-sm text-slate-700 leading-tight">
              MIS Department
            </p>
            <h1 className="text-xl font-bold text-slate-900 text-center leading-tight mt-0.5">
              Software License Report
            </h1>
            <p className="text-center text-sm text-slate-700 leading-tight">
              {selectedBranch ? selectedBranch.branch_name : 'All Branches'}
            </p>
            <p className="text-center text-xs text-slate-500 italic leading-tight">
              Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-indigo-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Operating System
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Office Tools
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Licensed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Client Access
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  reportData.map((license, index) => (
                    <tr key={license.id || index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {license.employee?.fullname || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {license.position?.title || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {license.section?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {license.asset_category?.name || license.assetCategory?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {license.operating_system || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {license.office_tool
                          ? `${license.office_tool.name}${license.office_tool.version ? ' ' + license.office_tool.version : ''}`
                          : license.officeTool
                          ? `${license.officeTool.name}${license.officeTool.version ? ' ' + license.officeTool.version : ''}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            license.licensed === 'YES'
                              ? 'bg-green-100 text-green-800'
                              : license.licensed === 'NO'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {license.licensed || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {license.client_access || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {license.remarks || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {reportData.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-700">
                Total Records: <span className="font-bold text-slate-900">{reportData.length}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  )
}

export default SoftwareLicenseReportPage
