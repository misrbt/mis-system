<?php

namespace App\Http\Controllers;

use App\Http\Requests\Ticket\StoreTicketRemarkRequest;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketRequest;
use App\Mail\TicketEscalationMail;
use App\Models\Ticket;
use App\Models\TicketApprover;
use App\Models\TicketAttachment;
use App\Models\TicketFormField;
use App\Models\TicketRemark;
use App\Services\HelpdeskAuditLogService;
use App\Services\RealtimeService;
use App\Traits\ValidatesSort;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    use ValidatesSort;

    /**
     * List tickets with filters, sorting, and optional pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Ticket::query()
                ->visibleToStaff()
                ->with([
                    'category',
                    'requester.branch',
                    'requester.obo',
                    'requester.department',
                    'requester.position',
                    'assignedTo',
                    'createdBy',
                ])->withCount('remarks', 'attachments');

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('ticket_number', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('requester', function ($req) use ($search) {
                            $req->where('fullname', 'like', "%{$search}%");
                        });
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            if ($request->filled('priority')) {
                $query->where('priority', $request->input('priority'));
            }

            if ($request->filled('category_id')) {
                $query->where('category_id', $request->input('category_id'));
            }

            if ($request->filled('assigned_to_user_id')) {
                $query->where('assigned_to_user_id', $request->input('assigned_to_user_id'));
            }

            if ($request->filled('requester_employee_id')) {
                $query->where('requester_employee_id', $request->input('requester_employee_id'));
            }

            // Org-hierarchy filters — traverse requester employee relationship
            if ($request->filled('branch_id')) {
                $branchId = $request->input('branch_id');
                $query->whereHas('requester', function ($req) use ($branchId) {
                    $req->where('branch_id', $branchId);
                });
            }

            if ($request->filled('obo_id')) {
                $oboId = $request->input('obo_id');
                $query->whereHas('requester', function ($req) use ($oboId) {
                    $req->where('obo_id', $oboId);
                });
            }

            if ($request->filled('section_id')) {
                $sectionId = $request->input('section_id');
                $query->whereHas('requester', function ($req) use ($sectionId) {
                    $req->where('department_id', $sectionId);
                });
            }

            if ($request->filled('position_id')) {
                $positionId = $request->input('position_id');
                $query->whereHas('requester', function ($req) use ($positionId) {
                    $req->where('position_id', $positionId);
                });
            }

            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->input('date_from'));
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->input('date_to'));
            }

            if ($request->boolean('overdue')) {
                $query->overdue();
            }

            if ($request->boolean('unassigned')) {
                $query->whereNull('assigned_to_user_id');
            }

            $allowedSortFields = [
                'id',
                'ticket_number',
                'title',
                'status',
                'priority',
                'category_id',
                'due_date',
                'resolved_at',
                'created_at',
                'updated_at',
            ];

            [$sortBy, $sortOrder] = $this->validateSort(
                $request->get('sort_by', 'created_at'),
                $request->get('sort_order', 'desc'),
                $allowedSortFields
            );

            $query->orderBy($sortBy, $sortOrder);

            if ($request->boolean('all', false)) {
                return response()->json([
                    'success' => true,
                    'data' => $query->get(),
                ], 200);
            }

            $perPage = (int) $request->input('per_page', 50);
            $tickets = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $tickets,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch tickets');
        }
    }

    /**
     * Create a new ticket (with optional file attachments).
     */
    public function store(StoreTicketRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['created_by_user_id'] = Auth::id();
            $data['status'] = $data['status'] ?? 'Open';

            $rawCustom = $request->input('custom_fields');
            if (is_string($rawCustom)) {
                $rawCustom = json_decode($rawCustom, true);
            }
            $customResult = TicketFormField::validateSubmission(
                is_array($rawCustom) ? $rawCustom : [],
                isset($data['category_id']) ? (int) $data['category_id'] : null,
            );
            if (! empty($customResult['errors'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $customResult['errors'],
                ], 422);
            }
            $data['custom_fields'] = $customResult['values'] ?: null;

            $ticket = Ticket::create($data);

            if ($request->hasFile('attachments')) {
                $this->storeAttachments($ticket, $request->file('attachments'));
            }

            $ticket->load([
                'category',
                'requester.branch',
                'requester.obo',
                'requester.department',
                'requester.position',
                'assignedTo',
                'createdBy',
                'attachments',
            ]);

            // Realtime: push onto the global helpdesk room so any admin on
            // /helpdesk/tickets or the dashboard sees the new ticket without
            // a refresh. Best-effort — RealtimeService swallows failures.
            RealtimeService::emit(
                RealtimeService::helpdeskRoom(),
                'ticket.created',
                [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'title' => $ticket->title,
                    'priority' => $ticket->priority,
                    'status' => $ticket->status,
                    'requester_name' => $ticket->requester?->fullname,
                    'branch_name' => $ticket->requester?->branch?->branch_name,
                    'created_at' => $ticket->created_at,
                    'source' => 'staff',
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Ticket created successfully',
                'data' => $ticket,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create ticket');
        }
    }

    /**
     * Show a single ticket with its timeline & attachments.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $ticket = Ticket::with([
                'category',
                'requester.branch',
                'requester.obo',
                'requester.department',
                'requester.position',
                'assignedTo',
                'createdBy',
                'escalatedBy:id,name',
                'remarks.user',
                'remarks.employee',
                'remarks.attachments',
                'attachments' => function ($q) {
                    $q->whereNull('ticket_remark_id');
                },
                'attachments.uploadedBy',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $ticket,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Ticket not found', 404);
        }
    }

    /**
     * Update a ticket.
     */
    public function update(UpdateTicketRequest $request, string $id): JsonResponse
    {
        try {
            $ticket = Ticket::findOrFail($id);
            $ticket->update($request->validated());
            $ticket->load([
                'category',
                'requester.branch',
                'requester.obo',
                'requester.department',
                'requester.position',
                'assignedTo',
                'createdBy',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket updated successfully',
                'data' => $ticket,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update ticket');
        }
    }

    /**
     * Soft-delete a ticket.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $ticket = Ticket::findOrFail($id);
            $ticket->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ticket deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete ticket');
        }
    }

    /**
     * PATCH status transition (also allows a remark).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Open,In Progress,Pending,Resolved,Closed,Cancelled',
            'resolution_summary' => 'nullable|string',
            'remark' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $ticket = Ticket::findOrFail($id);
            $ticket->status = $request->input('status');

            if ($request->filled('resolution_summary')) {
                $ticket->resolution_summary = $request->input('resolution_summary');
            }

            $ticket->save();

            if ($request->filled('remark')) {
                TicketRemark::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => Auth::id(),
                    'remark' => $request->input('remark'),
                    'remark_type' => 'general',
                ]);
            }

            $ticket->load(['requester.branch', 'assignedTo', 'createdBy', 'remarks.user', 'remarks.employee']);

            return response()->json([
                'success' => true,
                'message' => 'Ticket status updated',
                'data' => $ticket,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update ticket status');
        }
    }

    /**
     * PATCH assignee (set or clear assigned_to_user_id).
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'assigned_to_user_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $ticket = Ticket::findOrFail($id);
            $ticket->assigned_to_user_id = $request->input('assigned_to_user_id');
            $ticket->save();

            $ticket->load(['assignedTo']);

            return response()->json([
                'success' => true,
                'message' => 'Assignment updated',
                'data' => $ticket,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update assignment');
        }
    }

    /**
     * List remarks for a ticket.
     */
    public function getRemarks(string $id): JsonResponse
    {
        try {
            $ticket = Ticket::findOrFail($id);
            $remarks = $ticket->remarks()
                ->with(['user:id,name', 'employee:id,fullname', 'attachments'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $remarks,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch remarks', 404);
        }
    }

    /**
     * Add a remark to a ticket.
     */
    public function addRemark(StoreTicketRemarkRequest $request, string $id): JsonResponse
    {
        try {
            $ticket = Ticket::findOrFail($id);

            $hasText = trim((string) $request->input('remark')) !== '';
            $isInternal = (bool) $request->boolean('is_internal');
            $remarkType = $request->input('remark_type', 'general');

            $remark = TicketRemark::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'remark' => $hasText ? $request->input('remark') : '(attachment)',
                'remark_type' => $remarkType,
                'is_internal' => $isInternal,
            ]);

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
                    $path = $file->storeAs('ticket-attachments/'.$ticket->id, $filename, 'public');

                    $attachment = TicketAttachment::create([
                        'ticket_id' => $ticket->id,
                        'ticket_remark_id' => $remark->id,
                        'uploaded_by_user_id' => Auth::id(),
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                        'size' => $file->getSize() ?? 0,
                    ]);

                    HelpdeskAuditLogService::logAttachmentUploaded(
                        $ticket,
                        $attachment,
                        'user',
                        Auth::id(),
                        Auth::user()?->name,
                    );
                }
            }

            // SLA: stamp first_response_at when an IT user posts a non-internal
            // general reply for the first time.
            if (
                Auth::id()
                && ! $isInternal
                && $remarkType === 'general'
                && ! $ticket->first_response_at
            ) {
                $ticket->first_response_at = now();
                $ticket->saveQuietly();
            }

            HelpdeskAuditLogService::logRemarkAdded(
                $ticket,
                $remark,
                'user',
                Auth::id(),
                Auth::user()?->name,
            );

            $remark->load(['user', 'employee', 'attachments']);

            // Realtime: only broadcast non-internal remarks so the public
            // requester never sees staff-only notes.
            if (! $isInternal) {
                RealtimeService::emit(
                    RealtimeService::ticketRoom($ticket->ticket_number),
                    'remark.created',
                    [
                        'id' => $remark->id,
                        'remark' => $remark->remark,
                        'remark_type' => $remark->remark_type,
                        'is_internal' => false,
                        'author_type' => $remark->user_id ? 'mis' : ($remark->employee_id ? 'employee' : 'system'),
                        'author_name' => $remark->user?->name ?? $remark->employee?->fullname,
                        'created_at' => $remark->created_at,
                        'attachments' => $remark->attachments,
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Remark added',
                'data' => $remark,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to add remark');
        }
    }

    /**
     * Upload one or more attachments to an existing ticket.
     */
    public function uploadAttachment(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'attachments' => 'required|array|min:1|max:10',
            'attachments.*' => 'file|mimes:jpeg,jpg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt,log,zip|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $ticket = Ticket::findOrFail($id);
            $attachments = $this->storeAttachments($ticket, $request->file('attachments'));

            foreach ($attachments as $attachment) {
                HelpdeskAuditLogService::logAttachmentUploaded(
                    $ticket,
                    $attachment,
                    'user',
                    Auth::id(),
                    Auth::user()?->name,
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Attachments uploaded',
                'data' => $attachments,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to upload attachments');
        }
    }

    /**
     * Delete an attachment from a ticket.
     */
    public function deleteAttachment(string $id, string $attachmentId): JsonResponse
    {
        try {
            $attachment = TicketAttachment::where('ticket_id', $id)
                ->where('id', $attachmentId)
                ->firstOrFail();

            $ticket = Ticket::findOrFail($id);

            // Snapshot before delete so the audit row has the real filename/size.
            HelpdeskAuditLogService::logAttachmentDeleted($ticket, $attachment);

            if ($attachment->file_path && Storage::disk('public')->exists($attachment->file_path)) {
                Storage::disk('public')->delete($attachment->file_path);
            }

            $attachment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Attachment deleted',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete attachment');
        }
    }

    /**
     * Preview the list of active global approvers who would receive the
     * escalation email for this ticket. Used by the "Forward to President"
     * confirmation dialog so MIS can see exactly who will be notified.
     */
    public function escalationPreview(string $id): JsonResponse
    {
        try {
            $ticket = Ticket::findOrFail($id);

            $globals = TicketApprover::query()
                ->active()
                ->global()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'email']);

            return response()->json([
                'success' => true,
                'data' => [
                    'ticket' => [
                        'id' => $ticket->id,
                        'ticket_number' => $ticket->ticket_number,
                        'priority' => $ticket->priority,
                        'escalated_at' => $ticket->escalated_at,
                    ],
                    'recipients' => $globals,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to load escalation preview');
        }
    }

    /**
     * Forward the ticket to all active global approvers (President, C-suite).
     * This is a MIS-triggered action — only available on High/Urgent tickets
     * that have landed in the staff queue. One-time per ticket.
     */
    public function escalate(Request $request, string $id): JsonResponse
    {
        try {
            $ticket = Ticket::with(['requester.branch', 'category'])->findOrFail($id);

            if (! in_array($ticket->priority, ['High', 'Urgent'], true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only High or Urgent priority tickets can be escalated to executive review.',
                ], 422);
            }

            if ($ticket->escalated_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'This ticket has already been escalated.',
                ], 422);
            }

            $globals = TicketApprover::query()
                ->active()
                ->global()
                ->get();

            if ($globals->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No global approver is configured. Add a President/executive approver in Helpdesk → Approvers before forwarding.',
                ], 422);
            }

            $recipients = $globals->pluck('email')->filter()->unique()->values()->all();

            try {
                Mail::to($recipients)->send(new TicketEscalationMail($ticket, Auth::user()));
            } catch (\Throwable $mailError) {
                Log::warning('Escalation email send failed', [
                    'ticket_id' => $ticket->id,
                    'to' => $recipients,
                    'error' => $mailError->getMessage(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Could not send the escalation email. Please try again or contact MIS.',
                ], 500);
            }

            $ticket->escalated_at = now();
            $ticket->escalated_by_user_id = Auth::id();
            $ticket->save();

            HelpdeskAuditLogService::logTicketEscalated($ticket, $recipients);

            $ticket->load('escalatedBy:id,name');

            return response()->json([
                'success' => true,
                'message' => 'Ticket forwarded to '.count($recipients).' executive approver(s).',
                'data' => [
                    'escalated_at' => $ticket->escalated_at,
                    'escalated_by' => $ticket->escalatedBy?->only(['id', 'name']),
                    'recipients' => $recipients,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to escalate ticket');
        }
    }

    /**
     * Stats for dashboard cards.
     */
    public function statistics(): JsonResponse
    {
        try {
            $byStatus = Ticket::query()
                ->visibleToStaff()
                ->selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');

            $byPriority = Ticket::query()
                ->visibleToStaff()
                ->selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority');

            $stats = [
                'total' => Ticket::query()->visibleToStaff()->count(),
                'open' => (int) ($byStatus['Open'] ?? 0),
                'in_progress' => (int) ($byStatus['In Progress'] ?? 0),
                'pending' => (int) ($byStatus['Pending'] ?? 0),
                'resolved' => (int) ($byStatus['Resolved'] ?? 0),
                'closed' => (int) ($byStatus['Closed'] ?? 0),
                'cancelled' => (int) ($byStatus['Cancelled'] ?? 0),
                'overdue' => Ticket::query()->visibleToStaff()->overdue()->count(),
                'unassigned' => Ticket::query()->visibleToStaff()->whereNull('assigned_to_user_id')->active()->count(),
                'by_priority' => [
                    'Low' => (int) ($byPriority['Low'] ?? 0),
                    'Medium' => (int) ($byPriority['Medium'] ?? 0),
                    'High' => (int) ($byPriority['High'] ?? 0),
                    'Urgent' => (int) ($byPriority['Urgent'] ?? 0),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch ticket statistics');
        }
    }

    /**
     * Persist uploaded files to the public disk and create attachment rows.
     *
     * @param  array<int, \Illuminate\Http\UploadedFile>  $files
     * @return array<int, TicketAttachment>
     */
    private function storeAttachments(Ticket $ticket, array $files): array
    {
        $created = [];

        foreach ($files as $file) {
            $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('ticket-attachments/'.$ticket->id, $filename, 'public');

            $created[] = TicketAttachment::create([
                'ticket_id' => $ticket->id,
                'uploaded_by_user_id' => Auth::id(),
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                'size' => $file->getSize() ?? 0,
            ]);
        }

        return $created;
    }
}
