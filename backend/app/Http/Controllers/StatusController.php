<?php

namespace App\Http\Controllers;

use App\Http\Requests\Status\StoreStatusRequest;
use App\Http\Requests\Status\UpdateStatusRequest;
use App\Models\Status;

class StatusController extends Controller
{
    /**
     * Display a listing of statuses.
     */
    public function index()
    {
        try {
            // Cache statuses for 24 hours (86400 seconds)
            $statuses = \Illuminate\Support\Facades\Cache::remember('statuses_all', 86400, function () {
                return Status::orderBy('name', 'asc')->get();
            });

            return response()->json([
                'success' => true,
                'data' => $statuses,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch statuses');
        }
    }

    /**
     * Store a newly created status.
     */
    public function store(StoreStatusRequest $request)
    {
        try {
            $status = Status::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Status created successfully',
                'data' => $status,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create status');
        }
    }

    /**
     * Display the specified status.
     */
    public function show($id)
    {
        try {
            $status = Status::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $status,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Status not found', 404);
        }
    }

    /**
     * Update the specified status.
     */
    public function update(UpdateStatusRequest $request, $id)
    {
        try {
            $status = Status::findOrFail($id);
            $status->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => $status,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update status');
        }
    }

    /**
     * Remove the specified status.
     */
    public function destroy($id)
    {
        try {
            $status = Status::findOrFail($id);
            $status->delete();

            return response()->json([
                'success' => true,
                'message' => 'Status deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete status');
        }
    }
}
