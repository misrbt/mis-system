<?php

namespace App\Http\Controllers;

use App\Models\ReportSignatory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch signatories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Save (create or update) the current user's report signatories.
     */
    public function save(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'checked_by_id' => 'nullable|exists:employee,id',
            'noted_by_id' => 'nullable|exists:employee,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

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
            return response()->json([
                'success' => false,
                'message' => 'Failed to save signatories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
