import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import TicketFilters from '../../components/helpdesk/TicketFilters'
import TicketForm from '../../components/helpdesk/TicketForm'
import { getTicketColumns } from '../../components/helpdesk/ticketColumns'
import {
  fetchTickets,
  fetchTicketEmployees,
  fetchTicketAssignees,
  updateTicket,
  updateTicketStatus,
  assignTicket,
} from '../../services/ticketService'
import { fetchBranchesRequest } from '../../services/branchService'
import { fetchSectionsRequest } from '../../services/sectionService'
import { fetchTicketCategories } from '../../services/ticketCategoryService'
import { useAuth } from '../../context/AuthContext'
import { useHelpdeskRealtime } from '../../hooks/useHelpdeskRealtime'

const INITIAL_FILTERS = {
  search: '',
  status: '',
  priority: '',
  category_id: '',
  assigned_to_user_id: '',
  requester_employee_id: '',
  branch_id: '',
  section_id: '',
  date_from: '',
  date_to: '',
  overdue: false,
  unassigned: false,
}

const INITIAL_FORM = {
  title: '',
  description: '',
  contact_number: '',
  anydesk_number: '',
  category_id: '',
  priority: 'Medium',
  status: 'Open',
  requester_employee_id: '',
  assigned_to_user_id: '',
  due_date: '',
  resolution_summary: '',
}

function normalizeList(raw) {
  if (!raw) return []
  if (Array.isArray(raw?.data?.data)) return raw.data.data
  if (Array.isArray(raw?.data)) return raw.data
  if (Array.isArray(raw)) return raw
  return []
}

function TicketsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)

  // Honor query params on mount (cards + dashboard deep links)
  useEffect(() => {
    const assignee = searchParams.get('assignee')
    const assignedToUserId = searchParams.get('assigned_to_user_id')
    const overdue = searchParams.get('overdue')
    const status = searchParams.get('status')
    const unassigned = searchParams.get('unassigned')
    const requesterId = searchParams.get('requester_employee_id')
    const categoryId = searchParams.get('category_id')
    const priority = searchParams.get('priority')
    const branchId = searchParams.get('branch_id')
    const sectionId = searchParams.get('section_id')

    setFilters((prev) => ({
      ...prev,
      assigned_to_user_id:
        assignee === 'me' && user?.id
          ? String(user.id)
          : assignedToUserId ?? prev.assigned_to_user_id,
      overdue: overdue === '1' ? true : prev.overdue,
      status: status ?? prev.status,
      unassigned: unassigned === '1' ? true : prev.unassigned,
      requester_employee_id: requesterId ?? prev.requester_employee_id,
      category_id: categoryId ?? prev.category_id,
      priority: priority ?? prev.priority,
      branch_id: branchId ?? prev.branch_id,
      section_id: sectionId ?? prev.section_id,
    }))
    if (
      assignee ||
      assignedToUserId ||
      overdue ||
      status ||
      unassigned ||
      requesterId ||
      categoryId ||
      priority ||
      branchId ||
      sectionId
    ) {
      setShowFilters(true)
    }
  }, [searchParams, user?.id])

  // Queries
  const { data: ticketsRaw, isLoading } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const params = { all: true }
      Object.entries(filters).forEach(([key, value]) => {
        if (value === '' || value === false || value === null || value === undefined) return
        params[key] = value === true ? 1 : value
      })
      const res = await fetchTickets(params)
      return res.data
    },
  })

  const { data: employeesRaw } = useQuery({
    queryKey: ['ticket-employees'],
    queryFn: async () => (await fetchTicketEmployees()).data,
    staleTime: 5 * 60 * 1000,
  })

  const { data: assigneesRaw } = useQuery({
    queryKey: ['ticket-assignees'],
    queryFn: async () => (await fetchTicketAssignees()).data,
    staleTime: 5 * 60 * 1000,
  })

  const { data: branchesRaw } = useQuery({
    queryKey: ['ticket-branches'],
    queryFn: async () => (await fetchBranchesRequest()).data,
    staleTime: 5 * 60 * 1000,
  })

  const { data: sectionsRaw } = useQuery({
    queryKey: ['ticket-sections'],
    queryFn: async () => (await fetchSectionsRequest()).data,
    staleTime: 5 * 60 * 1000,
  })

  const { data: categoriesRaw } = useQuery({
    queryKey: ['ticket-categories'],
    queryFn: async () => (await fetchTicketCategories()).data,
    staleTime: 10 * 60 * 1000,
  })

  // Default ordering: most urgent at the top (Urgent → High → Medium → Low).
  // Ties broken by created_at desc so the newest of the same priority wins.
  // Users can still click a column header to override this sort.
  const tickets = useMemo(() => {
    const list = normalizeList(ticketsRaw)
    const rank = { Urgent: 0, High: 1, Medium: 2, Low: 3 }
    return [...list].sort((a, b) => {
      const pa = rank[a.priority] ?? 99
      const pb = rank[b.priority] ?? 99
      if (pa !== pb) return pa - pb
      return new Date(b.created_at) - new Date(a.created_at)
    })
  }, [ticketsRaw])
  const employees = useMemo(() => normalizeList(employeesRaw), [employeesRaw])
  const assignees = useMemo(() => normalizeList(assigneesRaw), [assigneesRaw])
  const branches = useMemo(() => normalizeList(branchesRaw), [branchesRaw])
  const sections = useMemo(() => normalizeList(sectionsRaw), [sectionsRaw])
  const categories = useMemo(() => normalizeList(categoriesRaw), [categoriesRaw])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
    queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTicket(id, data),
    onSuccess: () => {
      invalidate()
      Swal.fire({ icon: 'success', title: 'Ticket updated', timer: 1800, showConfirmButton: false })
      setIsEditOpen(false)
      setSelectedTicket(null)
    },
    onError: (error) => {
      Swal.fire({
        icon: 'error',
        title: 'Failed to update ticket',
        text: error.response?.data?.message || error.message,
      })
    },
  })

  // Apply an updater to every cached tickets list (handles both paginated and all=true shapes)
  const applyOptimisticRowUpdate = (id, patch) => {
    const targetId = Number(id)
    queryClient.setQueriesData({ queryKey: ['tickets'] }, (old) => {
      if (!old?.data) return old
      const updateRow = (r) => (Number(r.id) === targetId ? { ...r, ...patch } : r)
      if (Array.isArray(old.data)) {
        return { ...old, data: old.data.map(updateRow) }
      }
      if (Array.isArray(old.data?.data)) {
        return { ...old, data: { ...old.data, data: old.data.data.map(updateRow) } }
      }
      return old
    })
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status, resolution_summary }) =>
      updateTicketStatus(id, {
        status,
        ...(resolution_summary ? { resolution_summary } : {}),
      }),
    onMutate: async ({ id, status, resolution_summary }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] })
      const previous = queryClient.getQueriesData({ queryKey: ['tickets'] })
      applyOptimisticRowUpdate(id, {
        status,
        ...(resolution_summary ? { resolution_summary } : {}),
      })
      return { previous }
    },
    onSuccess: (res, { id }) => {
      // Sync with authoritative server data (includes resolved_at / closed_at auto-stamps)
      const updated = res?.data?.data
      if (updated) {
        applyOptimisticRowUpdate(id, {
          status: updated.status,
          resolution_summary: updated.resolution_summary,
          resolved_at: updated.resolved_at,
          closed_at: updated.closed_at,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
    },
    onError: (error, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      Swal.fire({
        icon: 'error',
        title: 'Failed to update status',
        text: error.response?.data?.message || error.message,
      })
    },
  })

  const priorityMutation = useMutation({
    mutationFn: ({ id, priority }) => updateTicket(id, { priority }),
    onMutate: async ({ id, priority }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] })
      const previous = queryClient.getQueriesData({ queryKey: ['tickets'] })
      applyOptimisticRowUpdate(id, { priority })
      return { previous }
    },
    onSuccess: (res, { id }) => {
      const updated = res?.data?.data
      if (updated) {
        applyOptimisticRowUpdate(id, { priority: updated.priority })
      }
      queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
    },
    onError: (error, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      Swal.fire({
        icon: 'error',
        title: 'Failed to update priority',
        text: error.response?.data?.message || error.message,
      })
    },
  })

  const dueDateMutation = useMutation({
    mutationFn: ({ id, due_date }) => updateTicket(id, { due_date }),
    onMutate: async ({ id, due_date }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] })
      const previous = queryClient.getQueriesData({ queryKey: ['tickets'] })
      applyOptimisticRowUpdate(id, { due_date })
      return { previous }
    },
    onSuccess: (res, { id }) => {
      const updated = res?.data?.data
      if (updated) {
        applyOptimisticRowUpdate(id, { due_date: updated.due_date })
      }
      queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
    },
    onError: (error, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      Swal.fire({
        icon: 'error',
        title: 'Failed to update due date',
        text: error.response?.data?.message || error.message,
      })
    },
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, userId }) => assignTicket(id, userId),
    onMutate: async ({ id, userId }) => {
      await queryClient.cancelQueries({ queryKey: ['tickets'] })
      const previous = queryClient.getQueriesData({ queryKey: ['tickets'] })
      const assigneeObj = userId
        ? assignees.find((u) => Number(u.id) === Number(userId))
        : null
      applyOptimisticRowUpdate(id, {
        assigned_to_user_id: userId,
        assignedTo: assigneeObj ? { id: assigneeObj.id, name: assigneeObj.name } : null,
      })
      return { previous }
    },
    onSuccess: (res, { id }) => {
      // Sync with authoritative server data — guarantees the assignedTo relation is correct
      const updated = res?.data?.data
      if (updated) {
        applyOptimisticRowUpdate(id, {
          assigned_to_user_id: updated.assigned_to_user_id,
          assignedTo: updated.assignedTo,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
    },
    onError: (error, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      Swal.fire({
        icon: 'error',
        title: 'Failed to update assignee',
        text: error.response?.data?.message || error.message,
      })
    },
  })

  const handleInlineStatusChange = async (ticket, newStatus) => {
    const isResolution = newStatus === 'Resolved' || newStatus === 'Closed'

    if (isResolution) {
      const result = await Swal.fire({
        icon: 'question',
        title: `Mark ticket as ${newStatus}?`,
        text: `Ticket ${ticket.ticket_number}`,
        input: 'textarea',
        inputLabel: 'Resolution summary (optional)',
        inputPlaceholder: 'Describe what was done to resolve this...',
        inputValue: ticket.resolution_summary || '',
        showCancelButton: true,
        confirmButtonText: `Mark ${newStatus}`,
        confirmButtonColor: '#059669',
      })
      if (!result.isConfirmed) return
      const summary = (result.value || '').trim()
      statusMutation.mutate({
        id: ticket.id,
        status: newStatus,
        resolution_summary: summary || null,
      })
      return
    }

    const result = await Swal.fire({
      icon: 'question',
      title: `Change status to ${newStatus}?`,
      text: `Ticket ${ticket.ticket_number} (currently ${ticket.status})`,
      showCancelButton: true,
      confirmButtonText: 'Yes, change',
      confirmButtonColor: '#4f46e5',
    })
    if (!result.isConfirmed) return
    statusMutation.mutate({ id: ticket.id, status: newStatus })
  }

  const handleInlinePriorityChange = async (ticket, newPriority) => {
    if (!newPriority || newPriority === ticket.priority) return

    const result = await Swal.fire({
      icon: 'question',
      title: `Change priority to ${newPriority}?`,
      text: `Ticket ${ticket.ticket_number} (currently ${ticket.priority})`,
      showCancelButton: true,
      confirmButtonText: 'Yes, change',
      confirmButtonColor: '#4f46e5',
    })
    if (!result.isConfirmed) return
    priorityMutation.mutate({ id: ticket.id, priority: newPriority })
  }

  const handleInlineDueDateChange = async (ticket, newDate) => {
    const current = ticket.due_date ? String(ticket.due_date).slice(0, 10) : null
    const next = newDate || null
    if (next === current) return

    const fmt = (v) =>
      v ? new Date(v).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'no due date'

    const result = await Swal.fire({
      icon: 'question',
      title: next ? `Set due date to ${fmt(next)}?` : 'Clear due date?',
      text: current
        ? `${ticket.ticket_number} is currently due ${fmt(current)}.`
        : `${ticket.ticket_number} currently has no due date.`,
      showCancelButton: true,
      confirmButtonText: next ? 'Yes, set' : 'Yes, clear',
      confirmButtonColor: next ? '#4f46e5' : '#dc2626',
    })
    if (!result.isConfirmed) return
    dueDateMutation.mutate({ id: ticket.id, due_date: next })
  }

  const handleInlineAssignChange = async (ticket, newUserId) => {
    const currentName = ticket.assignedTo?.name
    const target = newUserId
      ? assignees.find((u) => Number(u.id) === Number(newUserId))
      : null
    const targetName = target?.name

    let title
    let text
    if (!newUserId) {
      title = 'Unassign this ticket?'
      text = currentName
        ? `${ticket.ticket_number} is currently assigned to ${currentName}.`
        : `${ticket.ticket_number} will remain unassigned.`
    } else if (currentName) {
      title = `Reassign to ${targetName}?`
      text = `${ticket.ticket_number} is currently assigned to ${currentName}.`
    } else {
      title = `Assign to ${targetName}?`
      text = `${ticket.ticket_number} is currently unassigned.`
    }

    const result = await Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: newUserId ? 'Yes, assign' : 'Yes, unassign',
      confirmButtonColor: newUserId ? '#4f46e5' : '#dc2626',
    })
    if (!result.isConfirmed) return
    assignMutation.mutate({ id: ticket.id, userId: newUserId })
  }

  const handleFilterChange = (e) => {
    const { name, type, value, checked } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleClearFilters = () => setFilters(INITIAL_FILTERS)

  const openEditModal = (ticket) => {
    setSelectedTicket(ticket)
    setFormData({
      title: ticket.title || '',
      description: ticket.description || '',
      contact_number: ticket.contact_number || '',
      anydesk_number: ticket.anydesk_number || '',
      category_id: ticket.category_id || ticket.category?.id || '',
      priority: ticket.priority || 'Medium',
      status: ticket.status || 'Open',
      requester_employee_id: ticket.requester_employee_id || '',
      assigned_to_user_id: ticket.assigned_to_user_id || '',
      due_date: ticket.due_date ? String(ticket.due_date).slice(0, 10) : '',
      resolution_summary: ticket.resolution_summary || '',
    })
    setIsEditOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (!selectedTicket) return
    const data = { ...formData }
    if (!data.assigned_to_user_id) data.assigned_to_user_id = null
    if (!data.due_date) data.due_date = null
    updateMutation.mutate({ id: selectedTicket.id, data })
  }

  const columns = useMemo(
    () =>
      getTicketColumns({
        onView: (t) => navigate(`/helpdesk/tickets/${t.id}`),
        onEdit: openEditModal,
        onStatusChange: handleInlineStatusChange,
        onPriorityChange: handleInlinePriorityChange,
        onAssignChange: handleInlineAssignChange,
        onDueDateChange: handleInlineDueDateChange,
        assignees,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, assignees]
  )

  // Realtime: auto-refresh the list when a new ticket arrives (staff OR public).
  const handleTicketCreated = useCallback(
    (payload) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['ticket-statistics'] })
      // Non-intrusive toast in the corner.
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `New ticket ${payload?.ticket_number || ''}`,
        text: payload?.title,
        timer: 3500,
        showConfirmButton: false,
      })
    },
    [queryClient]
  )
  const { connected: rtConnected } = useHelpdeskRealtime({
    onTicketCreated: handleTicketCreated,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-sm text-slate-600">All helpdesk concerns captured from end users.</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            rtConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}
          title={
            rtConnected
              ? 'Connected — new tickets appear automatically.'
              : 'Realtime offline — list refreshes only on navigation.'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              rtConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {rtConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Filters */}
      <TicketFilters
        showFilters={showFilters}
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        onToggle={() => setShowFilters((s) => !s)}
        assignees={assignees}
        branches={branches}
        sections={sections}
        categories={categories}
      />

      {/* Table */}
      <DataTable columns={columns} data={tickets} loading={isLoading} pageSize={10} />

      {/* Edit modal */}
      <Modal
        isOpen={isEditOpen && Boolean(selectedTicket)}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${selectedTicket?.ticket_number || 'Ticket'}`}
        size="xl"
        closeOnOverlayClick={false}
      >
        <TicketForm
          formData={formData}
          employees={employees}
          assignees={assignees}
          categories={categories}
          onChange={handleFormChange}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditOpen(false)}
          isSubmitting={updateMutation.isPending}
          mode="edit"
        />
      </Modal>
    </div>
  )
}

export default TicketsPage
