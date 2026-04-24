<?php

namespace App\Services;

use App\Models\HelpdeskAuditLog;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\TicketRemark;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Writes helpdesk audit entries. Every method is wrapped so that an audit
 * failure never blocks the calling API request — we log the throwable and
 * continue.
 *
 * Actor is always explicit. We never guess via Auth::id() alone because
 * many helpdesk writes originate from unauthenticated public endpoints.
 */
class HelpdeskAuditLogService
{
    /**
     * Fields tracked for ticket.updated diffs.
     */
    public const TICKET_TRACKED_FIELDS = [
        'title',
        'description',
        'contact_number',
        'anydesk_number',
        'category_id',
        'priority',
        'status',
        'assigned_to_user_id',
        'due_date',
        'resolution_summary',
    ];

    /**
     * Core write.
     *
     * @param  array<string, mixed>  $changes
     * @param  array<string, mixed>  $metadata
     */
    public static function log(
        string $action,
        ?Ticket $ticket,
        string $actorType,
        ?int $actorId,
        ?string $actorName,
        array $changes = [],
        array $metadata = [],
        ?Request $request = null,
    ): ?HelpdeskAuditLog {
        try {
            $req = $request ?? request();

            return HelpdeskAuditLog::create([
                'ticket_id' => $ticket?->id,
                'ticket_number' => $ticket?->ticket_number,
                'action' => $action,
                'actor_type' => $actorType,
                'actor_id' => $actorId,
                'actor_name' => $actorName,
                'changes' => empty($changes) ? null : $changes,
                'metadata' => empty($metadata) ? null : $metadata,
                'ip_address' => $req?->ip(),
                'user_agent' => $req ? substr((string) $req->userAgent(), 0, 500) : null,
            ]);
        } catch (Throwable $e) {
            Log::warning('HelpdeskAuditLogService::log failed', [
                'action' => $action,
                'ticket_id' => $ticket?->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Diff helper. Returns only changed keys in { field: { old, new } } shape.
     *
     * @param  array<string, mixed>  $original
     * @param  array<string, mixed>  $updated
     * @param  array<int, string>  $fields
     * @return array<string, array{old: mixed, new: mixed}>
     */
    public static function trackChanges(array $original, array $updated, array $fields): array
    {
        $diff = [];

        foreach ($fields as $field) {
            $old = $original[$field] ?? null;
            $new = $updated[$field] ?? null;

            if ($old != $new) {
                $diff[$field] = [
                    'old' => $old,
                    'new' => $new,
                ];
            }
        }

        return $diff;
    }

    // -------------------------------------------------------------------
    // Convenience wrappers — each resolves the actor then calls log().
    // -------------------------------------------------------------------

    public static function logTicketCreated(Ticket $ticket, ?string $actorType = null, ?int $actorId = null, ?string $actorName = null): void
    {
        [$type, $id, $name] = self::resolveActor($actorType, $actorId, $actorName);

        self::log(
            action: 'ticket.created',
            ticket: $ticket,
            actorType: $type,
            actorId: $id,
            actorName: $name,
            metadata: [
                'priority' => $ticket->priority,
                'status' => $ticket->status,
                'category_id' => $ticket->category_id,
                'requester_employee_id' => $ticket->requester_employee_id,
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $original
     */
    public static function logTicketUpdated(Ticket $ticket, array $original): void
    {
        $changes = self::trackChanges($original, $ticket->getAttributes(), self::TICKET_TRACKED_FIELDS);

        if (empty($changes)) {
            return;
        }

        [$type, $id, $name] = self::resolveActor();

        self::log(
            action: 'ticket.updated',
            ticket: $ticket,
            actorType: $type,
            actorId: $id,
            actorName: $name,
            changes: $changes,
        );
    }

    public static function logStatusChange(Ticket $ticket, ?string $from, ?string $to): void
    {
        [$type, $id, $name] = self::resolveActor();

        self::log(
            action: 'ticket.status_changed',
            ticket: $ticket,
            actorType: $type,
            actorId: $id,
            actorName: $name,
            changes: ['status' => ['old' => $from, 'new' => $to]],
        );
    }

    public static function logPriorityChange(Ticket $ticket, ?string $from, ?string $to): void
    {
        [$type, $id, $name] = self::resolveActor();

        self::log(
            action: 'ticket.priority_changed',
            ticket: $ticket,
            actorType: $type,
            actorId: $id,
            actorName: $name,
            changes: ['priority' => ['old' => $from, 'new' => $to]],
        );
    }

    public static function logAssignmentChange(Ticket $ticket, ?int $fromUserId, ?int $toUserId): void
    {
        [$type, $id, $name] = self::resolveActor();

        $fromName = $fromUserId ? optional(User::find($fromUserId))->name : null;
        $toName = $toUserId ? optional(User::find($toUserId))->name : null;

        self::log(
            action: 'ticket.assigned',
            ticket: $ticket,
            actorType: $type,
            actorId: $id,
            actorName: $name,
            changes: [
                'assigned_to_user_id' => ['old' => $fromUserId, 'new' => $toUserId],
            ],
            metadata: [
                'from_name' => $fromName,
                'to_name' => $toName,
            ],
        );
    }

    public static function logRemarkAdded(
        Ticket $ticket,
        TicketRemark $remark,
        string $actorType,
        ?int $actorId,
        ?string $actorName,
    ): void {
        self::log(
            action: 'remark.added',
            ticket: $ticket,
            actorType: $actorType,
            actorId: $actorId,
            actorName: $actorName,
            metadata: [
                'remark_id' => $remark->id,
                'remark_type' => $remark->remark_type,
                'is_internal' => (bool) $remark->is_internal,
                'has_attachment' => $remark->attachments()->exists(),
            ],
        );
    }

    public static function logAttachmentUploaded(Ticket $ticket, TicketAttachment $attachment, string $actorType, ?int $actorId, ?string $actorName): void
    {
        self::log(
            action: 'attachment.uploaded',
            ticket: $ticket,
            actorType: $actorType,
            actorId: $actorId,
            actorName: $actorName,
            metadata: [
                'attachment_id' => $attachment->id,
                'original_name' => $attachment->original_name,
                'mime_type' => $attachment->mime_type,
                'size' => $attachment->size,
                'ticket_remark_id' => $attachment->ticket_remark_id,
            ],
        );
    }

    public static function logAttachmentDeleted(Ticket $ticket, TicketAttachment $attachment): void
    {
        [$type, $id, $name] = self::resolveActor();

        self::log(
            action: 'attachment.deleted',
            ticket: $ticket,
            actorType: $type,
            actorId: $id,
            actorName: $name,
            metadata: [
                'attachment_id' => $attachment->id,
                'original_name' => $attachment->original_name,
                'mime_type' => $attachment->mime_type,
                'size' => $attachment->size,
            ],
        );
    }

    public static function logTicketDeleted(Ticket $ticket): void
    {
        [$type, $id, $name] = self::resolveActor();

        self::log(
            action: 'ticket.deleted',
            ticket: $ticket,
            actorType: $type,
            actorId: $id,
            actorName: $name,
        );
    }

    public static function logTicketRestored(Ticket $ticket): void
    {
        [$type, $id, $name] = self::resolveActor();

        self::log(
            action: 'ticket.restored',
            ticket: $ticket,
            actorType: $type,
            actorId: $id,
            actorName: $name,
        );
    }

    /**
     * @param  array<int, string>  $recipients
     */
    public static function logTicketEscalated(Ticket $ticket, array $recipients): void
    {
        [$type, $id, $name] = self::resolveActor();

        self::log(
            action: 'ticket.escalated',
            ticket: $ticket,
            actorType: $type,
            actorId: $id,
            actorName: $name,
            metadata: [
                'recipients' => $recipients,
                'priority' => $ticket->priority,
            ],
        );
    }

    public static function logSatisfactionSubmitted(Ticket $ticket, int $rating, ?string $comment): void
    {
        self::log(
            action: 'satisfaction.submitted',
            ticket: $ticket,
            actorType: 'public',
            actorId: $ticket->requester_employee_id,
            actorName: $ticket->requester?->fullname,
            metadata: [
                'rating' => $rating,
                'has_comment' => filled($comment),
            ],
        );
    }

    /**
     * Resolve the authenticated MIS user or fall back to system.
     *
     * @return array{0: string, 1: ?int, 2: ?string}
     */
    private static function resolveActor(
        ?string $type = null,
        ?int $id = null,
        ?string $name = null,
    ): array {
        if ($type !== null) {
            return [$type, $id, $name];
        }

        $user = Auth::user();
        if ($user) {
            return ['user', (int) $user->id, $user->name];
        }

        return ['system', null, null];
    }
}
