import { useState } from 'react'
import PropTypes from 'prop-types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Clock, Send } from 'lucide-react'
import Modal from '../Modal'
import { fetchRepairRemarks, addRepairRemark } from '../../services/repairRemarkService'
import Swal from 'sweetalert2'

function RemarksModal({ isOpen, onClose, repair }) {
  const queryClient = useQueryClient()
  const [newRemark, setNewRemark] = useState('')
  const [remarkType, setRemarkType] = useState('general')

  const { data: remarksData, isLoading } = useQuery({
    queryKey: ['repair-remarks', repair?.id],
    queryFn: async () => {
      if (!repair?.id) return { data: [] }
      const response = await fetchRepairRemarks(repair.id)
      return response.data
    },
    enabled: isOpen && !!repair?.id,
  })

  const addRemarkMutation = useMutation({
    mutationFn: (data) => addRepairRemark(repair.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['repair-remarks', repair.id])
      setNewRemark('')
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Remark added successfully',
        timer: 2000,
      })
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to add remark',
      })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newRemark.trim()) return

    addRemarkMutation.mutate({
      remark: newRemark,
      remark_type: remarkType,
    })
  }

  const remarks = remarksData?.data || []

  const getRemarkTypeColor = (type) => {
    const colors = {
      general: 'bg-slate-100 text-slate-700',
      status_change: 'bg-blue-100 text-blue-700',
      pending_reason: 'bg-yellow-100 text-yellow-700',
    }
    return colors[type] || colors.general
  }

  const getRemarkTypeLabel = (type) => {
    const labels = {
      general: 'General',
      status_change: 'Status Change',
      pending_reason: 'Pending Reason',
    }
    return labels[type] || 'General'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Remarks History - ${repair?.asset?.asset_name || ''}`} size="lg">
      <div className="space-y-4">
        {/* Repair Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Status: <span className="font-semibold">{repair?.status}</span>
              </p>
              <p className="text-xs text-blue-700 mt-0.5">Track the history and add comments about this repair</p>
            </div>
          </div>
        </div>

        {/* Add New Remark Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Add New Remark</label>
              <textarea
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter your remark or comment..."
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={addRemarkMutation.isPending}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                <select
                  value={remarkType}
                  onChange={(e) => setRemarkType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={addRemarkMutation.isPending}
                >
                  <option value="general">General Comment</option>
                  <option value="status_change">Status Change Note</option>
                  <option value="pending_reason">Pending Reason</option>
                </select>
              </div>
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={!newRemark.trim() || addRemarkMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  {addRemarkMutation.isPending ? 'Adding...' : 'Add Remark'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Remarks History */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Remarks Timeline ({remarks.length})
          </h3>

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
              <p className="mt-2 text-sm">Loading remarks...</p>
            </div>
          ) : remarks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No remarks yet</p>
              <p className="text-xs mt-1">Add your first remark above</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {remarks.map((remark) => (
                <div
                  key={remark.id}
                  className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{formatDate(remark.created_at)}</span>
                    <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded ${getRemarkTypeColor(remark.remark_type)}`}>
                      {getRemarkTypeLabel(remark.remark_type)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{remark.remark}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

RemarksModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  repair: PropTypes.object,
}

export default RemarksModal
