<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\SubmitSatisfactionRequest;
use App\Mail\TicketApprovalRequestMail;
use App\Models\Employee;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\TicketCategory;
use App\Models\TicketFormField;
use App\Models\TicketRemark;
use App\Services\HelpdeskAuditLogService;
use App\Services\RealtimeService;
use App\Services\TicketApproverResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * Public (non-authenticated) endpoints used by end-user employees to submit
 * tickets and track their status. Admin/MIS-side endpoints remain in
 * TicketController and are protected by auth:sanctum.
 */
class PublicTicketController extends Controller
{
    /**
     * Employee list for the public submit form.
     * Returns a light-weight shape — just what the picker needs.
     */
    /**
     * Active ticket categories for the public submit form.
     */
    public function categories(): JsonResponse
    {
        try {
            $categories = TicketCategory::query()
                ->active()
                ->ordered()
                ->get(['id', 'name', 'description']);

            return response()->json([
                'success' => true,
                'data' => $categories,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch categories');
        }
    }

    public function employees(): JsonResponse
    {
        try {
            $employees = Employee::query()
                ->with([
                    'branch:id,branch_name',
                    'obo:id,name',
                    'department:id,name',
                    'position:id,title',
                ])
                ->orderBy('fullname')
                ->get(['id', 'fullname', 'branch_id', 'obo_id', 'department_id', 'position_id']);

            return response()->json([
                'success' => true,
                'data' => $employees,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch employees');
        }
    }

    /**
     * Public ticket submission. No authentication required.
     *
     * Notes:
     * - status is forced to Open.
     * - assigned_to_user_id and due_date are NOT accepted (MIS triages later).
     * - Attachments capped stricter than admin (max 3 files / 5 MB each).
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'requester_employee_id' => 'required|exists:employee,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'contact_number' => 'nullable|string|max:50',
            'anydesk_number' => 'nullable|string|max:50',
            'category_id' => 'required|exists:ticket_categories,id',
            'priority' => 'required|in:Low,Medium,High,Urgent',
            'priority_justification' => 'required_if:priority,High|required_if:priority,Urgent|nullable|string|max:1000',
            'attachments' => 'required|array|min:1|max:3',
            'attachments.*' => 'file|mimes:jpeg,jpg,png,gif,webp,pdf|max:5120',
        ], [
            'attachments.required' => 'Please attach at least one screenshot or image of the issue.',
            'attachments.min' => 'Please attach at least one screenshot or image of the issue.',
            'attachments.*.mimes' => 'Each attachment must be an image or PDF (jpg, png, gif, webp, or pdf).',
            'priority_justification.required_if' => 'Please explain why this ticket is high/urgent priority.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validate configurable custom fields against current active defs.
        $rawCustom = $request->input('custom_fields');
        if (is_string($rawCustom)) {
            $rawCustom = json_decode($rawCustom, true);
        }
        $customResult = TicketFormField::validateSubmission(
            is_array($rawCustom) ? $rawCustom : [],
            (int) $request->input('category_id'),
        );
        if (! empty($customResult['errors'])) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $customResult['errors'],
            ], 422);
        }

        try {
            // Approval workflow: high/urgent public submissions are held
            // pending an approver email. They stay invisible to the IT team
            // until the approver clicks Approve.
            $priority = (string) $request->input('priority');
            $requiresApproval = in_array($priority, ['High', 'Urgent'], true);

            // Resolve the requester's branch approver BEFORE creating the
            // ticket so a misconfigured branch never produces a pending-but-
            // unroutable ticket. Walks branch+OBO → branch-only → parent
            // branch chain. Globals are NOT consulted here — they are only
            // notified later via MIS's manual "Forward to President" action
            // on the ticket detail page (post-approval executive escalation).
            $branchApprover = null;
            if ($requiresApproval) {
                $requesterForResolve = Employee::query()->find($request->input('requester_employee_id'));
                $branchApprover = app(TicketApproverResolver::class)->resolve($requesterForResolve);

                if (! $branchApprover) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No approver is configured for your branch. Please contact MIS to set one up before submitting High or Urgent priority tickets.',
                    ], 422);
                }
            }

            $primaryApproverEmail = $branchApprover?->email;

            $ticket = Ticket::create([
                'requester_employee_id' => $request->input('requester_employee_id'),
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'contact_number' => $request->input('contact_number'),
                'anydesk_number' => $request->input('anydesk_number'),
                'category_id' => $request->input('category_id'),
                'priority' => $priority,
                'priority_justification' => $requiresApproval
                    ? trim((string) $request->input('priority_justification'))
                    : null,
                'status' => 'Open',
                'created_by_user_id' => null,
                'custom_fields' => $customResult['values'] ?: null,
                'approval_status' => $requiresApproval ? 'pending' : null,
                'approval_token' => $requiresApproval ? Str::random(48) : null,
                'approver_email' => $primaryApproverEmail,
            ]);

            $requester = Employee::query()->find($ticket->requester_employee_id);
            $requesterName = $requester?->fullname;

            // Overrides the observer's generic "ticket.created" audit row with
            // public-actor attribution (IP/UA + requester name).
            HelpdeskAuditLogService::logTicketCreated(
                $ticket,
                'public',
                $ticket->requester_employee_id,
                $requesterName,
            );

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
                    $path = $file->storeAs('ticket-attachments/'.$ticket->id, $filename, 'public');

                    $attachment = TicketAttachment::create([
                        'ticket_id' => $ticket->id,
                        'uploaded_by_user_id' => null,
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                        'size' => $file->getSize() ?? 0,
                    ]);

                    HelpdeskAuditLogService::logAttachmentUploaded(
                        $ticket,
                        $attachment,
                        'public',
                        $ticket->requester_employee_id,
                        $requesterName,
                    );
                }
            }

            $ticket->loadMissing(['requester.branch', 'category']);

            if ($requiresApproval) {
                // Email only the resolved branch approver. Globals (President,
                // C-suite) are NOT CC'd here — MIS escalates manually from the
                // ticket detail page once it lands in the staff queue.
                // Wrap so that a mail failure still returns success — the
                // ticket is safely in 'pending' state and MIS can resend
                // via a future admin tool.
                try {
                    Mail::to($branchApprover->email)->send(new TicketApprovalRequestMail($ticket));
                } catch (\Throwable $mailError) {
                    Log::warning('Approval email send failed', [
                        'ticket_id' => $ticket->id,
                        'to' => $branchApprover->email,
                        'error' => $mailError->getMessage(),
                    ]);
                }
                // Deliberately NOT emitting realtime — ticket must stay hidden
                // from /helpdesk/tickets until the approver signs off.
            } else {
                RealtimeService::emit(
                    RealtimeService::helpdeskRoom(),
                    'ticket.created',
                    [
                        'id' => $ticket->id,
                        'ticket_number' => $ticket->ticket_number,
                        'title' => $ticket->title,
                        'priority' => $ticket->priority,
                        'status' => $ticket->status,
                        'requester_name' => $ticket->requester?->fullname ?? $requesterName,
                        'branch_name' => $ticket->requester?->branch?->branch_name,
                        'created_at' => $ticket->created_at,
                        'source' => 'public',
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => $requiresApproval
                    ? 'Ticket submitted — awaiting approver review (high/urgent priority).'
                    : 'Ticket submitted',
                'data' => [
                    'ticket_number' => $ticket->ticket_number,
                    'id' => $ticket->id,
                    'status' => $ticket->status,
                    'priority' => $ticket->priority,
                    'approval_status' => $ticket->approval_status,
                ],
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to submit ticket');
        }
    }

    /**
     * Public status lookup by ticket number. Returns a limited view
     * (no internal remarks of type 'system'/'assignment', no internal
     * MIS staff user details beyond names).
     */
    public function track(string $ticketNumber): JsonResponse
    {
        try {
            $ticket = Ticket::where('ticket_number', $ticketNumber)
                ->with([
                    'category:id,name',
                    'requester:id,fullname,branch_id',
                    'requester.branch:id,branch_name',
                    'attachments' => function ($q) {
                        $q->whereNull('ticket_remark_id');
                    },
                    // Conversation only — human-authored general remarks. System logs
                    // (status changes, assignments) are excluded so the thread reads
                    // like a chat, not an activity feed.
                    // Oldest → newest so latest comments appear at the bottom of the thread.
                    // Use reorder() because the Ticket::remarks() relation has a default DESC
                    // orderBy that would otherwise take precedence.
                    'remarks' => function ($q) {
                        $q->where('remark_type', 'general')
                            ->where('is_internal', false)
                            ->with(['user:id,name', 'employee:id,fullname', 'attachments'])
                            ->reorder('created_at', 'asc');
                    },
                ])
                ->first();

            if (! $ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'ticket_number' => $ticket->ticket_number,
                    'title' => $ticket->title,
                    'description' => $ticket->description,
                    'contact_number' => $ticket->contact_number,
                    'anydesk_number' => $ticket->anydesk_number,
                    'category' => $ticket->category?->name,
                    'priority' => $ticket->priority,
                    'priority_justification' => $ticket->priority_justification,
                    'status' => $ticket->status,
                    'requester' => [
                        'fullname' => $ticket->requester?->fullname,
                        'branch' => $ticket->requester?->branch?->branch_name,
                    ],
                    'assigned_to' => $ticket->assignedTo?->name,
                    'created_at' => $ticket->created_at,
                    'resolved_at' => $ticket->resolved_at,
                    'closed_at' => $ticket->closed_at,
                    'resolution_summary' => $ticket->resolution_summary,
                    'due_date' => $ticket->due_date,
                    'custom_fields' => $ticket->custom_fields,
                    'approval_status' => $ticket->approval_status,
                    'rejection_reason' => $ticket->rejection_reason,
                    'satisfaction_rating' => $ticket->satisfaction_rating,
                    'satisfaction_comment' => $ticket->satisfaction_comment,
                    'satisfaction_submitted_at' => $ticket->satisfaction_submitted_at,
                    'attachments' => $ticket->attachments->map(fn ($a) => [
                        'id' => $a->id,
                        'original_name' => $a->original_name,
                        'mime_type' => $a->mime_type,
                        'size' => $a->size,
                        'url' => Storage::disk('public')->url($a->file_path),
                    ]),
                    'remarks' => $ticket->remarks->map(fn ($r) => [
                        'id' => $r->id,
                        'remark' => $r->remark,
                        'remark_type' => $r->remark_type,
                        'author_type' => $r->user_id ? 'mis' : ($r->employee_id ? 'employee' : 'system'),
                        'author_name' => $r->user?->name ?? $r->employee?->fullname,
                        'created_at' => $r->created_at,
                        'attachments' => $r->attachments,
                    ]),
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch ticket');
        }
    }

    /**
     * Allow the ticket requester to post a comment from the public tracker.
     *
     * Authentication model: trust-based. Anyone with the ticket_number can
     * comment and the remark will be attributed to the ticket's requester
     * employee. Suitable for internal-only use. Rate-limited to deter abuse.
     */
    public function addRemark(Request $request, string $ticketNumber): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'remark' => 'nullable|string|max:2000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpeg,jpg,png,gif,webp,mp4,mov,webm,quicktime|max:20480',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Require either text or at least one attachment
        $hasText = trim((string) $request->input('remark')) !== '';
        $hasFiles = $request->hasFile('attachments');
        if (! $hasText && ! $hasFiles) {
            return response()->json([
                'success' => false,
                'message' => 'Please write a message or attach a photo/video.',
            ], 422);
        }

        try {
            $ticket = Ticket::where('ticket_number', $ticketNumber)->first();

            if (! $ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found',
                ], 404);
            }

            $remark = TicketRemark::create([
                'ticket_id' => $ticket->id,
                'user_id' => null,
                'employee_id' => $ticket->requester_employee_id,
                'remark' => $hasText ? $request->input('remark') : '(attachment)',
                'remark_type' => 'general',
                'is_internal' => false,
            ]);

            $requesterName = $ticket->requester?->fullname ?? Employee::find($ticket->requester_employee_id)?->fullname;

            if ($hasFiles) {
                foreach ($request->file('attachments') as $file) {
                    $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
                    $path = $file->storeAs('ticket-attachments/'.$ticket->id, $filename, 'public');

                    $attachment = TicketAttachment::create([
                        'ticket_id' => $ticket->id,
                        'ticket_remark_id' => $remark->id,
                        'uploaded_by_user_id' => null,
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
                        'size' => $file->getSize() ?? 0,
                    ]);

                    HelpdeskAuditLogService::logAttachmentUploaded(
                        $ticket,
                        $attachment,
                        'public',
                        $ticket->requester_employee_id,
                        $requesterName,
                    );
                }
            }

            HelpdeskAuditLogService::logRemarkAdded(
                $ticket,
                $remark,
                'public',
                $ticket->requester_employee_id,
                $requesterName,
            );

            $remark->load(['employee:id,fullname', 'attachments']);

            $payload = [
                'id' => $remark->id,
                'remark' => $remark->remark,
                'remark_type' => $remark->remark_type,
                'author_type' => 'employee',
                'author_name' => $remark->employee?->fullname,
                'created_at' => $remark->created_at,
                'attachments' => $remark->attachments,
            ];

            RealtimeService::emit(
                RealtimeService::ticketRoom($ticket->ticket_number),
                'remark.created',
                $payload
            );

            return response()->json([
                'success' => true,
                'message' => 'Comment added',
                'data' => $payload,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to add comment');
        }
    }

    /**
     * Submit a satisfaction rating once a ticket is Resolved or Closed.
     * Only one submission allowed per ticket.
     */
    public function submitRating(SubmitSatisfactionRequest $request, string $ticketNumber): JsonResponse
    {
        try {
            $ticket = Ticket::where('ticket_number', $ticketNumber)->first();

            if (! $ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found',
                ], 404);
            }

            if (! in_array($ticket->status, ['Resolved', 'Closed'], true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only rate a resolved or closed ticket.',
                ], 422);
            }

            if ($ticket->satisfaction_submitted_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'This ticket has already been rated.',
                ], 422);
            }

            $rating = (int) $request->input('rating');
            $comment = $request->input('comment');

            $ticket->satisfaction_rating = $rating;
            $ticket->satisfaction_comment = $comment;
            $ticket->satisfaction_submitted_at = now();
            $ticket->saveQuietly();

            HelpdeskAuditLogService::logSatisfactionSubmitted($ticket, $rating, $comment);

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your feedback!',
                'data' => [
                    'satisfaction_rating' => $ticket->satisfaction_rating,
                    'satisfaction_comment' => $ticket->satisfaction_comment,
                    'satisfaction_submitted_at' => $ticket->satisfaction_submitted_at,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to submit rating');
        }
    }
}
