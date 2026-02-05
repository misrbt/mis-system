import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building2,
  Package,
  Calendar,
  DollarSign,
  Shield,
  Layers,
} from 'lucide-react'
import apiClient from '../../../services/apiClient'

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

const INITIAL_FILTERS = {
  // Location & Assignment
  branch_id: '',
  employee_id: '',
  assignment_status: '', // assigned, unassigned

  // Asset Identification
  category_id: '',
  subcategory_id: '',
  asset_name: '',
  serial_number: '',

  // Financial
  cost_min: '',
  cost_max: '',
  book_value_min: '',
  book_value_max: '',

  // Status & Condition
  status_id: '',
  warranty_status: '', // active, expiring_soon, expired, no_warranty

  // Dates
  purchase_date_from: '',
  purchase_date_to: '',
  warranty_expiring_within: '', // 30, 60, 90 days

  // Vendor
  vendor_id: '',

  // Age
  age_min: '', // years
  age_max: '', // years
}

const AdvancedAssetTracker = ({
  branches,
  categories,
  statuses,
  vendors,
  employees,
}) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS)
  const [sorting, setSorting] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    identification: true,
    financial: false,
    status: false,
    dates: false,
  })

  // Fetch subcategories when category changes
  const { data: subcategories } = useQuery({
    queryKey: ['filter-subcategories', filters.category_id],
    queryFn: async () => {
      if (!filters.category_id) return []
      const response = await apiClient.get(`/asset-categories/${filters.category_id}/subcategories`)
      return normalizeArrayResponse(response.data)
    },
    enabled: !!filters.category_id,
    staleTime: 5 * 60 * 1000,
  })

  // Build query params from applied filters
  const buildQueryParams = useCallback((filterValues) => {
    const params = new URLSearchParams()
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value)
      }
    })
    return params.toString()
  }, [])

  // Fetch assets with filters
  const { data: assetsData, isLoading, refetch } = useQuery({
    queryKey: ['tracked-assets', appliedFilters],
    queryFn: async () => {
      const queryString = buildQueryParams(appliedFilters)
      const response = await apiClient.get(`/assets/track?${queryString}`)
      return normalizeArrayResponse(response.data)
    },
    enabled: showResults,
    staleTime: 0,
  })

  const assets = useMemo(() => assetsData || [], [assetsData])

  // Handle filter change
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value }
      // Reset subcategory when category changes
      if (name === 'category_id') {
        newFilters.subcategory_id = ''
      }
      return newFilters
    })
  }, [])

  // Apply filters and show results
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(filters)
    setShowResults(true)
  }, [filters])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
    setAppliedFilters(INITIAL_FILTERS)
    setShowResults(false)
  }, [])

  // Toggle section
  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(appliedFilters).filter((v) => v !== '').length
  }, [appliedFilters])

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '—'
    return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get warranty status badge
  const getWarrantyBadge = (warrantyDate) => {
    if (!warrantyDate) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">No Warranty</span>
    }
    const today = new Date()
    const warranty = new Date(warrantyDate)
    const daysUntilExpiry = Math.ceil((warranty - today) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Expired</span>
    } else if (daysUntilExpiry <= 30) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Expiring Soon</span>
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
    }
  }

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'asset_name',
        header: 'Asset Name',
        size: 200,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-900">{row.original.asset_name}</div>
            <div className="text-xs text-slate-500">{row.original.category?.name}</div>
          </div>
        ),
      },
      {
        accessorKey: 'serial_number',
        header: 'Serial No.',
        size: 140,
        cell: ({ getValue }) => (
          <span className="font-mono text-sm text-slate-700">{getValue() || '—'}</span>
        ),
      },
      {
        accessorKey: 'assigned_employee',
        header: 'Assigned To',
        size: 180,
        cell: ({ row }) => {
          const employee = row.original.assigned_employee
          if (!employee) {
            return <span className="text-slate-400 italic">Unassigned</span>
          }
          return (
            <div>
              <div className="font-medium text-slate-900 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {employee.fullname}
              </div>
              {employee.branch && (
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {employee.branch.branch_name}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: ({ row }) => {
          const status = row.original.status
          if (!status) return '—'
          const colorMap = {
            'New': 'bg-blue-100 text-blue-700',
            'Functional': 'bg-green-100 text-green-700',
            'Defective': 'bg-red-100 text-red-700',
            'For Repair': 'bg-amber-100 text-amber-700',
            'Disposed': 'bg-slate-100 text-slate-600',
          }
          const colorClass = colorMap[status.name] || 'bg-slate-100 text-slate-600'
          return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
              {status.name}
            </span>
          )
        },
      },
      {
        accessorKey: 'purchase_date',
        header: 'Purchase Date',
        size: 120,
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        accessorKey: 'acq_cost',
        header: 'Acq. Cost',
        size: 120,
        cell: ({ getValue }) => formatCurrency(getValue()),
      },
      {
        accessorKey: 'book_value',
        header: 'Book Value',
        size: 120,
        cell: ({ getValue }) => formatCurrency(getValue()),
      },
      {
        accessorKey: 'waranty_expiration_date',
        header: 'Warranty',
        size: 130,
        cell: ({ getValue }) => getWarrantyBadge(getValue()),
      },
      {
        accessorKey: 'vendor',
        header: 'Vendor',
        size: 150,
        cell: ({ row }) => row.original.vendor?.company_name || '—',
      },
    ],
    []
  )

  // React Table instance
  const table = useReactTable({
    data: assets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
    },
  })

  // Filter Section Component
  const FilterSection = ({ title, icon: Icon, section, children }) => (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-600" />
          <span className="font-medium text-slate-700">{title}</span>
        </div>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="p-4 bg-white">{children}</div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-6 h-6" />
          <h2 className="text-xl font-bold">Advanced Asset Tracker</h2>
        </div>
        <p className="text-indigo-100 text-sm">
          Deep track and filter IT assets by location, assignment, financial data, warranty status, and more.
        </p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Filter Criteria</h3>
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            )}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {showFilterPanel ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide Filters
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show Filters
                </>
              )}
            </button>
          </div>
        </div>

        {showFilterPanel && (
        <>
        <div className="space-y-4">
          {/* Location & Assignment */}
          <FilterSection title="Location & Assignment" icon={Building2} section="location">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                <select
                  name="branch_id"
                  value={filters.branch_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Branches</option>
                  {branches?.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Employee</label>
                <select
                  name="employee_id"
                  value={filters.employee_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Employees</option>
                  {employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.fullname}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignment Status</label>
                <select
                  name="assignment_status"
                  value={filters.assignment_status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
            </div>
          </FilterSection>

          {/* Asset Identification */}
          <FilterSection title="Asset Identification" icon={Package} section="identification">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  name="category_id"
                  value={filters.category_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
                <select
                  name="subcategory_id"
                  value={filters.subcategory_id}
                  onChange={handleFilterChange}
                  disabled={!filters.category_id}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-slate-50"
                >
                  <option value="">{!filters.category_id ? 'Select category first' : 'All Subcategories'}</option>
                  {subcategories?.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name Contains</label>
                <input
                  type="text"
                  name="asset_name"
                  value={filters.asset_name}
                  onChange={handleFilterChange}
                  placeholder="e.g. Laptop, Monitor..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number Contains</label>
                <input
                  type="text"
                  name="serial_number"
                  value={filters.serial_number}
                  onChange={handleFilterChange}
                  placeholder="e.g. SN-2024..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </FilterSection>

          {/* Financial */}
          <FilterSection title="Financial Data" icon={DollarSign} section="financial">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acquisition Cost (Min)</label>
                <input
                  type="number"
                  name="cost_min"
                  value={filters.cost_min}
                  onChange={handleFilterChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acquisition Cost (Max)</label>
                <input
                  type="number"
                  name="cost_max"
                  value={filters.cost_max}
                  onChange={handleFilterChange}
                  placeholder="100000.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Book Value (Min)</label>
                <input
                  type="number"
                  name="book_value_min"
                  value={filters.book_value_min}
                  onChange={handleFilterChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Book Value (Max)</label>
                <input
                  type="number"
                  name="book_value_max"
                  value={filters.book_value_max}
                  onChange={handleFilterChange}
                  placeholder="100000.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </FilterSection>

          {/* Status & Warranty */}
          <FilterSection title="Status & Warranty" icon={Shield} section="status">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asset Status</label>
                <select
                  name="status_id"
                  value={filters.status_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Statuses</option>
                  {statuses?.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Status</label>
                <select
                  name="warranty_status"
                  value={filters.warranty_status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All</option>
                  <option value="active">Active Warranty</option>
                  <option value="expiring_soon">Expiring Soon (30 days)</option>
                  <option value="expired">Expired</option>
                  <option value="none">No Warranty Info</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                <select
                  name="vendor_id"
                  value={filters.vendor_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Vendors</option>
                  {vendors?.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.company_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </FilterSection>

          {/* Dates */}
          <FilterSection title="Purchase Date & Age" icon={Calendar} section="dates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase From</label>
                <input
                  type="date"
                  name="purchase_date_from"
                  value={filters.purchase_date_from}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase To</label>
                <input
                  type="date"
                  name="purchase_date_to"
                  value={filters.purchase_date_to}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asset Age (Min Years)</label>
                <input
                  type="number"
                  name="age_min"
                  value={filters.age_min}
                  onChange={handleFilterChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asset Age (Max Years)</label>
                <input
                  type="number"
                  name="age_max"
                  value={filters.age_max}
                  onChange={handleFilterChange}
                  placeholder="10"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Track Assets
          </button>
        </div>
        </>
        )}
      </div>

      {/* Results Table */}
      {showResults && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Results Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-slate-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Tracking Results</h3>
                  <p className="text-sm text-slate-500">
                    {assets.length} asset{assets.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              {/* Summary badges */}
              <div className="hidden md:flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-slate-600">Loading assets...</span>
            </div>
          )}

          {/* Table */}
          {!isLoading && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                            style={{ width: header.column.getSize() }}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <div className="flex items-center gap-1">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <ChevronUp className="w-4 h-4" />,
                                desc: <ChevronDown className="w-4 h-4" />,
                              }[header.column.getIsSorted()] ?? (
                                <ChevronsUpDown className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Package className="w-12 h-12 text-slate-300 mb-3" />
                            <p className="text-slate-600 font-medium">No assets found</p>
                            <p className="text-sm text-slate-400">Try adjusting your filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3 text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {assets.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>Rows per page:</span>
                      <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                      >
                        {[10, 20, 30, 50, 100].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => table.setPageIndex(0)}
                          disabled={!table.getCanPreviousPage()}
                          className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => table.previousPage()}
                          disabled={!table.getCanPreviousPage()}
                          className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => table.nextPage()}
                          disabled={!table.getCanNextPage()}
                          className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                          disabled={!table.getCanNextPage()}
                          className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(AdvancedAssetTracker)
