import { useState, useMemo, Fragment, useRef, useCallback, useEffect } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  FileSearch,
  Filter,
  X,
  Download,
  User,
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowRight,
  Clock,
  LayoutList,
  LayoutGrid,
  Plus,
  UserX,
  Wrench,
  Edit,
  Trash2,
  QrCode,
  Database,
  AlertCircle,
  RefreshCw,
  Search,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getExpandedRowModel,
} from '@tanstack/react-table'
import auditLogService from '../../services/auditLogService'
import Swal from 'sweetalert2'

// Movement type icon mapping
const getMovementIconComponent = (type) => {
  const icons = {
    created: Plus,
    assigned: User,
    transferred: RefreshCw,
    returned: UserX,
    status_changed: Activity,
    repair_initiated: Wrench,
    repair_completed: Wrench,
    repair_deleted: Trash2,
    updated: Edit,
    disposed: Trash2,
    code_generated: QrCode,
    inventory_operation: Database,
  }
  return icons[type] || AlertCircle
}

// Movement type color mapping - SOLID COLORS ONLY (matching project style)
const getMovementStyles = (type) => {
  const styles = {
    created: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: 'text-emerald-600',
      dot: 'bg-emerald-500',
    },
    assigned: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      dot: 'bg-blue-500',
    },
    transferred: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600',
      dot: 'bg-purple-500',
    },
    returned: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-600',
      dot: 'bg-orange-500',
    },
    status_changed: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
      icon: 'text-indigo-600',
      dot: 'bg-indigo-500',
    },
    repair_initiated: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
      dot: 'bg-red-500',
    },
    repair_completed: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: 'text-emerald-600',
      dot: 'bg-emerald-500',
    },
    repair_deleted: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
      dot: 'bg-red-500',
    },
    updated: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      icon: 'text-slate-600',
      dot: 'bg-slate-500',
    },
    disposed: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
      dot: 'bg-red-500',
    },
    code_generated: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-700',
      icon: 'text-cyan-600',
      dot: 'bg-cyan-500',
    },
    inventory_operation: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-600',
      dot: 'bg-amber-500',
    },
  }
  return styles[type] || styles.updated
}

const formatChangeValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-400 italic">null</span>
  }
  return <span className="font-medium">{value}</span>
}

// Date range presets
const DATE_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
]

function AuditLogsPage() {
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'timeline'
  const [expanded, setExpanded] = useState({})
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    movement_type: '',
    performed_by: '',
    search: '',
  })
  const [sorting, setSorting] = useState([{ id: 'movement_date', desc: true }])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  })
  const [mobileGlobalFilter, setMobileGlobalFilter] = useState('')
  const [mobileSorting, setMobileSorting] = useState([{ id: 'movement_date', desc: true }])

  // Fetch audit logs for table view (regular pagination)
  const {
    data: auditData,
    isLoading: isLoadingTable,
    refetch: refetchTable,
    isFetching: isFetchingTable,
  } = useQuery({
    queryKey: ['audit-logs', filters, pagination.pageIndex, pagination.pageSize, sorting],
    queryFn: () =>
      auditLogService.fetchAuditLogs({
        ...filters,
        per_page: pagination.pageSize,
        page: pagination.pageIndex + 1,
        sort_by: sorting[0]?.id || 'movement_date',
        sort_order: sorting[0]?.desc ? 'desc' : 'asc',
      }),
    enabled: viewMode === 'table',
  })

  // Fetch audit logs for timeline view (infinite scroll)
  const {
    data: timelineData,
    isLoading: isLoadingTimeline,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchTimeline,
  } = useInfiniteQuery({
    queryKey: ['audit-logs-timeline', filters, sorting],
    queryFn: ({ pageParam = 1 }) =>
      auditLogService.fetchAuditLogs({
        ...filters,
        per_page: 20, // Smaller page size for infinite scroll
        page: pageParam,
        sort_by: sorting[0]?.id || 'movement_date',
        sort_order: sorting[0]?.desc ? 'desc' : 'asc',
      }),
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta?.current_page
      const lastPageNum = lastPage.meta?.last_page
      return currentPage < lastPageNum ? currentPage + 1 : undefined
    },
    enabled: viewMode === 'timeline',
  })

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef(null)

  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  // Setup intersection observer
  useEffect(() => {
    const element = loadMoreRef.current
    if (!element || viewMode !== 'timeline') return

    const option = {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    }

    const observer = new IntersectionObserver(handleObserver, option)
    observer.observe(element)

    return () => observer.disconnect()
  }, [handleObserver, viewMode])

  // Determine which data and loading state to use
  const isLoading = viewMode === 'table' ? isLoadingTable : isLoadingTimeline
  const refetch = viewMode === 'table' ? refetchTable : refetchTimeline
  const isFetching = viewMode === 'table' ? isFetchingTable : isFetchingNextPage

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ['audit-stats', filters],
    queryFn: () => auditLogService.fetchStatistics(filters),
  })

  // Flatten timeline data from pages
  const timelineMovements = useMemo(() => {
    if (!timelineData?.pages) return []
    return timelineData.pages.flatMap(page => page.data || [])
  }, [timelineData])

  // Use appropriate data based on view mode
  const movements = viewMode === 'table' ? (auditData?.data || []) : timelineMovements
  const meta = viewMode === 'table' ? (auditData?.meta || {}) : (timelineData?.pages?.[0]?.meta || {})
  const stats = statsData?.data || {}

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'SY'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  // Table columns
  const columns = useMemo(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          const hasChanges = row.original.metadata?.changed_fields?.length > 0
          const hasAsset = row.original.asset
          if (!hasChanges && !hasAsset) return null

          return (
            <button
              onClick={(e) => {
                e.stopPropagation()
                row.toggleExpanded()
              }}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
              title="View details"
            >
              {row.getIsExpanded() ? (
                <ChevronUp className="w-4 h-4 text-blue-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
          )
        },
        size: 40,
      },
      {
        accessorKey: 'movement_date',
        header: 'Date & Time',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900">
              {new Date(row.original.movement_date).toLocaleDateString()}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(row.original.movement_date).toLocaleTimeString()}
            </span>
          </div>
        ),
        size: 130,
      },
      {
        accessorKey: 'movement_type',
        header: 'Action',
        cell: ({ row }) => {
          const type = row.original.movement_type
          const styles = getMovementStyles(type)
          const Icon = getMovementIconComponent(type)

          return (
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${styles.bg} border ${styles.border} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${styles.icon}`} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${styles.bg} ${styles.text} border ${styles.border}`}>
                {type.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          )
        },
        size: 200,
      },
      {
        accessorKey: 'asset',
        header: 'Asset',
        cell: ({ row }) => {
          const asset = row.original.asset
          return asset ? (
            <div>
              <div className="text-sm font-medium text-slate-900">{asset.asset_name}</div>
              {asset.serial_number && (
                <div className="text-xs text-slate-500">{asset.serial_number}</div>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">N/A</span>
          )
        },
        size: 180,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="text-sm text-slate-700 max-w-md">{row.original.description}</div>
        ),
        size: 300,
      },
      {
        accessorKey: 'performed_by',
        header: 'Performed By',
        cell: ({ row }) => {
          const user = row.original.performed_by
          if (!user) return <span className="text-xs text-slate-400 italic">System</span>

          const initials = getUserInitials(user.name)
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
              <span className="text-sm text-slate-700">{user.name}</span>
            </div>
          )
        },
        size: 180,
      },
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: movements,
    columns,
    state: {
      sorting,
      expanded,
      pagination,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => {
      const hasChanges = row.original.metadata?.changed_fields?.length > 0
      const hasAsset = row.original.asset
      return hasChanges || hasAsset
    },
    manualPagination: true,
    pageCount: meta.last_page || 1,
    onPaginationChange: setPagination,
  })

  // Mobile columns for simpler filtering
  const mobileColumns = useMemo(
    () => [
      { accessorKey: 'movement_date', header: 'Date' },
      { accessorKey: 'movement_type', header: 'Action Type' },
      { accessorKey: 'description', header: 'Description' },
    ],
    []
  )


  const mobileTable = useReactTable({
    data: movements,
    columns: mobileColumns,
    state: {
      globalFilter: mobileGlobalFilter,
      sorting: mobileSorting,
    },
    onGlobalFilterChange: setMobileGlobalFilter,
    onSortingChange: setMobileSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const mobileSortId = mobileSorting[0]?.id || ''
  const mobileSortDesc = mobileSorting[0]?.desc || false
  const mobilePagination = mobileTable.getState().pagination
  const mobileFilteredCount = mobileTable.getFilteredRowModel().rows.length
  const mobileStart = mobileFilteredCount === 0 ? 0 : mobilePagination.pageIndex * mobilePagination.pageSize + 1
  const mobileEnd = Math.min((mobilePagination.pageIndex + 1) * mobilePagination.pageSize, mobileFilteredCount)

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleClearFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      movement_type: '',
      performed_by: '',
      search: '',
    })
  }

  const applyDatePreset = (days) => {
    const today = new Date()
    const dateFrom = new Date(today)
    dateFrom.setDate(today.getDate() - days)

    setFilters((prev) => ({
      ...prev,
      date_from: days === 0 ? today.toISOString().split('T')[0] : dateFrom.toISOString().split('T')[0],
      date_to: today.toISOString().split('T')[0],
    }))
  }

  // Handle export
  const handleExport = async () => {
    try {
      await auditLogService.exportAuditLogs(filters)
      Swal.fire({
        icon: 'success',
        title: 'Export Started',
        text: 'Your audit log export is being prepared',
        timer: 2000,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: error.message || 'Failed to export audit logs',
      })
    }
  }

  // Expandable row details
  const renderExpandedRow = (row) => {
    const metadata = row.original.metadata
    const asset = row.original.asset
    const hasChanges = metadata?.changed_fields && metadata.changed_fields.length > 0

    if (!hasChanges && !asset) return null

    return (
      <tr>
        <td colSpan={columns.length} className="p-0">
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Details */}
              {asset && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Asset Details</h4>
                  <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {/* Asset Name */}
                      {asset.asset_name && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Asset Name</div>
                          <div className="text-sm font-medium text-slate-900">{asset.asset_name}</div>
                        </div>
                      )}

                      {/* Serial Number */}
                      {asset.serial_number && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Serial Number</div>
                          <div className="text-sm font-medium text-slate-900">{asset.serial_number}</div>
                        </div>
                      )}

                      {/* Brand */}
                      {asset.brand && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Brand</div>
                          <div className="text-sm font-medium text-slate-900">{asset.brand}</div>
                        </div>
                      )}

                      {/* Model */}
                      {asset.model && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Model</div>
                          <div className="text-sm font-medium text-slate-900">{asset.model}</div>
                        </div>
                      )}

                      {/* Category */}
                      {asset.category?.category_name && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Category</div>
                          <div className="text-sm font-medium text-slate-900">{asset.category.category_name}</div>
                        </div>
                      )}

                      {/* Status */}
                      {asset.status?.name && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Status</div>
                          <div className="text-sm font-medium text-slate-900">{asset.status.name}</div>
                        </div>
                      )}

                      {/* Acquisition Cost */}
                      {asset.acq_cost && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Acquisition Cost</div>
                          <div className="text-sm font-medium text-emerald-600">
                            ₱{parseFloat(asset.acq_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}

                      {/* Book Value */}
                      {asset.book_value && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Book Value</div>
                          <div className="text-sm font-medium text-blue-600">
                            ₱{parseFloat(asset.book_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}

                      {/* Purchase Date */}
                      {asset.purchase_date && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Purchase Date</div>
                          <div className="text-sm font-medium text-slate-900">
                            {new Date(asset.purchase_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Warranty Expiration */}
                      {asset.waranty_expiration_date && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Warranty Expiration</div>
                          <div className="text-sm font-medium text-slate-900">
                            {new Date(asset.waranty_expiration_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Estimated Life */}
                      {asset.estimate_life && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Estimated Life</div>
                          <div className="text-sm font-medium text-slate-900">{asset.estimate_life} years</div>
                        </div>
                      )}

                      {/* Vendor */}
                      {asset.vendor?.company_name && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Vendor</div>
                          <div className="text-sm font-medium text-slate-900">{asset.vendor.company_name}</div>
                        </div>
                      )}

                      {/* Assigned Employee */}
                      {asset.assigned_employee?.fullname && (
                        <div className="col-span-2">
                          <div className="text-xs text-slate-500 mb-1">Assigned To</div>
                          <div className="text-sm font-medium text-slate-900">
                            {asset.assigned_employee.fullname}
                            {asset.assigned_employee.position?.position_name && (
                              <span className="text-slate-500"> • {asset.assigned_employee.position.position_name}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Remarks */}
                      {asset.remarks && (
                        <div className="col-span-2">
                          <div className="text-xs text-slate-500 mb-1">Remarks</div>
                          <div className="text-sm text-slate-700">{asset.remarks}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Change Details */}
              {hasChanges && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Changes Made</h4>
                  <div className="space-y-2">
                    {metadata.changed_fields.map((field, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
                      >
                        <div className="text-xs font-medium text-slate-600 mb-2">{field.label}</div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex-1 text-red-600 line-through">
                            {formatChangeValue(field.old_value)}
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div className="flex-1 text-emerald-600 font-semibold">
                            {formatChangeValue(field.new_value)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reason */}
            {row.original.reason && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-medium text-blue-900 mb-1">Reason</div>
                <div className="text-sm text-blue-700">{row.original.reason}</div>
              </div>
            )}

            {/* Remarks */}
            {row.original.remarks && row.original.remarks !== row.original.reason && (
              <div className="mt-3 p-3 bg-slate-100 border border-slate-200 rounded-lg">
                <div className="text-xs font-medium text-slate-700 mb-1">Additional Remarks</div>
                <div className="text-sm text-slate-600">{row.original.remarks}</div>
              </div>
            )}
          </div>
        </td>
      </tr>
    )
  }

  // Smart pagination numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const total = meta.last_page || 1
    const current = pagination.pageIndex + 1
    const delta = 2

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i)
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current + delta < total - 1) {
      rangeWithDots.push('...', total)
    } else if (current + delta === total - 1) {
      rangeWithDots.push(total)
    } else if (range[range.length - 1] !== total) {
      rangeWithDots.push(total)
    }

    return rangeWithDots
  }, [meta.last_page, pagination.pageIndex])

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <FileSearch className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Audit Trail</h1>
              <p className="text-xs sm:text-sm text-slate-600">Track all system activity and changes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {[
          {
            label: 'Total Activities',
            value: stats.total_movements || 0,
            icon: Activity,
            color: 'blue',
          },
          {
            label: 'Status Changes',
            value: stats.by_type?.status_changed || 0,
            icon: TrendingUp,
            color: 'indigo',
          },
          {
            label: 'Assignments',
            value: (stats.by_type?.assigned || 0) + (stats.by_type?.transferred || 0),
            icon: User,
            color: 'emerald',
          },
          {
            label: 'Repairs',
            value: (stats.by_type?.repair_initiated || 0) + (stats.by_type?.repair_completed || 0),
            icon: Wrench,
            color: 'amber',
          },
        ].map((stat, idx) => {
          const colors = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            amber: 'bg-amber-50 text-amber-600 border-amber-200',
          }

          return (
            <div key={idx} className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${colors[stat.color]} border flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              Filters
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Date Presets */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Quick Date Range</label>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyDatePreset(preset.days)}
                  className="px-3 py-1.5 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Asset name or serial..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Movement Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Action Type</label>
              <select
                value={filters.movement_type}
                onChange={(e) => handleFilterChange('movement_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Actions</option>
                <option value="created">Created</option>
                <option value="assigned">Assigned</option>
                <option value="transferred">Transferred</option>
                <option value="returned">Returned</option>
                <option value="status_changed">Status Changed</option>
                <option value="repair_initiated">Repair Initiated</option>
                <option value="repair_completed">Repair Completed</option>
                <option value="repair_deleted">Repair Deleted</option>
                <option value="updated">Updated</option>
                <option value="disposed">Disposed</option>
                <option value="code_generated">Code Generated</option>
                <option value="inventory_operation">Inventory Operation</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.movement_type || filters.date_from || filters.date_to) && (
            <div className="mt-4">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {!showFilters && (
        <button
          onClick={() => setShowFilters(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Show Filters
        </button>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs sm:text-sm text-slate-600">
          {meta.total ? (
            <>
              <span className="hidden sm:inline">Showing </span><span className="font-semibold text-slate-900">{meta.total.toLocaleString()}</span> <span className="hidden sm:inline">total</span> activities
            </>
          ) : (
            'No activities found'
          )}
        </div>
        <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 sm:p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
              viewMode === 'timeline'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      {viewMode === 'table' ? (
        <div className="space-y-3 sm:space-y-4">
          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2">
            {/* Mobile Search and Sort Controls */}
            {movements.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={mobileGlobalFilter}
                    onChange={(e) => setMobileGlobalFilter(e.target.value)}
                    placeholder="Search activities..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <select
                    value={mobileSortId}
                    onChange={(e) => setMobileSorting([{ id: e.target.value, desc: mobileSortDesc }])}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="movement_date">Date</option>
                    <option value="movement_type">Action Type</option>
                    <option value="description">Description</option>
                  </select>
                  <button
                    onClick={() => setMobileSorting([{ id: mobileSortId, desc: !mobileSortDesc }])}
                    className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {mobileSortDesc ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>

                {/* Results count */}
                <div className="text-xs text-slate-600">
                  Showing {mobileStart}-{mobileEnd} of {mobileFilteredCount} activities
                </div>
              </div>
            )}

            {/* Cards */}
            {isLoading ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <span className="text-xs text-slate-600">Loading activities...</span>
              </div>
            ) : mobileFilteredCount === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-6 text-center text-sm text-slate-600">
                {mobileGlobalFilter ? 'No activities match your search' : 'No activities found'}
              </div>
            ) : (
              mobileTable.getRowModel().rows.map((row) => {
                const movement = row.original
                const styles = getMovementStyles(movement.movement_type)
                const Icon = getMovementIconComponent(movement.movement_type)
                const performedBy = movement.performed_by
                const initials = getUserInitials(performedBy?.name)

                return (
                  <div key={movement.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${styles.bg} ${styles.border} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${styles.icon}`} />
                        </div>
                        <div>
                          <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${styles.bg} ${styles.text} border ${styles.border}`}>
                            {movement.movement_type.replace(/_/g, ' ').toUpperCase()}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(movement.movement_date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {performedBy && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                            {initials}
                          </div>
                          <span className="text-xs font-medium text-slate-800 hidden sm:inline">{performedBy.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-slate-800 font-semibold">{movement.description}</div>
                    {movement.asset && (
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">{movement.asset.asset_name}</span>
                        {movement.asset.serial_number && (
                          <span className="text-slate-500"> • {movement.asset.serial_number}</span>
                        )}
                      </div>
                    )}

                    {movement.metadata?.changed_fields?.length > 0 && (
                      <div className="space-y-1.5 border-t border-slate-100 pt-2">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase">Changes</div>
                        <div className="space-y-1">
                          {movement.metadata.changed_fields.slice(0, 3).map((change, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px] bg-slate-50 border border-slate-200 rounded px-2 py-1">
                              <span className="font-semibold text-slate-700">{change.field.replace(/_/g, ' ')}</span>
                              <span className="text-slate-600">
                                <span className="line-through text-slate-400 mr-0.5">{String(change.old_value || '—')}</span>
                                <ChevronRight className="w-2.5 h-2.5 inline text-slate-400" />
                                <span className="ml-0.5 font-semibold text-emerald-700">{String(change.new_value || '—')}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? 'cursor-pointer select-none hover:text-slate-900 flex items-center gap-1'
                                : ''
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: ' ↑',
                              desc: ' ↓',
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm text-slate-600">Loading audit logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <FileSearch className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Activity Found</h3>
                          <p className="text-sm text-slate-600 max-w-sm mx-auto">
                            {filters.search || filters.movement_type || filters.date_from || filters.date_to
                              ? `Try adjusting your filters or search criteria to find what you're looking for.`
                              : `No audit logs have been recorded yet. Activity will appear here as users interact with the system.`}
                          </p>
                        </div>
                        {(filters.search || filters.movement_type || filters.date_from || filters.date_to) && (
                          <button
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm mt-2"
                          >
                            <X className="w-4 h-4" />
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {table.getRowModel().rows.map((row) => (
                      <Fragment key={row.id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                        {row.getIsExpanded() && renderExpandedRow(row)}
                      </Fragment>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
          </div>

          {/* Pagination */}
          {movements.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page info */}
                <div className="text-sm text-slate-700">
                  Page <span className="font-semibold">{pagination.pageIndex + 1}</span> of{' '}
                  <span className="font-semibold">{meta.last_page || 1}</span>
                  {meta.total && (
                    <>
                      {' • '}
                      <span className="font-semibold">{meta.total.toLocaleString()}</span> total
                    </>
                  )}
                </div>

                {/* Page controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {pageNumbers.map((pageNum, idx) =>
                      pageNum === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => table.setPageIndex(pageNum - 1)}
                          className={`min-w-[2.5rem] px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                            pagination.pageIndex + 1 === pageNum
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <span className="text-sm text-slate-600">Loading timeline...</span>
            </div>
          ) : movements.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileSearch className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Activity Found</h3>
              <p className="text-sm text-slate-600 mb-4">
                {filters.search || filters.movement_type || filters.date_from || filters.date_to
                  ? `Try adjusting your filters to find what you're looking for.`
                  : `No audit logs have been recorded yet.`}
              </p>
              {(filters.search || filters.movement_type || filters.date_from || filters.date_to) && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            movements.map((movement, idx) => {
              const styles = getMovementStyles(movement.movement_type)
              const Icon = getMovementIconComponent(movement.movement_type)
              const isLast = idx === movements.length - 1
              const performedBy = movement.performed_by
              const initials = getUserInitials(performedBy?.name)

              return (
                <div key={movement.id} className="relative pl-10 pb-8">
                  {/* Timeline connector line */}
                  {!isLast && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-slate-200"></div>
                  )}

                  {/* Timeline dot with icon */}
                  <div
                    className={`absolute left-0 top-4 w-8 h-8 rounded-full ${styles.bg} border-2 ${styles.border} flex items-center justify-center shadow-sm`}
                  >
                    <Icon className={`w-4 h-4 ${styles.icon}`} />
                  </div>

                  {/* Content card */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow ml-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${styles.bg} ${styles.text} border ${styles.border}`}>
                            {movement.movement_type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(movement.movement_date).toLocaleString()}
                          </div>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-1">
                          {movement.description}
                        </h4>
                        {movement.asset && (
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">{movement.asset.asset_name}</span>
                            {movement.asset.serial_number && (
                              <span className="text-slate-500"> • {movement.asset.serial_number}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* User avatar */}
                      {performedBy && (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-xs font-medium text-slate-900">{performedBy.name}</div>
                            <div className="text-xs text-slate-500">Performed by</div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                            {initials}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Change details */}
                    {movement.metadata?.changed_fields && movement.metadata.changed_fields.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="text-xs font-medium text-slate-600 mb-2">Changes Made:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {movement.metadata.changed_fields.slice(0, 4).map((field, fieldIdx) => (
                            <div key={fieldIdx} className="text-xs bg-slate-50 p-2 rounded border border-slate-200">
                              <div className="text-slate-600 font-medium mb-1">{field.label}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-red-600 line-through truncate">{field.old_value || 'null'}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="text-emerald-600 font-semibold truncate">{field.new_value || 'null'}</span>
                              </div>
                            </div>
                          ))}
                          {movement.metadata.changed_fields.length > 4 && (
                            <div className="text-xs text-slate-500 italic col-span-2">
                              +{movement.metadata.changed_fields.length - 4} more changes
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reason */}
                    {movement.reason && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <span className="font-medium text-blue-900">Reason:</span>{' '}
                        <span className="text-blue-700">{movement.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {/* Infinite scroll loading indicator */}
          {movements.length > 0 && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-8">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Loading more activities...</span>
                </div>
              ) : hasNextPage ? (
                <div className="text-sm text-slate-500">Scroll to load more</div>
              ) : (
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <div className="h-px bg-slate-200 flex-1 max-w-xs"></div>
                  <span>All activities loaded</span>
                  <div className="h-px bg-slate-200 flex-1 max-w-xs"></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AuditLogsPage;
