<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportSignatory\SaveSignatoryRequest;
use App\Models\ReportSignatory;
use Illuminate\Http\Request;

class ReportSignatoryController extends Controller
{
    /**
     * Get the current user's report signatories.
     */
    public function show(Request $request)
    {
        try {
            $signatory = ReportSignatory::with(['checkedBy.position', 'checkedBy.branch', 'notedBy.position', 'notedBy.branch'])
                ->where('user_id', $request->user()->id)
                ->first();

            return response()->json([
                'success' => true,
                'data' => $signatory,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch signatories');
        }
    }

    /**
     * Save (create or update) the current user's report signatories.
     */
    public function save(SaveSignatoryRequest $request)
    {
        try {
            $signatory = ReportSignatory::updateOrCreate(
                ['user_id' => $request->user()->id],
                [
                    'checked_by_id' => $request->checked_by_id,
                    'noted_by_id' => $request->noted_by_id,
                ]
            );

            $signatory->load(['checkedBy.position', 'checkedBy.branch', 'notedBy.position', 'notedBy.branch']);

            return response()->json([
                'success' => true,
                'message' => 'Signatories saved successfully',
                'data' => $signatory,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to save signatories');
        }
    }
}
