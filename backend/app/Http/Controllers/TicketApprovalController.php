<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Services\HelpdeskAuditLogService;
use App\Services\RealtimeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Token-authenticated approval flow for high/urgent public tickets.
 * The approver receives a link in their email; these endpoints power the
 * review page they land on.
 */
class TicketApprovalController extends Controller
{
    public function show(string $token): JsonResponse
    {
        try {
            $ticket = $this->findTicketOrFail($token);

            return response()->json([
                'success' => true,
                'data' => [
                    'ticket_number' => $ticket->ticket_number,
                    'title' => $ticket->title,
                    'description' => $ticket->description,
                    'category' => $ticket->category?->name,
                    'priority' => $ticket->priority,
                    'priority_justification' => $ticket->priority_justification,
                    'status' => $ticket->status,
                    'approval_status' => $ticket->approval_status,
                    'approved_at' => $ticket->approved_at,
                    'rejected_at' => $ticket->rejected_at,
                    'rejection_reason' => $ticket->rejection_reason,
                    'requester' => [
                        'fullname' => $ticket->requester?->fullname,
                        'branch' => $ticket->requester?->branch?->branch_name,
                    ],
                    'contact_number' => $ticket->contact_number,
                    'anydesk_number' => $ticket->anydesk_number,
                    'custom_fields' => $ticket->custom_fields,
                    'created_at' => $ticket->created_at,
                    'attachments' => $ticket->attachments->map(fn ($a) => [
                        'id' => $a->id,
                        'original_name' => $a->original_name,
                        'mime_type' => $a->mime_type,
                        'size' => $a->size,
                        'url' => $a->url,
                    ]),
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Approval request not found', 404);
        }
    }

    public function approve(Request $request, string $token): JsonResponse
    {
        try {
            $ticket = $this->findTicketOrFail($token);

            if ($ticket->approval_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This ticket is no longer pending review.',
                    'current_status' => $ticket->approval_status,
                ], 409);
            }

            $approverLabel = $request->input('approver_name')
                ?: $ticket->approver_email
                ?: 'Approver';

            $ticket->approval_status = 'approved';
            $ticket->approved_at = now();
            $ticket->approved_by = $approverLabel;
            $ticket->saveQuietly(); // avoid kicking the TicketObserver on a simple flag flip

            // Audit
            HelpdeskAuditLogService::log(
                action: 'ticket.approved',
                ticket: $ticket,
                actorType: 'public',
                actorId: null,
                actorName: $approverLabel,
                metadata: ['priority' => $ticket->priority],
                request: $request,
            );

            // Now make the ticket visible to IT: broadcast ticket.created so
            // live admin clients pop it onto /helpdesk/tickets.
            $ticket->loadMissing(['requester.branch', 'category']);
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
                    'source' => 'approved',
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Ticket approved and forwarded to the IT team.',
                'data' => [
                    'ticket_number' => $ticket->ticket_number,
                    'approval_status' => $ticket->approval_status,
                    'approved_at' => $ticket->approved_at,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to approve ticket');
        }
    }

    public function reject(Request $request, string $token): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:1000',
            'approver_name' => 'nullable|string|max:120',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $ticket = $this->findTicketOrFail($token);

            if ($ticket->approval_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This ticket is no longer pending review.',
                    'current_status' => $ticket->approval_status,
                ], 409);
            }

            $approverLabel = $request->input('approver_name')
                ?: $ticket->approver_email
                ?: 'Approver';

            $ticket->approval_status = 'rejected';
            $ticket->rejected_at = now();
            $ticket->rejection_reason = $request->input('reason');
            $ticket->approved_by = $approverLabel; // records who made the decision either way
            $ticket->saveQuietly();

            HelpdeskAuditLogService::log(
                action: 'ticket.rejected',
                ticket: $ticket,
                actorType: 'public',
                actorId: null,
                actorName: $approverLabel,
                metadata: [
                    'priority' => $ticket->priority,
                    'reason' => $ticket->rejection_reason,
                ],
                request: $request,
            );

            return response()->json([
                'success' => true,
                'message' => 'Ticket rejected.',
                'data' => [
                    'ticket_number' => $ticket->ticket_number,
                    'approval_status' => $ticket->approval_status,
                    'rejected_at' => $ticket->rejected_at,
                ],
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to reject ticket');
        }
    }

    /**
     * Find a ticket by its approval token. Includes soft-deleted so stale
     * links don't leak "ticket not found" when the record actually exists
     * but was trashed; still 404 if not pending.
     */
    private function findTicketOrFail(string $token): Ticket
    {
        return Ticket::query()
            ->with(['requester.branch', 'category', 'attachments'])
            ->where('approval_token', $token)
            ->firstOrFail();
    }
}
