<?php

namespace App\Http\Controllers;

use App\Models\TicketFormField;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TicketFormFieldController extends Controller
{
    /**
     * Admin list of configurable form fields. Pass ?all=1 to include inactive.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = TicketFormField::query()->with('category:id,name');

            if (! $request->boolean('all')) {
                $query->where('is_active', true);
            }

            if ($request->filled('category_id')) {
                $query->forCategory((int) $request->input('category_id'));
            }

            $fields = $query->orderBy('sort_order')->orderBy('id')->get();

            return response()->json([
                'success' => true,
                'data' => $fields,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch form fields');
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $field = TicketFormField::with('category:id,name')->findOrFail($id);

            return response()->json(['success' => true, 'data' => $field], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Form field not found', 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validator = $this->makeValidator($request->all());
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

            $data['field_key'] = $this->ensureUniqueKey($data['field_key'] ?? $data['label']);
            $data['is_required'] = (bool) ($data['is_required'] ?? false);
            $data['is_active'] = $data['is_active'] ?? true;
            if (! isset($data['sort_order'])) {
                $data['sort_order'] = (int) (TicketFormField::max('sort_order') ?? 0) + 10;
            }
            if (! in_array($data['field_type'], ['select'], true)) {
                $data['options'] = null;
            }

            $field = TicketFormField::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Form field created',
                'data' => $field->load('category:id,name'),
            ], 201);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to create form field');
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $field = TicketFormField::findOrFail($id);

            $validator = $this->makeValidator($request->all(), $field->id);
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $data = $validator->validated();
            if (isset($data['field_key'])) {
                $data['field_key'] = $this->ensureUniqueKey($data['field_key'], $field->id);
            }
            if (isset($data['field_type']) && ! in_array($data['field_type'], ['select'], true)) {
                $data['options'] = null;
            }

            $field->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Form field updated',
                'data' => $field->fresh()->load('category:id,name'),
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to update form field');
        }
    }

    public function toggleActive(string $id): JsonResponse
    {
        try {
            $field = TicketFormField::findOrFail($id);
            $field->is_active = ! $field->is_active;
            $field->save();

            return response()->json([
                'success' => true,
                'message' => $field->is_active ? 'Field activated' : 'Field deactivated',
                'data' => $field,
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to toggle form field');
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $field = TicketFormField::findOrFail($id);
            $field->delete();

            return response()->json([
                'success' => true,
                'message' => 'Form field deleted',
            ], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to delete form field');
        }
    }

    /**
     * Public endpoint — returns ACTIVE fields the public submit form should
     * render. Optionally scoped by the category the user picked.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        try {
            $query = TicketFormField::query()->active()->ordered();

            if ($request->filled('category_id')) {
                $query->forCategory((int) $request->input('category_id'));
            }

            $fields = $query->get([
                'id', 'label', 'field_key', 'field_type', 'is_required',
                'placeholder', 'help_text', 'options', 'category_id', 'sort_order',
            ]);

            return response()->json(['success' => true, 'data' => $fields], 200);
        } catch (\Exception $e) {
            return $this->handleException($e, 'Failed to fetch form fields');
        }
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function makeValidator(array $input, ?int $ignoreId = null): \Illuminate\Contracts\Validation\Validator
    {
        $keyUnique = 'unique:ticket_form_fields,field_key'.($ignoreId ? ','.$ignoreId : '');

        return Validator::make($input, [
            'label' => 'required|string|max:120',
            'field_key' => 'nullable|string|max:64|regex:/^[a-z][a-z0-9_]*$/|'.$keyUnique,
            'field_type' => 'required|in:'.implode(',', TicketFormField::TYPES),
            'is_required' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0|max:65535',
            'placeholder' => 'nullable|string|max:200',
            'help_text' => 'nullable|string|max:1000',
            'options' => 'nullable|array|max:30',
            'options.*.value' => 'required_with:options|string|max:60',
            'options.*.label' => 'required_with:options|string|max:120',
            'category_id' => 'nullable|exists:ticket_categories,id',
        ], [
            'field_key.regex' => 'Field key must start with a letter and contain only lowercase letters, numbers, and underscores.',
        ]);
    }

    /**
     * Guarantee a valid snake_case key. Falls back to slugging the label.
     */
    private function ensureUniqueKey(string $candidate, ?int $ignoreId = null): string
    {
        $base = Str::snake(Str::ascii($candidate));
        $base = preg_replace('/[^a-z0-9_]/', '', strtolower($base));
        if (! $base || ! preg_match('/^[a-z]/', $base)) {
            $base = 'field_'.$base;
        }
        $base = substr($base, 0, 60);

        $key = $base;
        $i = 2;
        while (TicketFormField::where('field_key', $key)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()
        ) {
            $key = substr($base, 0, 58).'_'.$i;
            $i++;
        }

        return $key;
    }
}
