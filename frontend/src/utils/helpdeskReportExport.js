// Shared PDF/Excel/Word/Print helpers for the Helpdesk Reports and Audit Logs pages.
// Normalized section shape keeps the three exporters interchangeable:
//   sections = [{ heading: string, columns: string[], rows: (string|number|null)[][] }]
// meta = { title, subtitle?, dateRange? {from, to} }

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx-js-style'

const DEFAULT_HEADER = '3F51B5'
const HEADER_TEXT = 'FFFFFF'

function formatDateRange(meta) {
  if (!meta?.dateRange) return ''
  const { from, to } = meta.dateRange
  if (!from && !to) return ''
  return `Date range: ${from || '...'} — ${to || '...'}`
}

// -------------------------------------------------------------------
// PDF
// -------------------------------------------------------------------
export function exportToPDF(sections, meta = {}) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.width

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(meta.title || 'Helpdesk Report', pageWidth / 2, 14, { align: 'center' })

  if (meta.subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(meta.subtitle, pageWidth / 2, 20, { align: 'center' })
  }

  const range = formatDateRange(meta)
  if (range) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.text(range, pageWidth / 2, 26, { align: 'center' })
  }

  let cursorY = range ? 30 : meta.subtitle ? 24 : 20

  sections.forEach((section, idx) => {
    if (idx > 0) cursorY += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(section.heading, 14, cursorY)
    cursorY += 2

    autoTable(doc, {
      head: [section.columns],
      body: section.rows.map((r) => r.map((cell) => (cell == null ? '' : String(cell)))),
      startY: cursorY + 2,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255], fontStyle: 'bold' },
      didDrawPage: (data) => {
        cursorY = data.cursor.y
      },
    })

    cursorY = doc.lastAutoTable.finalY + 4
  })

  const fileName = `${(meta.title || 'helpdesk-report').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// -------------------------------------------------------------------
// Excel
// -------------------------------------------------------------------
export function exportToExcel(sections, meta = {}) {
  const headerFill = { fgColor: { rgb: DEFAULT_HEADER } }
  const headerFont = { bold: true, color: { rgb: HEADER_TEXT }, sz: 10 }
  const thinBorder = {
    top: { style: 'thin', color: { rgb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
    left: { style: 'thin', color: { rgb: 'CBD5E1' } },
    right: { style: 'thin', color: { rgb: 'CBD5E1' } },
  }

  const wb = XLSX.utils.book_new()

  sections.forEach((section) => {
    const data = []

    // Section banner
    data.push([section.heading])
    data.push(section.columns)
    section.rows.forEach((r) => data.push(r.map((cell) => (cell == null ? '' : cell))))

    const ws = XLSX.utils.aoa_to_sheet(data)

    // Style the banner row
    const bannerRef = XLSX.utils.encode_cell({ r: 0, c: 0 })
    if (ws[bannerRef]) {
      ws[bannerRef].s = {
        fill: headerFill,
        font: { ...headerFont, sz: 12 },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: thinBorder,
      }
    }

    // Style the column-headers row (row index 1)
    section.columns.forEach((_, c) => {
      const ref = XLSX.utils.encode_cell({ r: 1, c })
      if (ws[ref]) {
        ws[ref].s = {
          fill: headerFill,
          font: headerFont,
          alignment: { horizontal: 'center', vertical: 'center' },
          border: thinBorder,
        }
      }
    })

    // Body cell borders
    for (let r = 2; r < data.length; r += 1) {
      for (let c = 0; c < section.columns.length; c += 1) {
        const ref = XLSX.utils.encode_cell({ r, c })
        if (ws[ref]) {
          ws[ref].s = {
            ...(ws[ref].s || {}),
            border: thinBorder,
            alignment: { vertical: 'center', wrapText: true },
          }
        }
      }
    }

    // Reasonable column widths
    ws['!cols'] = section.columns.map((h) => ({ wch: Math.max(12, String(h).length + 4) }))

    // Merge banner across all columns
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(0, section.columns.length - 1) } }]

    XLSX.utils.book_append_sheet(wb, ws, section.heading.substring(0, 30))
  })

  const fileName = `${(meta.title || 'helpdesk-report').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

// -------------------------------------------------------------------
// Word (dynamic import keeps the 500kB+ docx lib out of the initial bundle)
// -------------------------------------------------------------------
export async function exportToWord(sections, meta = {}) {
  const {
    Document,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    AlignmentType,
    WidthType,
    BorderStyle,
    Packer,
    HeadingLevel,
  } = await import('docx')

  const border = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' }
  const borders = { top: border, bottom: border, left: border, right: border }

  const title = new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: meta.title || 'Helpdesk Report', bold: true })],
  })

  const subtitleChildren = []
  if (meta.subtitle) {
    subtitleChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: meta.subtitle })],
    }))
  }
  const range = formatDateRange(meta)
  if (range) {
    subtitleChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: range, italics: true, size: 18 })],
    }))
  }
  subtitleChildren.push(new Paragraph({ children: [new TextRun(' ')] }))

  const sectionBlocks = []
  sections.forEach((section) => {
    sectionBlocks.push(new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: section.heading, bold: true })],
    }))

    const headerRow = new TableRow({
      tableHeader: true,
      children: section.columns.map((col) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: String(col), bold: true, color: 'FFFFFF' })] })],
          shading: { fill: DEFAULT_HEADER, type: 'solid' },
          borders,
        })
      ),
    })

    const bodyRows = section.rows.map((row) => new TableRow({
      children: row.map((cell) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: cell == null ? '' : String(cell) })] })],
          borders,
        })
      ),
    }))

    sectionBlocks.push(new Table({
      rows: [headerRow, ...bodyRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }))

    sectionBlocks.push(new Paragraph({ children: [new TextRun(' ')] }))
  })

  const doc = new Document({
    sections: [{
      properties: {},
      children: [title, ...subtitleChildren, ...sectionBlocks],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${(meta.title || 'helpdesk-report').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// -------------------------------------------------------------------
// Print — relies on existing @media print rules in src/index.css.
// Caller adds `className="no-print"` to chrome elements.
// -------------------------------------------------------------------
export function printReport() {
  window.print()
}
