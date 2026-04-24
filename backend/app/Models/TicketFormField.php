<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketFormField extends Model
{
    use HasFactory;

    public static $snakeAttributes = false;

    protected $table = 'ticket_form_fields';

    protected $fillable = [
        'label',
        'field_key',
        'field_type',
        'is_required',
        'is_active',
        'sort_order',
        'placeholder',
        'help_text',
        'options',
        'category_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'options' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TicketCategory::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Fields that apply to a given category — either global (no category_id)
     * or explicitly scoped to it.
     */
    public function scopeForCategory($query, ?int $categoryId)
    {
        if ($categoryId === null) {
            return $query->whereNull('category_id');
        }

        return $query->where(function ($q) use ($categoryId) {
            $q->whereNull('category_id')->orWhere('category_id', $categoryId);
        });
    }

    public const TYPES = ['text', 'textarea', 'number', 'date', 'select', 'checkbox'];

    /**
     * Validate + normalize a set of submitted custom field values against
     * the currently-active field definitions.
     *
     * Unknown keys are silently dropped. Required fields that are missing
     * produce errors. Type-specific coercion: number → float, checkbox →
     * boolean, date → ISO date string, select → must match an option value.
     *
     * @param  array<string, mixed>|null  $input
     * @return array{values: array<string, mixed>, errors: array<string, string>}
     */
    public static function validateSubmission(?array $input, ?int $categoryId): array
    {
        $fields = static::active()->forCategory($categoryId)->ordered()->get();
        $input = is_array($input) ? $input : [];
        $values = [];
        $errors = [];

        foreach ($fields as $field) {
            $raw = $input[$field->field_key] ?? null;
            $present = $raw !== null && $raw !== '' && $raw !== [];

            if (! $present) {
                if ($field->is_required) {
                    $errors['custom_fields.'.$field->field_key] = "{$field->label} is required.";
                }

                continue;
            }

            switch ($field->field_type) {
                case 'number':
                    if (! is_numeric($raw)) {
                        $errors['custom_fields.'.$field->field_key] = "{$field->label} must be a number.";
                        break;
                    }
                    $values[$field->field_key] = (float) $raw;
                    break;

                case 'checkbox':
                    $values[$field->field_key] = filter_var($raw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
                    break;

                case 'date':
                    $ts = strtotime((string) $raw);
                    if ($ts === false) {
                        $errors['custom_fields.'.$field->field_key] = "{$field->label} must be a valid date.";
                        break;
                    }
                    $values[$field->field_key] = date('Y-m-d', $ts);
                    break;

                case 'select':
                    $allowed = collect($field->options ?? [])->pluck('value')->all();
                    if (! in_array((string) $raw, array_map('strval', $allowed), true)) {
                        $errors['custom_fields.'.$field->field_key] = "{$field->label} must be one of the allowed options.";
                        break;
                    }
                    $values[$field->field_key] = (string) $raw;
                    break;

                case 'textarea':
                    $values[$field->field_key] = (string) $raw;
                    if (mb_strlen($values[$field->field_key]) > 5000) {
                        $errors['custom_fields.'.$field->field_key] = "{$field->label} is too long.";
                    }
                    break;

                case 'text':
                default:
                    $values[$field->field_key] = (string) $raw;
                    if (mb_strlen($values[$field->field_key]) > 500) {
                        $errors['custom_fields.'.$field->field_key] = "{$field->label} is too long.";
                    }
                    break;
            }
        }

        return ['values' => $values, 'errors' => $errors];
    }
}
