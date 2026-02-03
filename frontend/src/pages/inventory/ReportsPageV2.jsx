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
  Users
} from 'lucide-react'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx-js-style' 
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { normalizeArrayResponse } from '../../utils/assetFormatters'
import SignatoriesModal from '../../components/SignatoriesModal'

// Helper for status styles
const statusStyle = (status) => {
  if (!status?.color) return {
    backgroundColor: '#f3f4f6', // slate-100
    color: '#374151', // slate-700
    borderColor: '#e5e7eb', // slate-200
  }

  // Simple hex to rgba conversion for robustness
  const hex = status.color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(url => hex.length === 6 ? hex.substring(4, 6) : '00', 16) || 0
  
  // If parsing fails, fall back to the color itself or gray
  if (isNaN(r) || isNaN(g)) {
     return {
        backgroundColor: `${status.color}20`, // Fallback to simple concatenation
        color: status.color,
        borderColor: `${status.color}40`,
     }
  }

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`, // ~12% opacity
    color: status.color,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`, // ~30% opacity
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

  // Signatories Modal State
  const [showSignatoriesModal, setShowSignatoriesModal] = useState(false)
  const [savingSignatories, setSavingSignatories] = useState(false)

  // Fetch signatories from backend
  const { data: signatoriesData, refetch: refetchSignatories } = useQuery({
    queryKey: ['report-signatories'],
    queryFn: async () => {
      const response = await apiClient.get('/report-signatories')
      return response.data?.data
    },
  })

  const signatories = {
    checked_by_id: signatoriesData?.checked_by_id || null,
    noted_by_id: signatoriesData?.noted_by_id || null,
  }

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

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await apiClient.get('/employees')
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



  // We use a state to hold the resolved user so we can pass it to children
  // and use it in callbacks without complex dependency chains.
  const [resolvedUser, setResolvedUser] = useState(user)

  useEffect(() => {
    if (user && employees) {
      // Try to find matching employee by name (case insensitive)
      // We check both name (from auth) and fullname (if available)
      const searchTerm = (user.name || user.fullname || '').toLowerCase()
      
      const matched = employees.find(e => 
        (e.fullname || '').toLowerCase() === searchTerm
      )

      if (matched) {
        setResolvedUser({
          ...user,
          fullname: matched.fullname,
          position: matched.position || { title: 'Position not set' },
          branch: matched.branch
        })
      } else {
        // Fallback with what we have
        setResolvedUser({
          ...user,
          fullname: user.name || user.fullname || 'Admin User',
          position: user.position || { title: 'System Administrator' }
        })
      }
    }
  }, [user, employees])
  const handleSignatorySave = async (newSignatories) => {
    setSavingSignatories(true)
    try {
      await apiClient.post('/report-signatories', newSignatories)
      await refetchSignatories()
      setShowSignatoriesModal(false)
      Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'Signatories have been saved successfully',
        timer: 2000,
      })
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save signatories. Please try again.',
      })
    } finally {
      setSavingSignatories(false)
    }
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
    if (!filters.report_date_from || !filters.report_date_to) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields',
        text: 'Please select both From Date and To Date.',
      })
      return
    }
    setActiveFilters(filters)
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
      const COL_COUNT = 11 // Matches on-screen table columns
      const ws = {}
      const merges = []
      let row = 0

      // Helper to set a cell with style
      const setCell = (r, c, value, style = {}) => {
        const cellRef = XLSX.utils.encode_cell({ r, c })
        const cell = { v: value, s: style }
        if (typeof value === 'number') {
          cell.t = 'n'
        } else {
          cell.t = 's'
        }
        ws[cellRef] = cell
      }

      // Common styles
      const headerFill = { fgColor: { rgb: '3F51B5' } } // indigo-600
      const headerFont = { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 }
      const headerBorder = {
        top: { style: 'thin', color: { rgb: '3949AB' } },
        bottom: { style: 'thin', color: { rgb: '3949AB' } },
        left: { style: 'thin', color: { rgb: '3949AB' } },
        right: { style: 'thin', color: { rgb: '3949AB' } },
      }
      const cellBorder = {
        top: { style: 'thin', color: { rgb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
        left: { style: 'thin', color: { rgb: 'CBD5E1' } },
        right: { style: 'thin', color: { rgb: 'CBD5E1' } },
      }
      const groupBorder = {
        top: { style: 'medium', color: { rgb: '818CF8' } },
        bottom: { style: 'medium', color: { rgb: '818CF8' } },
        left: { style: 'thin', color: { rgb: 'CBD5E1' } },
        right: { style: 'thin', color: { rgb: 'CBD5E1' } },
      }
      const currencyFmt = '#,##0.00'

      // ── Title Section ──
      // Helper: set a merged header row with value in first cell and style on all cells
      const setMergedRow = (r, value, style) => {
        for (let c = 0; c < COL_COUNT; c++) {
          setCell(r, c, c === 0 ? value : '', style)
        }
        merges.push({ s: { r, c: 0 }, e: { r, c: COL_COUNT - 1 } })
      }

      const centerAlign = { horizontal: 'center', vertical: 'center' }

      // Line 1: RBT Bank Inc.
      setMergedRow(row, 'RBT Bank Inc.', {
        font: { bold: true, sz: 10, color: { rgb: '1E293B' } },
        alignment: centerAlign,
      })
      row++

      // Line 2: MIS Department
      setMergedRow(row, 'MIS Department', {
        font: { sz: 10, bold: true, color: { rgb: '1E293B' } },
        alignment: centerAlign,
      })
      row++

      // Line 3: List of Active IT Assets (title - large & bold)
      setMergedRow(row, 'List of Active IT Assets', {
        font: { bold: true, sz: 16, color: { rgb: '0F172A' } },
        alignment: centerAlign,
      })
      row++

      // Line 4: Branch name (from selected filter)
      const selectedBranch = activeFilters?.branch_id
        ? branches?.find(b => String(b.id) === String(activeFilters.branch_id))
        : null
      setMergedRow(row, selectedBranch ? selectedBranch.branch_name : 'All Branches', {
        font: { sz: 10, color: { rgb: '1E293B' } },
        alignment: centerAlign,
      })
      row++

      // Line 5: Date range from filters
      const fromDate = activeFilters?.report_date_from
        ? new Date(activeFilters.report_date_from).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null
      const toDate = activeFilters?.report_date_to
        ? new Date(activeFilters.report_date_to).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const dateLabel = fromDate
        ? `${fromDate} - ${toDate}`
        : `As of ${toDate}`
      setMergedRow(row, dateLabel, {
        font: { sz: 10, bold: true, color: { rgb: '1E293B' } },
        alignment: centerAlign,
      })
      row++

      // Empty row
      row++

      // ── Header Row (matches on-screen table) ──
      const headers = [
        'Name of User', 'Asset', 'Serial No.', 'Date Acq', 'Type',
        'Vendor', 'Acq Cost', 'Est. Life', 'Book Value', 'Remarks', 'Status'
      ]
      const headerAligns = [
        'center', 'left', 'left', 'left', 'left',
        'left', 'right', 'center', 'right', 'left', 'left'
      ]

      headers.forEach((h, c) => {
        setCell(row, c, h, {
          fill: headerFill,
          font: headerFont,
          border: headerBorder,
          alignment: { horizontal: headerAligns[c], vertical: 'center', wrapText: true },
        })
      })
      row++

      // ── Data Rows (grouped by employee, matching on-screen structure) ──
      groupedByEmployee.forEach(group => {
        const employeeName = group.employee?.fullname || 'Unassigned'
        const positionTitle = group.employee?.position?.title || ''
        const assetCount = group.assets.length
        const groupStartRow = row

        group.assets.forEach((asset, assetIndex) => {
          const isFirst = assetIndex === 0
          const isLast = assetIndex === assetCount - 1

          // Determine border style for group visual separation
          const rowBorder = {
            top: isFirst ? { style: 'medium', color: { rgb: '818CF8' } } : { style: 'thin', color: { rgb: 'CBD5E1' } },
            bottom: isLast ? { style: 'medium', color: { rgb: '818CF8' } } : { style: 'thin', color: { rgb: 'CBD5E1' } },
            left: { style: 'thin', color: { rgb: 'CBD5E1' } },
            right: { style: 'thin', color: { rgb: 'CBD5E1' } },
          }

          // Column 0: Employee name (only set on first row, will be merged)
          if (isFirst) {
            setCell(row, 0, employeeName + (positionTitle ? '\n' + positionTitle : ''), {
              font: { bold: true, sz: 10, color: { rgb: '0F172A' } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: groupBorder,
            })
          }

          // Column 1: Asset
          setCell(row, 1, asset.asset_name || '', {
            font: { sz: 10, color: { rgb: '0F172A' } },
            border: rowBorder,
            alignment: { vertical: 'center' },
          })

          // Column 2: Serial No.
          setCell(row, 2, asset.serial_number || '—', {
            font: { sz: 10, color: { rgb: '475569' } },
            border: rowBorder,
            alignment: { vertical: 'center' },
          })

          // Column 3: Date Acq
          setCell(row, 3, asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '—', {
            font: { sz: 10, color: { rgb: '475569' } },
            border: rowBorder,
            alignment: { vertical: 'center' },
          })

          // Column 4: Type
          setCell(row, 4, asset.category?.name || '—', {
            font: { sz: 10, color: { rgb: '475569' } },
            border: rowBorder,
            alignment: { vertical: 'center' },
          })

          // Column 5: Vendor
          setCell(row, 5, asset.vendor?.company_name || '—', {
            font: { sz: 10, color: { rgb: '475569' } },
            border: rowBorder,
            alignment: { vertical: 'center' },
          })

          // Column 6: Acq Cost (number, right-aligned)
          setCell(row, 6, Number(asset.acq_cost || 0), {
            font: { sz: 10, color: { rgb: '0F172A' }, bold: true },
            border: rowBorder,
            alignment: { horizontal: 'right', vertical: 'center' },
            numFmt: currencyFmt,
          })

          // Column 7: Est. Life
          setCell(row, 7, asset.estimated_life || 3, {
            font: { sz: 10, color: { rgb: '475569' } },
            border: rowBorder,
            alignment: { horizontal: 'center', vertical: 'center' },
          })

          // Column 8: Book Value (number, right-aligned)
          setCell(row, 8, Number(asset.book_value || 0), {
            font: { sz: 10, color: { rgb: '0F172A' } },
            border: rowBorder,
            alignment: { horizontal: 'right', vertical: 'center' },
            numFmt: currencyFmt,
          })

          // Column 9: Remarks
          setCell(row, 9, asset.remarks || '-', {
            font: { sz: 10, color: { rgb: '475569' } },
            border: rowBorder,
            alignment: { vertical: 'center', wrapText: true },
          })

          // Column 10: Status
          setCell(row, 10, asset.status?.name || 'N/A', {
            font: { sz: 10, color: { rgb: '475569' } },
            border: rowBorder,
            alignment: { vertical: 'center' },
          })

          row++
        })

        // Merge the employee name column for this group
        if (assetCount > 1) {
          merges.push({ s: { r: groupStartRow, c: 0 }, e: { r: groupStartRow + assetCount - 1, c: 0 } })
        }
      })

      // ── Grand Total Row (matches on-screen tfoot) ──
      if (summary) {
        const totalStyle = {
          font: { bold: true, sz: 13, color: { rgb: '0F172A' } },
          fill: { fgColor: { rgb: 'F1F5F9' } },
          border: {
            top: { style: 'medium', color: { rgb: '64748B' } },
            bottom: { style: 'medium', color: { rgb: '64748B' } },
            left: { style: 'thin', color: { rgb: 'CBD5E1' } },
            right: { style: 'thin', color: { rgb: 'CBD5E1' } },
          },
          alignment: { horizontal: 'right', vertical: 'center' },
        }
        const totalValueStyle = {
          ...totalStyle,
          font: { bold: true, sz: 14, color: { rgb: '047857' } },
          numFmt: '₱#,##0.00',
        }

        // "Grand Total" label spanning cols 0-5
        setCell(row, 0, 'Grand Total', totalStyle)
        for (let c = 1; c <= 5; c++) {
          setCell(row, c, '', totalStyle)
        }
        merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 5 } })

        // Acq Cost total
        setCell(row, 6, Number(summary.total_acquisition_cost || 0), totalValueStyle)

        // Empty Est. Life column
        setCell(row, 7, '', totalStyle)

        // Empty remaining columns
        setCell(row, 8, '', totalStyle)
        setCell(row, 9, '', totalStyle)
        setCell(row, 10, '', totalStyle)

        row++
      }

      // ── Signatories Section ──
      row += 2 // spacing

      const checkedByEmployee = employees?.find(e => e.id === signatories.checked_by_id)
      const notedByEmployee = employees?.find(e => e.id === signatories.noted_by_id)

      const sigLabelStyle = {
        font: { sz: 10, color: { rgb: '475569' } },
        alignment: { vertical: 'center' },
      }
      const sigNameStyle = {
        font: { bold: true, sz: 11, color: { rgb: '0F172A' } },
        alignment: { vertical: 'center' },
        border: { bottom: { style: 'thin', color: { rgb: '334155' } } },
      }
      const sigPosStyle = {
        font: { sz: 9, color: { rgb: '475569' } },
        alignment: { vertical: 'center' },
      }

      // Labels row: cols 0-1 = Prepared by, cols 4-5 = Checked by, cols 8-9 = Noted by
      setCell(row, 0, 'Prepared by:', sigLabelStyle)
      merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 1 } })
      setCell(row, 4, 'Checked by:', sigLabelStyle)
      merges.push({ s: { r: row, c: 4 }, e: { r: row, c: 5 } })
      setCell(row, 8, 'Noted by:', sigLabelStyle)
      merges.push({ s: { r: row, c: 8 }, e: { r: row, c: 9 } })
      row++
      row++ // spacing for signature line

      // Names row
      setCell(row, 0, resolvedUser?.fullname || 'Admin User', sigNameStyle)
      merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 2 } })
      setCell(row, 4, checkedByEmployee?.fullname || '__________________', sigNameStyle)
      merges.push({ s: { r: row, c: 4 }, e: { r: row, c: 6 } })
      setCell(row, 8, notedByEmployee?.fullname || '__________________', sigNameStyle)
      merges.push({ s: { r: row, c: 8 }, e: { r: row, c: 10 } })
      row++

      // Positions row
      setCell(row, 0, resolvedUser?.position?.title || 'System Administrator', sigPosStyle)
      merges.push({ s: { r: row, c: 0 }, e: { r: row, c: 2 } })
      setCell(row, 4, checkedByEmployee?.position?.title || 'Position', sigPosStyle)
      merges.push({ s: { r: row, c: 4 }, e: { r: row, c: 6 } })
      setCell(row, 8, notedByEmployee?.position?.title || 'Position', sigPosStyle)
      merges.push({ s: { r: row, c: 8 }, e: { r: row, c: 10 } })
      row++

      // ── Finalize worksheet ──
      ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row - 1, c: COL_COUNT - 1 } })
      ws['!merges'] = merges

      // Column widths matching on-screen proportions
      ws['!cols'] = [
        { wch: 22 }, // Name of User
        { wch: 20 }, // Asset
        { wch: 16 }, // Serial No.
        { wch: 12 }, // Date Acq
        { wch: 14 }, // Type
        { wch: 16 }, // Vendor
        { wch: 15 }, // Acq Cost
        { wch: 10 }, // Est. Life
        { wch: 15 }, // Book Value
        { wch: 18 }, // Remarks
        { wch: 12 }, // Status
      ]

      // Row heights
      const rowHeights = []
      rowHeights[0] = { hpt: 20 } // RBT Bank Inc.
      rowHeights[1] = { hpt: 18 } // MIS Department
      rowHeights[2] = { hpt: 28 } // List of Active IT Assets (large title)
      rowHeights[3] = { hpt: 18 } // Branch
      rowHeights[4] = { hpt: 18 } // Date range
      ws['!rows'] = rowHeights

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, ws, 'Asset Report')
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
      const pageWidth = doc.internal.pageSize.width

      // ── Header Section (matches Excel) ──
      // Line 1: RBT Bank Inc.
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      doc.text('RBT Bank Inc.', pageWidth / 2, 14, { align: 'center' })

      // Line 2: MIS Department
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 65, 85)
      doc.text('MIS Department', pageWidth / 2, 20, { align: 'center' })

      // Line 3: List of Active IT Assets (large bold title)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text('List of Active IT Assets', pageWidth / 2, 28, { align: 'center' })

      // Line 4: Branch name
      const pdfSelectedBranch = activeFilters?.branch_id
        ? branches?.find(b => String(b.id) === String(activeFilters.branch_id))
        : null
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 65, 85)
      doc.text(pdfSelectedBranch ? pdfSelectedBranch.branch_name : 'All Branches', pageWidth / 2, 34, { align: 'center' })

      // Line 5: Date range
      const pdfFromDate = activeFilters?.report_date_from
        ? new Date(activeFilters.report_date_from).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null
      const pdfToDate = activeFilters?.report_date_to
        ? new Date(activeFilters.report_date_to).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const pdfDateLabel = pdfFromDate
        ? `${pdfFromDate} - ${pdfToDate}`
        : `As of ${pdfToDate}`
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(100, 116, 139)
      doc.text(pdfDateLabel, pageWidth / 2, 40, { align: 'center' })

      // ── Table (matches on-screen: 11 columns, grouped by employee) ──
      const tableRows = []

      groupedByEmployee.forEach(group => {
         // Group Header row
         tableRows.push([{
             content: `${group.employee?.fullname || 'Unassigned'} - ${group.employee?.position?.title || 'No Position'}`,
             colSpan: 11,
             styles: { fillColor: [241, 245, 249], fontStyle: 'bold' }
         }])

         group.assets.forEach(asset => {
             tableRows.push([
                 asset.asset_name,
                 asset.serial_number || '—',
                 asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '—',
                 asset.category?.name || '—',
                 asset.vendor?.company_name || '—',
                 (asset.acq_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                 asset.estimated_life || 3,
                 (asset.book_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                 asset.remarks || '-',
                 asset.status?.name || 'N/A',
             ])
         })
      })

      // Grand Total Row (only Acq Cost)
      if (summary) {
          tableRows.push([
              { content: 'Grand Total', colSpan: 6, styles: { fontStyle: 'bold', halign: 'right', fontSize: 10, fillColor: [241, 245, 249], textColor: [15, 23, 42] } },
              { content: '₱' + (summary.total_acquisition_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold', fontSize: 11, fillColor: [241, 245, 249], textColor: [4, 120, 87] } },
              { content: '', styles: { fillColor: [241, 245, 249] } },
              { content: '', styles: { fillColor: [241, 245, 249] } },
              { content: '', styles: { fillColor: [241, 245, 249] } },
          ])
      }

      autoTable(doc, {
        head: [['Name of User', 'Asset', 'Serial No.', 'Date Acq', 'Type', 'Vendor', 'Acq Cost', 'Est. Life', 'Book Value', 'Remarks', 'Status']],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 28 },
          6: { halign: 'right' },
          7: { halign: 'center' },
          8: { halign: 'right' },
        },
      })

      // ---- Signatories Section ----
      const pageHeight = doc.internal.pageSize.height
      const colWidth = pageWidth / 3
      let sigY = doc.lastAutoTable.finalY + 25

      // Check if enough space for signatories, else add new page
      if (sigY + 45 > pageHeight) {
          doc.addPage()
          sigY = 25
      }

      doc.setTextColor(0, 0, 0)

      // Get employee details from IDs
      const checkedByEmployee = employees?.find(e => e.id === signatories.checked_by_id)
      const notedByEmployee = employees?.find(e => e.id === signatories.noted_by_id)

      // Prepared By
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text('Prepared by:', 14, sigY)

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(resolvedUser?.fullname || 'Admin User', 14, sigY + 12)
      // Underline
      const prepName = resolvedUser?.fullname || 'Admin User'
      const prepWidth = doc.getTextWidth(prepName)
      doc.setDrawColor(51, 65, 85)
      doc.line(14, sigY + 13, 14 + prepWidth, sigY + 13)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text(resolvedUser?.position?.title || 'System Administrator', 14, sigY + 18)

      // Checked By
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text('Checked by:', colWidth, sigY)

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      const checkedName = checkedByEmployee?.fullname || '__________________'
      doc.text(checkedName, colWidth, sigY + 12)
      const checkedWidth = doc.getTextWidth(checkedName)
      doc.setDrawColor(51, 65, 85)
      doc.line(colWidth, sigY + 13, colWidth + checkedWidth, sigY + 13)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text(checkedByEmployee?.position?.title || 'Position', colWidth, sigY + 18)

      // Noted By
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text('Noted by:', colWidth * 2, sigY)

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      const notedName = notedByEmployee?.fullname || '__________________'
      doc.text(notedName, colWidth * 2, sigY + 12)
      const notedWidth = doc.getTextWidth(notedName)
      doc.setDrawColor(51, 65, 85)
      doc.line(colWidth * 2, sigY + 13, colWidth * 2 + notedWidth, sigY + 13)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text(notedByEmployee?.position?.title || 'Position', colWidth * 2, sigY + 18)

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
      <div className="hidden print:block mb-1">
        <p className="text-center text-sm font-bold text-slate-900 leading-tight">
          RBT Bank Inc.
        </p>
        <p className="text-center text-sm text-slate-700 leading-tight">
          MIS Department
        </p>
        <h1 className="text-xl font-bold text-slate-900 text-center leading-tight mt-0.5">
          List of Active IT Assets
        </h1>
        <p className="text-center text-sm text-slate-700 leading-tight">
          {activeFilters?.branch_id
            ? branches?.find(b => String(b.id) === String(activeFilters.branch_id))?.branch_name || 'All Branches'
            : 'All Branches'
          }
        </p>
        {activeFilters && (
            <p className="text-center text-xs text-slate-500 italic leading-tight">
                {activeFilters.report_date_from && activeFilters.report_date_to
                  ? `${new Date(activeFilters.report_date_from).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date(activeFilters.report_date_to).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                  : `As of ${new Date(activeFilters.report_date_to).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
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
            onClick={() => setShowSignatoriesModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Users className="w-5 h-5 text-purple-600" />
            <span>Signatories</span>
          </button>
          
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
                      From Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={filters.report_date_from}
                      onChange={(e) => handleFilterChange('report_date_from', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      To Date <span className="text-red-500">*</span>
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
                    onClick={() => setShowSignatoriesModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all shadow-md"
                  >
                    <Users className="w-6 h-6" />
                    Manage Signatories
                  </button>
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
                                                <div className="text-xs text-slate-600">{group.employee?.position?.title || ''}</div>
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
                                  <td colSpan={6} className="px-4 py-4 text-right text-base font-bold text-slate-900">Grand Total</td>
                                  <td className="px-4 py-4 text-right text-base font-extrabold text-emerald-700">₱{(summary.total_acquisition_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  <td colSpan={4} className="bg-slate-50"></td>
                              </tr>
                          </tfoot>
                      )}
                    </table>
                </div>
              </div>

               {/* Add Signatories to On-Screen/Print View */}
              <div className="mt-12 print:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-8 print:gap-4 px-8 pb-8 print:px-4 print:pb-2 print:grid">
                  {(() => {
                    const checkedByEmployee = employees?.find(e => e.id === signatories.checked_by_id)
                    const notedByEmployee = employees?.find(e => e.id === signatories.noted_by_id)
                    return (
                      <>
                        <div>
                          <p className="text-sm print:text-xs font-medium text-slate-600 mb-6 print:mb-3">Prepared by:</p>
                          <p className="text-base print:text-sm font-bold text-slate-900 border-b border-slate-800 inline-block">{resolvedUser?.fullname || 'Admin User'}</p>
                          <p className="text-sm print:text-xs text-slate-600">{resolvedUser?.position?.title || 'System Administrator'}</p>
                        </div>
                        <div>
                          <p className="text-sm print:text-xs font-medium text-slate-600 mb-6 print:mb-3">Checked by:</p>
                          <p className="text-base print:text-sm font-bold text-slate-900 border-b border-slate-800 inline-block">{checkedByEmployee?.fullname || '__________________'}</p>
                          <p className="text-sm print:text-xs text-slate-600">{checkedByEmployee?.position?.title || 'Position'}</p>
                        </div>
                        <div>
                          <p className="text-sm print:text-xs font-medium text-slate-600 mb-6 print:mb-3">Noted by:</p>
                          <p className="text-base print:text-sm font-bold text-slate-900 border-b border-slate-800 inline-block">{notedByEmployee?.fullname || '__________________'}</p>
                          <p className="text-sm print:text-xs text-slate-600">{notedByEmployee?.position?.title || 'Position'}</p>
                        </div>
                      </>
                    )
                  })()}
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

      {/* Signatories Modal */}
      <SignatoriesModal
        isOpen={showSignatoriesModal}
        onClose={() => setShowSignatoriesModal(false)}
        signatories={signatories}
        onSave={handleSignatorySave}
        currentUser={resolvedUser}
        employees={employees || []}
        isSaving={savingSignatories}
      />
    </div>
  )
}

export default ReportsPage
