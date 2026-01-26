<?php

namespace App\Http\Controllers;

use App\Models\AssetComponent;

class AssetComponentController extends Controller
{
    public function index($assetId)
    {
        $components = AssetComponent::with([
            'status',
            'category',
            'assignedEmployee.branch',
            'assignedEmployee.position',
            'parentAsset.category'
        ])
            ->where('parent_asset_id', $assetId)
            ->get();
    }
}
