import { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, ArrowRight, AlertTriangle } from 'lucide-react'
import Swal from 'sweetalert2'
import Modal from '../Modal'
import SearchableSelect from '../SearchableSelect'
import { branchTransitionRequest } from '../../services/employeeService'

function BranchTransitionModal({ isOpen, onClose, employees = [], branches = [] }) {
  const [rows, setRows] = useState([])
  const [remarks, setRemarks] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload) => branchTransitionRequest(payload),
    onSuccess: (response) => {
      const data = response.data?.data || {}
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      onClose()
      resetForm()
      Swal.fire({
        icon: 'success',
        title: 'Branch Transition Complete',
        html: `<p>${data.employees?.length || 0} employees moved</p><p>${data.assets_reassigned || 0} assets reassigned</p>`,
        timer: 3000,
      })
    },
    onError: (error) => {
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join('<br>')
        : error.response?.data?.message || 'Failed to execute branch transition'
      Swal.fire({ icon: 'error', title: 'Error', html: msg })
    },
  })

  const resetForm = () => {
    setRows([])
    setRemarks('')
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  // Employees already added to the transition list
  const selectedEmployeeIds = useMemo(() => rows.map((r) => r.employee_id), [rows])

  // Branches already targeted
  const selectedBranchIds = useMemo(() => rows.map((r) => r.to_branch_id).filter(Boolean), [rows])

  // Available employees (not yet selected)
  const availableEmployees = useMemo(
    () =>
      employees
        .filter((e) => !selectedEmployeeIds.includes(e.id))
        .map((e) => ({
          ...e,
          displayName: e.fullname,
          branchName: e.branch?.branch_name || 'No Branch',
        })),
    [employees, selectedEmployeeIds]
  )

  // For each row, get available branches (not already targeted by another row, and not the employee's current branch)
  const getAvailableBranches = (rowIndex) => {
    const row = rows[rowIndex]
    const employee = employees.find((e) => e.id === row?.employee_id)
    const otherTargetBranches = rows
      .filter((_, i) => i !== rowIndex)
      .map((r) => r.to_branch_id)
      .filter(Boolean)

    return branches.filter(
      (b) =>
        !otherTargetBranches.includes(b.id) &&
        (!employee || b.id !== employee.branch_id)
    )
  }

  const addRow = () => {
    setRows((prev) => [...prev, { employee_id: null, to_branch_id: null }])
  }

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const updateRow = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row
        if (field === 'employee_id') {
          // Reset branch when employee changes
          return { ...row, employee_id: value, to_branch_id: null }
        }
        return { ...row, [field]: value }
      })
    )
  }

  // Build preview data: for each row, show which assets they'll inherit at the new branch
  const previewData = useMemo(() => {
    const selectedEmployeeIds = rows.map((r) => r.employee_id).filter(Boolean)

    return rows
      .filter((r) => r.employee_id && r.to_branch_id)
      .map((row) => {
        const employee = employees.find((e) => e.id === row.employee_id)
        const toBranch = branches.find((b) => b.id === row.to_branch_id)
        const fromBranch = employee?.branch

        // Find the employee currently at the destination branch with the same position
        const currentOccupant = employees.find(
          (e) =>
            e.id !== row.employee_id &&
            e.branch_id === row.to_branch_id &&
            e.position_id === employee?.position_id
        )

        // Check if this is a valid swap (occupant is also transitioning)
        const isSwap = currentOccupant && selectedEmployeeIds.includes(currentOccupant.id)
        const isVacant = !currentOccupant
        const isBlocked = currentOccupant && !isSwap

        // Assets that the incoming employee will inherit
        const inheritedAssets = isSwap ? (currentOccupant?.assigned_assets || []) : []

        // Assets the employee is leaving behind
        const leavingAssets = employee?.assigned_assets || []

        return {
          employee,
          fromBranch,
          toBranch,
          inheritedAssets,
          leavingAssets,
          currentOccupant,
          isSwap,
          isVacant,
          isBlocked,
        }
      })
  }, [rows, employees, branches])

  // Warnings and errors
  const { warnings, errors } = useMemo(() => {
    const msgs = []
    const errs = []

    // Check for blocked positions (occupied by someone not in the transition)
    previewData.forEach((item) => {
      if (item.isBlocked) {
        errs.push(
          `${item.employee?.fullname} cannot go to ${item.toBranch?.branch_name} - position "${item.employee?.position?.title}" is occupied by ${item.currentOccupant?.fullname} who is not part of this transition.`
        )
      }
    })

    // Check for branches losing employees with no incoming replacement
    const fromBranches = rows
      .filter((r) => r.employee_id)
      .map((r) => employees.find((e) => e.id === r.employee_id)?.branch_id)
      .filter(Boolean)

    const toBranches = rows.map((r) => r.to_branch_id).filter(Boolean)

    fromBranches.forEach((branchId) => {
      if (!toBranches.includes(branchId)) {
        const branch = branches.find((b) => b.id === branchId)
        if (branch) {
          msgs.push(
            `${branch.branch_name} will lose an employee but no one is incoming. Assets will remain assigned to the departing employee.`
          )
        }
      }
    })

    return { warnings: msgs, errors: errs }
  }, [rows, employees, branches, previewData])

  const isValid = rows.length >= 2 && rows.every((r) => r.employee_id && r.to_branch_id) && errors.length === 0

  const handleSubmit = () => {
    if (!isValid) return

    Swal.fire({
      title: 'Confirm Branch Transition',
      html: `<p>This will move <strong>${rows.length}</strong> employees to new branches and reassign their workstation assets.</p><p>This action cannot be undone.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Execute Transition',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        mutation.mutate({
          transitions: rows.map((r) => ({
            employee_id: r.employee_id,
            to_branch_id: r.to_branch_id,
          })),
          remarks: remarks || null,
        })
      }
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Branch Transition"
      size="xl"
    >
      <div className="space-y-6">
        {/* Description */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-sm text-teal-800">
          <p className="font-medium mb-1">Employee Branch Rotation</p>
          <p>
            Move employees between branches. Assets/workstations stay at their current branch and
            are reassigned to the incoming employee.
          </p>
        </div>

        {/* Transition Rows */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Transitions</h3>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Employee
            </button>
          </div>

          {rows.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
              Click "Add Employee" to start building the transition.
              <br />
              At least 2 employees are required.
            </div>
          )}

          {rows.map((row, index) => {
            const employee = employees.find((e) => e.id === row.employee_id)
            const availBranches = getAvailableBranches(index)

            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex-1 min-w-0">
                  <SearchableSelect
                    label="Employee"
                    options={[
                      ...availableEmployees,
                      ...(employee && !availableEmployees.find((e) => e.id === employee.id)
                        ? [{ ...employee, displayName: employee.fullname, branchName: employee.branch?.branch_name || 'No Branch' }]
                        : []),
                    ]}
                    value={row.employee_id}
                    onChange={(val) => updateRow(index, 'employee_id', val || null)}
                    displayField="displayName"
                    secondaryField="branchName"
                    placeholder="Select employee..."
                    required
                  />
                </div>

                <div className="flex items-center pt-8">
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={row.to_branch_id || ''}
                    onChange={(e) =>
                      updateRow(index, 'to_branch_id', e.target.value ? parseInt(e.target.value) : null)
                    }
                    disabled={!row.employee_id}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select branch...</option>
                    {availBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branch_name}
                      </option>
                    ))}
                  </select>
                  {employee && (
                    <p className="text-xs text-slate-500 mt-1">
                      Currently at: {employee.branch?.branch_name || 'No Branch'}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="mt-8 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-800">Invalid Transition</p>
                {errors.map((error, i) => (
                  <p key={i} className="text-sm text-red-700">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {warnings.map((warning, i) => (
                  <p key={i} className="text-sm text-amber-800">
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Preview</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">Employee</th>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">From</th>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">To</th>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">
                      Assets Leaving
                    </th>
                    <th className="px-4 py-2.5 text-left font-medium text-slate-600">
                      Assets Inheriting
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewData.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-900">
                        {item.employee?.fullname}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {item.fromBranch?.branch_name || 'N/A'}
                      </td>
                      <td className="px-4 py-2.5 text-teal-700 font-medium">
                        {item.toBranch?.branch_name || 'N/A'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {item.leavingAssets.length > 0 ? (
                          <span title={item.leavingAssets.map((a) => a.asset_name).join(', ')}>
                            {item.leavingAssets.length} asset{item.leavingAssets.length !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {item.inheritedAssets.length > 0 ? (
                          <span
                            title={item.inheritedAssets.map((a) => a.asset_name).join(', ')}
                          >
                            {item.inheritedAssets.length} asset{item.inheritedAssets.length !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Remarks <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g., Monthly cashier rotation for March 2026"
            rows={2}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || mutation.isPending}
            className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Processing...' : 'Execute Transition'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default BranchTransitionModal
