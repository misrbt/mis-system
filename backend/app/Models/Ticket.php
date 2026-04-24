<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tickets';

    /**
     * Preserve camelCase keys (e.g. assignedTo, createdBy) when serializing
     * to JSON so the frontend can use the same property names as the
     * Eloquent relation methods.
     */
    public static $snakeAttributes = false;

    protected $fillable = [
        'ticket_number',
        'title',
        'description',
        'contact_number',
        'anydesk_number',
        'category_id',
        'priority',
        'priority_justification',
        'status',
        'requester_employee_id',
        'assigned_to_user_id',
        'created_by_user_id',
        'due_date',
        'resolved_at',
        'closed_at',
        'first_response_at',
        'resolution_summary',
        'custom_fields',
        'satisfaction_rating',
        'satisfaction_comment',
        'satisfaction_submitted_at',
        'approval_status',
        'approval_token',
        'approver_email',
        'approved_at',
        'approved_by',
        'rejected_at',
        'rejection_reason',
        'escalated_at',
        'escalated_by_user_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'resolved_at' => 'datetime',
            'closed_at' => 'datetime',
            'first_response_at' => 'datetime',
            'custom_fields' => 'array',
            'satisfaction_rating' => 'integer',
            'satisfaction_submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'escalated_at' => 'datetime',
        ];
    }

    /**
     * Boot: auto-generate ticket_number on create.
     */
    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket): void {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = self::generateTicketNumber();
            }
        });
    }

    /**
     * Generate next ticket number in format TKT-YYYY-NNNNNN.
     */
    public static function generateTicketNumber(): string
    {
        $year = now()->format('Y');
        $prefix = "TKT-{$year}-";

        $last = self::withTrashed()
            ->where('ticket_number', 'like', $prefix.'%')
            ->orderBy('ticket_number', 'desc')
            ->value('ticket_number');

        $nextSeq = 1;
        if ($last) {
            $nextSeq = (int) substr($last, strlen($prefix)) + 1;
        }

        return $prefix.str_pad((string) $nextSeq, 6, '0', STR_PAD_LEFT);
    }

    // ---------------------------------------------------------------------
    // Relationships
    // ---------------------------------------------------------------------

    public function requester(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'requester_employee_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class, 'category_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function escalatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalated_by_user_id');
    }

    public function remarks(): HasMany
    {
        return $this->hasMany(TicketRemark::class)->orderBy('created_at', 'desc');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TicketAttachment::class);
    }

    // ---------------------------------------------------------------------
    // Scopes
    // ---------------------------------------------------------------------

    public function scopeOpen($query)
    {
        return $query->where('status', 'Open');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'In Progress');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'Resolved');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'Closed');
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['Resolved', 'Closed', 'Cancelled']);
    }

    public function scopeOverdue($query)
    {
        return $query->whereNotNull('due_date')
            ->whereNotIn('status', ['Resolved', 'Closed', 'Cancelled'])
            ->where('due_date', '<', now()->startOfDay());
    }

    /**
     * Tickets that should appear to IT/MIS staff — everything except those
     * still pending approval or explicitly rejected. Use this scope wherever
     * the helpdesk list / dashboard / reports read tickets.
     */
    public function scopeVisibleToStaff($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('approval_status')
                ->orWhere('approval_status', 'approved');
        });
    }

    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeAssignedToUser($query, int $userId)
    {
        return $query->where('assigned_to_user_id', $userId);
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    public function isOverdue(): bool
    {
        if (in_array($this->status, ['Resolved', 'Closed', 'Cancelled'], true)) {
            return false;
        }

        if (! $this->due_date) {
            return false;
        }

        return now()->startOfDay()->gt($this->due_date);
    }

    public function getStatusColor(): string
    {
        return match ($this->status) {
            'Open' => 'slate',
            'In Progress' => 'blue',
            'Pending' => 'amber',
            'Resolved' => 'emerald',
            'Closed' => 'gray',
            'Cancelled' => 'red',
            default => 'slate',
        };
    }

    public function getPriorityColor(): string
    {
        return match ($this->priority) {
            'Low' => 'slate',
            'Medium' => 'amber',
            'High' => 'orange',
            'Urgent' => 'red',
            default => 'slate',
        };
    }
}
