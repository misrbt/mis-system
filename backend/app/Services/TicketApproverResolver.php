<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Employee;
use App\Models\TicketApprover;

/**
 * Resolves the correct approver for a High/Urgent public ticket by walking
 * the organizational hierarchy of the requester:
 *
 *   1. Exact branch + OBO match (most specific).
 *   2. Branch-only rule (obo_id IS NULL) on the requester's branch.
 *   3. Walk up the branch.parent_branch_id chain and try a branch-only rule
 *      at each ancestor ("branch lite" → parent branch fallback).
 *
 * Returns null if no rule matches. Callers should treat null as "cannot
 * submit a High/Urgent ticket from this branch" and surface a clear error.
 */
class TicketApproverResolver
{
    /**
     * Max ancestors walked. Guards against pathological parent_branch_id
     * cycles without assuming how deep the org tree goes.
     */
    private const MAX_ANCESTOR_HOPS = 10;

    public function resolve(Employee $requester): ?TicketApprover
    {
        $branchId = $requester->branch_id;
        if (! $branchId) {
            return null;
        }

        if ($requester->obo_id) {
            $hit = TicketApprover::query()
                ->active()
                ->where('branch_id', $branchId)
                ->where('obo_id', $requester->obo_id)
                ->first();
            if ($hit) {
                return $hit;
            }
        }

        $hit = TicketApprover::query()
            ->active()
            ->where('branch_id', $branchId)
            ->whereNull('obo_id')
            ->first();
        if ($hit) {
            return $hit;
        }

        $branch = Branch::find($branchId);
        $visited = [$branchId];
        $hops = 0;

        while ($branch?->parent_branch_id && $hops < self::MAX_ANCESTOR_HOPS) {
            $parentId = $branch->parent_branch_id;
            if (in_array($parentId, $visited, true)) {
                break;
            }
            $visited[] = $parentId;
            $hops++;

            $hit = TicketApprover::query()
                ->active()
                ->where('branch_id', $parentId)
                ->whereNull('obo_id')
                ->first();
            if ($hit) {
                return $hit;
            }

            $branch = Branch::find($parentId);
        }

        return null;
    }
}
