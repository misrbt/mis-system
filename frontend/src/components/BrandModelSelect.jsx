/**
 * BrandModelSelect Component
 * Reusable brand/model dropdown pair with filtered models and inline add buttons.
 * Used in Equipment page, Asset forms, and Replenishment forms.
 */

import { Plus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '../services/apiClient'
import Swal from 'sweetalert2'
import SearchableSelect from './SearchableSelect'

function BrandModelSelect({
  brandId,
  modelId,
  onBrandChange,
  onModelChange,
  required = false,
  disabled = false,
  layout = 'grid', // 'grid' | 'stacked'
}) {
  const queryClient = useQueryClient()

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await apiClient.get('/brands')
      const data = response.data?.data ?? response.data ?? []
      return Array.isArray(data) ? data : []
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: brandModels = [] } = useQuery({
    queryKey: ['brand-models', brandId],
    queryFn: async () => {
      const response = await apiClient.get(`/brands/${brandId}/models`)
      const data = response.data?.data ?? response.data ?? []
      return Array.isArray(data) ? data : []
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  })

  const handleBrandChange = (value) => {
    const selected = brands.find((b) => String(b.id) === String(value))
    onBrandChange({
      brand_id: value || '',
      brand: selected?.name || '',
    })
    // Reset model when brand changes
    onModelChange({
      equipment_model_id: '',
      model: '',
    })
  }

  const handleModelChange = (value) => {
    const selected = brandModels.find((m) => String(m.id) === String(value))
    onModelChange({
      equipment_model_id: value || '',
      model: selected?.name || '',
    })
  }

  const handleAddNewBrand = async () => {
    const { value: brandName } = await Swal.fire({
      title: 'Add New Brand',
      input: 'text',
      inputLabel: 'Brand Name',
      inputPlaceholder: 'e.g., Dell, HP, Lenovo',
      showCancelButton: true,
      inputValidator: (v) => {
        if (!v?.trim()) return 'Brand name is required'
      },
    })
    if (!brandName) return

    try {
      const response = await apiClient.post('/brands', { name: brandName.trim() })
      if (response.data.success) {
        await queryClient.invalidateQueries({ queryKey: ['brands'] })
        const newBrand = response.data.data
        onBrandChange({ brand_id: newBrand.id, brand: newBrand.name })
        onModelChange({ equipment_model_id: '', model: '' })
        Swal.fire({ icon: 'success', title: 'Brand added', timer: 1500, showConfirmButton: false })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add brand',
      })
    }
  }

  const handleAddNewModel = async () => {
    if (!brandId) {
      Swal.fire({ icon: 'warning', title: 'Select a brand first' })
      return
    }
    const selectedBrand = brands.find((b) => String(b.id) === String(brandId))
    const { value: modelName } = await Swal.fire({
      title: 'Add New Model',
      input: 'text',
      inputLabel: `Model name for ${selectedBrand?.name || 'selected brand'}`,
      inputPlaceholder: 'e.g., Latitude 5420',
      showCancelButton: true,
      inputValidator: (v) => {
        if (!v?.trim()) return 'Model name is required'
      },
    })
    if (!modelName) return

    try {
      const response = await apiClient.post(`/brands/${brandId}/models`, { name: modelName.trim() })
      if (response.data.success) {
        await queryClient.invalidateQueries({ queryKey: ['brand-models', brandId] })
        const newModel = response.data.data
        onModelChange({ equipment_model_id: newModel.id, model: newModel.name })
        Swal.fire({ icon: 'success', title: 'Model added', timer: 1500, showConfirmButton: false })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add model',
      })
    }
  }

  // Build options for SearchableSelect
  const brandSelectOptions = brands.map((b) => ({ id: b.id, name: b.name }))
  const modelSelectOptions = brandModels.map((m) => ({ id: m.id, name: m.name }))

  const wrapperClass = layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'

  return (
    <div className={wrapperClass}>
      <div>
        <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Brand{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchableSelect
              label=""
              options={brandSelectOptions}
              value={brandId ? Number(brandId) : ''}
              onChange={(value) => handleBrandChange(value)}
              displayField="name"
              placeholder="Select brand..."
              emptyMessage="No brands found"
              required={required}
            />
          </div>
          <button
            type="button"
            onClick={handleAddNewBrand}
            disabled={disabled}
            className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed self-start mt-0"
            title="Add new brand"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm sm:text-base font-medium text-slate-700 mb-2">Model{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchableSelect
              label=""
              options={modelSelectOptions}
              value={modelId ? Number(modelId) : ''}
              onChange={(value) => handleModelChange(value)}
              displayField="name"
              placeholder={brandId ? 'Select model...' : 'Select brand first'}
              emptyMessage={brandId ? 'No models found — click + to add' : 'Select brand first'}
              required={required}
            />
          </div>
          <button
            type="button"
            onClick={handleAddNewModel}
            disabled={disabled || !brandId}
            className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed self-start mt-0"
            title="Add new model"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default BrandModelSelect
