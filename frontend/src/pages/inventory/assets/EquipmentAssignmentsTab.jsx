import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Users, Building2, Briefcase } from 'lucide-react'
import apiClient from '../../../services/apiClient'
import equipmentService from '../../../services/equipmentService'
import Swal from 'sweetalert2'

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

function EquipmentAssignmentsTab() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [assignmentsData, setAssignmentsData] = useState(null)
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false)

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/asset-categories')
      return normalizeArrayResponse(response.data)
    },
  })

  // Fetch subcategories based on selected category
  const { data: subcategories } = useQuery({
    queryKey: ['filter-subcategories', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return []
      const response = await apiClient.get(`/asset-categories/${selectedCategory}/subcategories`)
      return normalizeArrayResponse(response.data)
    },
    enabled: !!selectedCategory,
  })

  // Fetch equipment based on filters
  const { data: equipmentList } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const response = await apiClient.get('/equipment')
      return normalizeArrayResponse(response.data)
    },
  })

  // Filter equipment based on category, subcategory, and search query
  const filteredEquipment = useMemo(() => {
    if (!equipmentList) return []
    
    let filtered = equipmentList

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(eq => eq.asset_category_id == selectedCategory)
    }

    // Apply subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter(eq => eq.subcategory_id == selectedSubcategory)
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(eq => {
        const brand = (eq.brand || '').toLowerCase()
        const model = (eq.model || '').toLowerCase()
        const categoryName = (eq.category?.name || '').toLowerCase()
        const subcategoryName = (eq.subcategory?.name || '').toLowerCase()
        
        return brand.includes(query) || 
               model.includes(query) || 
               categoryName.includes(query) ||
               subcategoryName.includes(query)
      })
    }

    return filtered
  }, [equipmentList, selectedCategory, selectedSubcategory, searchQuery])

  // Fetch assignments when equipment is selected
  const fetchAssignments = useCallback(async (equipmentId) => {
    if (!equipmentId) {
      setAssignmentsData(null)
      return
    }

    try {
      setIsLoadingAssignments(true)
      const response = await equipmentService.getAssignments(equipmentId)
      if (response.data.success) {
        setAssignmentsData(response.data.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch assignments',
      })
      setAssignmentsData(null)
    } finally {
      setIsLoadingAssignments(false)
    }
  }, [])

  useEffect(() => {
    if (selectedEquipment) {
      fetchAssignments(selectedEquipment)
    }
  }, [selectedEquipment, fetchAssignments])

  // Reset subcategory when category changes
  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value)
    setSelectedSubcategory('')
    setSelectedEquipment('')
    setAssignmentsData(null)
  }, [])

  // Reset equipment when subcategory changes
  const handleSubcategoryChange = useCallback((value) => {
    setSelectedSubcategory(value)
    setSelectedEquipment('')
    setAssignmentsData(null)
  }, [])

  // Handle equipment selection
  const handleEquipmentChange = useCallback((value) => {
    setSelectedEquipment(value)
  }, [])

  // Handle search query change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
    // Reset selection when searching
    setSelectedEquipment('')
    setAssignmentsData(null)
  }, [])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedCategory('')
    setSelectedSubcategory('')
    setSelectedEquipment('')
    setSearchQuery('')
    setAssignmentsData(null)
  }, [])

  const assignments = assignmentsData?.assignments || []
  const equipment = assignmentsData?.equipment

  return (
    <div className="space-y-6">
      {/* Search & Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Search Equipment</h2>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Quick Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by brand, model, or category (e.g., Epson L3210)..."
              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subcategory
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              disabled={!selectedCategory || (subcategories?.length === 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">All subcategories</option>
              {subcategories?.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="sm:col-span-2 lg:col-span-2 flex items-end">
            <div className="flex items-center gap-3 w-full">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{filteredEquipment.length}</span> equipment found
              </div>
              {(selectedCategory || selectedSubcategory || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      {filteredEquipment.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Select Equipment</h3>
            <p className="text-sm text-slate-600 mt-1">Click on any equipment to view assignments</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredEquipment.map((eq) => (
                <button
                  key={eq.id}
                  onClick={() => handleEquipmentChange(eq.id.toString())}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedEquipment === eq.id.toString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-slate-900 mb-1">
                    {eq.brand} {eq.model}
                  </div>
                  <div className="text-xs text-slate-500">
                    {eq.category?.name}
                    {eq.subcategory && ` / ${eq.subcategory.name}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Equipment Details & Assignments */}
      {selectedEquipment && (
        <div className="space-y-4">
          {/* Equipment Info */}
          {equipment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {equipment.brand} {equipment.model}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-blue-700">
                <div>
                  <span className="font-medium">Category:</span> {equipment.category?.name || 'N/A'}
                </div>
                {equipment.subcategory && (
                  <div>
                    <span className="font-medium">Subcategory:</span> {equipment.subcategory.name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignments Display */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Employee Assignments</h3>
                </div>
                <span className="text-sm text-slate-500">
                  {assignments.length} {assignments.length === 1 ? 'assignment' : 'assignments'}
                </span>
              </div>
            </div>

            <div className="p-4">
              {isLoadingAssignments ? (
                <div className="text-center py-8 text-slate-500">
                  Loading assignments...
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No employees are currently assigned to this equipment.
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Employee</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Branch</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Position</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Asset Serial</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assignments.map((assignment, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-900">{assignment.employee_name || 'N/A'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-slate-700">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span>{assignment.branch_name || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-slate-700">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                <span>{assignment.position || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <code className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                                {assignment.serial_number || 'N/A'}
                              </code>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {assignment.status_name || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3">
                    {assignments.map((assignment, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="font-semibold text-slate-900 mb-3">{assignment.employee_name || 'N/A'}</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">Branch:</span>
                            <span>{assignment.branch_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">Position:</span>
                            <span>{assignment.position || 'N/A'}</span>
                          </div>
                          <div className="flex items-start gap-2 text-slate-700">
                            <span className="font-medium">Serial:</span>
                            <code className="px-2 py-1 bg-white text-slate-700 rounded text-xs border border-slate-200">
                              {assignment.serial_number || 'N/A'}
                            </code>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700">
                            <span className="font-medium">Status:</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {assignment.status_name || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedEquipment && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Select Equipment</h3>
          <p className="text-slate-500">
            Choose a category, subcategory, and equipment to view employee assignments
          </p>
        </div>
      )}
    </div>
  )
}

export default EquipmentAssignmentsTab
