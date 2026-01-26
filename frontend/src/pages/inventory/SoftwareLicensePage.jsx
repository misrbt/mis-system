import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Key, User, Building2, Briefcase, Users, Package } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import Modal from '../../components/Modal'
import DataTable from '../../components/DataTable'
import SearchableSelect from '../../components/SearchableSelect'
import apiClient from '../../services/apiClient'
import Swal from 'sweetalert2'
import OfficeToolsTab from './software-license/OfficeToolsTab'

function SoftwareLicensePage() {
  const [activeTab, setActiveTab] = useState('licenses')
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState(null)

  // Dropdown data
  const [employees, setEmployees] = useState([])
  const [positions, setPositions] = useState([])
  const [sections, setSections] = useState([])
  const [branches, setBranches] = useState([])
  const [assetCategories, setAssetCategories] = useState([])
  const [officeTools, setOfficeTools] = useState([])

  const [formData, setFormData] = useState({
    employee_id: '',
    position_id: '',
    section_id: '',
    branch_id: '',
    asset_category_id: '',
    operating_system: '',
    licensed: '',
    office_tool_id: '',
    client_access: '',
    remarks: '',
  })

  const [mobileGlobalFilter, setMobileGlobalFilter] = useState('')
  const [mobileSorting, setMobileSorting] = useState([])

  const fetchLicenses = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/software-licenses')
      if (response.data.success) {
        setLicenses(response.data.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch software licenses',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdownData = async () => {
    try {
      const [empRes, posRes, secRes, branchRes, catRes, officeRes] = await Promise.all([
        apiClient.get('/employees'),
        apiClient.get('/positions'),
        apiClient.get('/sections'),
        apiClient.get('/branches'),
        apiClient.get('/asset-categories'),
        apiClient.get('/office-tools'),
      ])

      if (empRes.data.success) setEmployees(empRes.data.data)
      if (posRes.data.success) setPositions(posRes.data.data)
      if (secRes.data.success) setSections(secRes.data.data)
      if (branchRes.data.success) setBranches(branchRes.data.data)
      if (catRes.data.success) setAssetCategories(catRes.data.data)
      if (officeRes.data.success) setOfficeTools(officeRes.data.data)
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error)
    }
  }

  useEffect(() => {
    fetchLicenses()
    fetchDropdownData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    setFormData({
      employee_id: '',
      position_id: '',
      section_id: '',
      branch_id: '',
      asset_category_id: '',
      operating_system: '',
      licensed: '',
      office_tool_id: '',
      client_access: '',
      remarks: '',
    })
    setIsAddModalOpen(true)
  }

  const openEditModal = useCallback((license) => {
    setSelectedLicense(license)
    setFormData({
      employee_id: license.employee_id || '',
      position_id: license.position_id || '',
      section_id: license.section_id || '',
      branch_id: license.branch_id || '',
      asset_category_id: license.asset_category_id || '',
      operating_system: license.operating_system || '',
      licensed: license.licensed || '',
      office_tool_id: license.office_tool_id || '',
      client_access: license.client_access || '',
      remarks: license.remarks || '',
    })
    setIsEditModalOpen(true)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      // Convert empty strings to null for proper foreign key handling
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      )

      const response = await apiClient.post('/software-licenses', cleanedData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsAddModalOpen(false)
        fetchLicenses()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create software license',
      })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      // Convert empty strings to null for proper foreign key handling
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      )

      const response = await apiClient.put(`/software-licenses/${selectedLicense.id}`, cleanedData)
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
          timer: 2000,
        })
        setIsEditModalOpen(false)
        fetchLicenses()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update software license',
      })
    }
  }

  const handleDelete = useCallback(async (license) => {
    const employeeName = license.employee?.fullname || 'this record'
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete software license for "${employeeName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    })

    if (result.isConfirmed) {
      try {
        const response = await apiClient.delete(`/software-licenses/${license.id}`)
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: response.data.message,
            timer: 2000,
          })
          fetchLicenses()
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete software license',
        })
      }
    }
  }, [])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'employee.fullname',
        header: 'Employee',
        cell: (info) => (
          <div className="text-sm font-semibold text-slate-900">{info.getValue() || '—'}</div>
        ),
      },
      {
        accessorKey: 'position.title',
        header: 'Position',
        cell: (info) => (
          <div className="text-sm text-slate-700">{info.getValue() || '—'}</div>
        ),
      },
      {
        accessorKey: 'section.name',
        header: 'Section',
        cell: (info) => (
          <div className="text-sm text-slate-700">{info.getValue() || '—'}</div>
        ),
      },
      {
        accessorKey: 'branch.branch_name',
        header: 'Branch',
        cell: (info) => (
          <div className="text-sm text-slate-700">{info.getValue() || '—'}</div>
        ),
      },
      {
        accessorKey: 'operating_system',
        header: 'Operating System',
        cell: (info) => (
          <div className="text-sm text-slate-700">{info.getValue() || '—'}</div>
        ),
      },
      {
        accessorKey: 'office_tool_id',
        header: 'Office Tools',
        cell: ({ row }) => {
          const officeTool = row.original.office_tool || row.original.officeTool
          const displayName = officeTool
            ? `${officeTool.name}${officeTool.version ? ' ' + officeTool.version : ''}`
            : '—'
          return <div className="text-sm text-slate-700">{displayName}</div>
        },
      },
      {
        accessorKey: 'licensed',
        header: 'License',
        cell: (info) => (
          <div className="text-sm text-slate-700 font-mono">{info.getValue() || '—'}</div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:shadow-sm"
              title="Edit license"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 hover:shadow-sm"
              title="Delete license"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [handleDelete, openEditModal]
  )

  const mobileColumns = useMemo(
    () => [
      { accessorKey: 'employee.fullname', header: 'Employee' },
      { accessorKey: 'position.title', header: 'Position' },
      { accessorKey: 'operating_system', header: 'Operating System' },
      { accessorKey: 'office_tool_id', header: 'Office Tools' },
    ],
    []
  )

  const mobileTable = useReactTable({
    data: licenses,
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

  return (
    <div className="space-y-6">
      {/* Page Title */}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('licenses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'licenses'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Software Licenses
          </button>
          <button
            onClick={() => setActiveTab('officeTools')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'officeTools'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Office Tools
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'licenses' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Software Licenses</h2>
              <p className="text-sm text-slate-600 mt-1.5">Manage software licenses and assignments</p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add New License</span>
            </button>
          </div>

          {/* Mobile Cards */}
      <div className="space-y-3 sm:hidden">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={mobileGlobalFilter ?? ''}
              onChange={(e) => setMobileGlobalFilter(e.target.value)}
              placeholder="Search licenses..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={mobileSortId}
              onChange={(e) => {
                const nextId = e.target.value
                setMobileSorting(nextId ? [{ id: nextId, desc: false }] : [])
              }}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sort by</option>
              <option value="employee.fullname">Employee</option>
              <option value="position.title">Position</option>
              <option value="operating_system">Operating System</option>
              <option value="office_tools">Office Tools</option>
            </select>
            <button
              type="button"
              onClick={() => {
                if (!mobileSortId) return
                setMobileSorting([{ id: mobileSortId, desc: !mobileSortDesc }])
              }}
              disabled={!mobileSortId}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mobileSortDesc ? 'Z-A' : 'A-Z'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            Loading licenses...
          </div>
        ) : mobileFilteredCount === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            No licenses found.
          </div>
        ) : (
          mobileTable.getRowModel().rows.map((row) => {
            const license = row.original
            return (
              <div key={license.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {license.employee?.fullname || 'Unassigned'}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-500">Position</div>
                    <div className="font-medium text-slate-700 truncate">
                      {license.position?.title || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Branch</div>
                    <div className="font-medium text-slate-700 truncate">
                      {license.branch?.branch_name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">OS</div>
                    <div className="font-medium text-slate-700 truncate">
                      {license.operating_system || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Office</div>
                    <div className="font-medium text-slate-700 truncate">
                      {license.office_tool?.name || license.officeTool?.name || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(license)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    title="Edit license"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(license)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                    title="Delete license"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )
          })
        )}

        {!loading && mobileFilteredCount > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-3 space-y-2">
            <div className="text-xs text-slate-600 text-center">
              Showing {mobileStart} to {mobileEnd} of {mobileFilteredCount} entries
            </div>
            <div className="flex items-center justify-between gap-2">
              <select
                value={mobilePagination.pageSize}
                onChange={(e) => mobileTable.setPageSize(Number(e.target.value))}
                className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => mobileTable.setPageIndex(0)}
                  disabled={!mobileTable.getCanPreviousPage()}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => mobileTable.previousPage()}
                  disabled={!mobileTable.getCanPreviousPage()}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-xs text-slate-700 px-1">
                  {mobilePagination.pageIndex + 1} of {mobileTable.getPageCount()}
                </span>
                <button
                  onClick={() => mobileTable.nextPage()}
                  disabled={!mobileTable.getCanNextPage()}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => mobileTable.setPageIndex(mobileTable.getPageCount() - 1)}
                  disabled={!mobileTable.getCanNextPage()}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="hidden sm:block">
        <DataTable columns={columns} data={licenses} loading={loading} pageSize={10} />
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Software License"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee */}
            <div>
              <SearchableSelect
                options={employees}
                value={formData.employee_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, employee_id: value }))}
                placeholder="Select employee"
                label="Employee"
                displayField="fullname"
              />
            </div>

            {/* Position */}
            <div>
              <SearchableSelect
                options={positions}
                value={formData.position_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, position_id: value }))}
                placeholder="Select position"
                label="Position"
                displayField="title"
              />
            </div>

            {/* Section */}
            <div>
              <SearchableSelect
                options={sections}
                value={formData.section_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, section_id: value }))}
                placeholder="Select section"
                label="Section"
                displayField="name"
              />
            </div>

            {/* Branch */}
            <div>
              <SearchableSelect
                options={branches}
                value={formData.branch_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, branch_id: value }))}
                placeholder="Select branch"
                label="Branch"
                displayField="branch_name"
              />
            </div>

            {/* Asset Category */}
            <div>
              <SearchableSelect
                options={assetCategories}
                value={formData.asset_category_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, asset_category_id: value }))}
                placeholder="Select category"
                label="Asset Category"
                displayField="name"
              />
            </div>

            {/* Operating System */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Operating System
              </label>
              <input
                type="text"
                name="operating_system"
                value={formData.operating_system}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Windows 11 Pro"
              />
            </div>

            {/* Licensed */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                License Key/Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  name="licensed"
                  value={formData.licensed}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                >
                  <option value="">Select license type</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>
            </div>

            {/* Office Tools */}
            <div>
              <SearchableSelect
                options={officeTools}
                value={formData.office_tool_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, office_tool_id: value }))}
                placeholder="Select office tool"
                label="Office Tools"
                displayField="name"
                secondaryField="version"
              />
            </div>

            {/* Client Access */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Client Access
              </label>
              <select
                name="client_access"
                value={formData.client_access}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
              >
                <option value="">Select client access</option>
                <option value="CAL">CAL</option>
                <option value="VPN">VPN</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Additional notes or remarks"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Create License
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Software License"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee */}
            <div>
              <SearchableSelect
                options={employees}
                value={formData.employee_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, employee_id: value }))}
                placeholder="Select employee"
                label="Employee"
                displayField="fullname"
              />
            </div>

            {/* Position */}
            <div>
              <SearchableSelect
                options={positions}
                value={formData.position_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, position_id: value }))}
                placeholder="Select position"
                label="Position"
                displayField="title"
              />
            </div>

            {/* Section */}
            <div>
              <SearchableSelect
                options={sections}
                value={formData.section_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, section_id: value }))}
                placeholder="Select section"
                label="Section"
                displayField="name"
              />
            </div>

            {/* Branch */}
            <div>
              <SearchableSelect
                options={branches}
                value={formData.branch_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, branch_id: value }))}
                placeholder="Select branch"
                label="Branch"
                displayField="branch_name"
              />
            </div>

            {/* Asset Category */}
            <div>
              <SearchableSelect
                options={assetCategories}
                value={formData.asset_category_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, asset_category_id: value }))}
                placeholder="Select category"
                label="Asset Category"
                displayField="name"
              />
            </div>

            {/* Operating System */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Operating System
              </label>
              <input
                type="text"
                name="operating_system"
                value={formData.operating_system}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Windows 11 Pro"
              />
            </div>

            {/* Licensed */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                License Key/Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  name="licensed"
                  value={formData.licensed}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                >
                  <option value="">Select license type</option>
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>
            </div>

            {/* Office Tools */}
            <div>
              <SearchableSelect
                options={officeTools}
                value={formData.office_tool_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, office_tool_id: value }))}
                placeholder="Select office tool"
                label="Office Tools"
                displayField="name"
                secondaryField="version"
              />
            </div>

            {/* Client Access */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Client Access
              </label>
              <select
                name="client_access"
                value={formData.client_access}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
              >
                <option value="">Select client access</option>
                <option value="CAL">CAL</option>
                <option value="VPN">VPN</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Additional notes or remarks"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Update License
            </button>
          </div>
        </form>
      </Modal>
        </div>
      ) : (
        <OfficeToolsTab />
      )}
    </div>
  )
}

export default SoftwareLicensePage
