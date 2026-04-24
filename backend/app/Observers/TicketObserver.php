<?php

namespace App\Observers;

use App\Models\Ticket;
use App\Models\TicketRemark;
use App\Models\User;
use App\Services\HelpdeskAuditLogService;
use Illuminate\Support\Facades\Auth;

class TicketObserver
{
    /**
     * Auto-stamp lifecycle dates at creation time.
     */
    public function creating(Ticket $ticket): void
    {
        if ($ticket->status === 'Resolved' && ! $ticket->resolved_at) {
            $ticket->resolved_at = now();
        }

        if ($ticket->status === 'Closed' && ! $ticket->closed_at) {
            $ticket->closed_at = now();
        }
    }

    /**
     * On create: user-visible system remark PLUS admin-only audit log row.
     */
    public function created(Ticket $ticket): void
    {
        TicketRemark::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'remark' => 'Ticket created with priority '.$ticket->priority.' and status '.$ticket->status.'.',
            'remark_type' => 'system',
        ]);

        // Audit log write — observer doesn't know whether this was a staff or
        // public create, so defer to the resolver (Auth::user() wins; else system).
        // Public controllers override this via an explicit logTicketCreated() call.
        HelpdeskAuditLogService::logTicketCreated($ticket);
    }

    /**
     * Auto-stamp status transitions (resolved_at / closed_at) before save.
     */
    public function updating(Ticket $ticket): void
    {
        if ($ticket->isDirty('status')) {
            $newStatus = $ticket->status;

            if ($newStatus === 'Resolved' && ! $ticket->resolved_at) {
                $ticket->resolved_at = now();
            }

            if ($newStatus === 'Closed' && ! $ticket->closed_at) {
                $ticket->closed_at = now();
            }

            // If moved back out of resolved/closed, clear the stamp.
            if (! in_array($newStatus, ['Resolved', 'Closed'], true)) {
                if ($ticket->isDirty('resolved_at') === false && in_array($ticket->getOriginal('status'), ['Resolved'], true)) {
                    $ticket->resolved_at = null;
                }
                if ($ticket->isDirty('closed_at') === false && in_array($ticket->getOriginal('status'), ['Closed'], true)) {
                    $ticket->closed_at = null;
                }
            }
        }
    }

    /**
     * On update: user-visible system remarks for status/assignment/priority
     * (as before) PLUS a full admin-only diff audit log row.
     */
    public function updated(Ticket $ticket): void
    {
        $userId = Auth::id();

        // --- User-visible thread entries (existing behavior) ---
        if ($ticket->wasChanged('status')) {
            $old = $ticket->getOriginal('status');
            $new = $ticket->status;

            TicketRemark::create([
                'ticket_id' => $ticket->id,
                'user_id' => $userId,
                'remark' => "Status changed from {$old} to {$new}.",
                'remark_type' => 'status_change',
            ]);

            HelpdeskAuditLogService::logStatusChange($ticket, $old, $new);
        }

        if ($ticket->wasChanged('assigned_to_user_id')) {
            $old = $ticket->getOriginal('assigned_to_user_id');
            $new = $ticket->assigned_to_user_id;

            $oldName = $old ? optional(User::find($old))->name : null;
            $newName = $new ? optional(User::find($new))->name : null;

            if ($new && ! $old) {
                $message = "Ticket assigned to {$newName}.";
            } elseif (! $new && $old) {
                $message = "Ticket unassigned (was {$oldName}).";
            } else {
                $message = "Assignment changed from {$oldName} to {$newName}.";
            }

            TicketRemark::create([
                'ticket_id' => $ticket->id,
                'user_id' => $userId,
                'remark' => $message,
                'remark_type' => 'assignment',
            ]);

            HelpdeskAuditLogService::logAssignmentChange($ticket, $old ? (int) $old : null, $new ? (int) $new : null);
        }

        if ($ticket->wasChanged('priority')) {
            $old = $ticket->getOriginal('priority');
            $new = $ticket->priority;

            TicketRemark::create([
                'ticket_id' => $ticket->id,
                'user_id' => $userId,
                'remark' => "Priority changed from {$old} to {$new}.",
                'remark_type' => 'system',
            ]);

            HelpdeskAuditLogService::logPriorityChange($ticket, $old, $new);
        }

        // --- Admin-only full diff (covers title, description, category, due_date,
        // resolution_summary, contact_number, anydesk_number — plus the fields above).
        $original = [];
        foreach (HelpdeskAuditLogService::TICKET_TRACKED_FIELDS as $field) {
            $original[$field] = $ticket->getOriginal($field);
        }
        HelpdeskAuditLogService::logTicketUpdated($ticket, $original);
    }

    public function deleted(Ticket $ticket): void
    {
        HelpdeskAuditLogService::logTicketDeleted($ticket);
    }

    public function restored(Ticket $ticket): void
    {
        HelpdeskAuditLogService::logTicketRestored($ticket);
    }

    public function forceDeleted(Ticket $ticket): void
    {
        //
    }
}
