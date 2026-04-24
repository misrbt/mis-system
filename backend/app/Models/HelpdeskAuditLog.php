<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class HelpdeskAuditLog extends Model
{
    use HasFactory, SoftDeletes;

    public static $snakeAttributes = false;

    protected $table = 'helpdesk_audit_logs';

    protected $fillable = [
        'ticket_id',
        'ticket_number',
        'action',
        'actor_type',
        'actor_id',
        'actor_name',
        'changes',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'changes' => 'array',
            'metadata' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * MIS staff actor relation. Only populated when actor_type === 'user'.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Employee actor relation. Only populated when actor_type === 'employee'
     * or 'public' (public actions are attributed to the requester employee).
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'actor_id');
    }

    public function scopeForTicket($query, int $ticketId)
    {
        return $query->where('ticket_id', $ticketId);
    }

    public function scopeByActorType($query, string $actorType)
    {
        return $query->where('actor_type', $actorType);
    }

    public function scopeBetween($query, ?string $from, ?string $to)
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $query;
    }
}
