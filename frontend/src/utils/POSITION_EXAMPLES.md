# Position Examples for SweetAlert Utility

## Available Positions

All alert functions now support a `position` option:

- `'top'` - Top center
- `'top-start'` - Top left
- `'top-end'` - Top right
- `'center'` - Center (default)
- `'center-start'` - Center left
- `'center-end'` - Center right
- `'bottom'` - Bottom center
- `'bottom-start'` - Bottom left
- `'bottom-end'` - Bottom right

## Usage Examples

### Success Alert with Position

```javascript
import { showSuccess } from '@/utils/sweetAlert'

// Top right corner
showSuccess('Saved!', 'Changes saved successfully', {
  position: 'top-end'
})

// Top center
showSuccess('Created!', 'Asset created', {
  position: 'top'
})

// Bottom right
showSuccess('Updated!', 'Profile updated', {
  position: 'bottom-end'
})
```

### Error Alert with Position

```javascript
import { showError } from '@/utils/sweetAlert'

// Show error at top
showError('Failed!', 'Could not save changes', {
  position: 'top'
})

// Show error on the right side
showError('Error', 'Something went wrong', {
  position: 'center-end'
})
```

### Toast Notifications with Position

```javascript
import { showToast } from '@/utils/sweetAlert'

// Default: top-end
showToast('Saved successfully', 'success')

// Bottom right corner
showToast('Copied to clipboard', 'info', {
  position: 'bottom-end'
})

// Bottom left
showToast('Item deleted', 'success', {
  position: 'bottom-start'
})

// Top left
showToast('New notification', 'info', {
  position: 'top-start'
})
```

### Confirmation with Position

```javascript
import { showConfirm } from '@/utils/sweetAlert'

// Top center confirmation
const result = await showConfirm(
  'Confirm Changes',
  'Save these changes?',
  { position: 'top' }
)

if (result.isConfirmed) {
  // User confirmed
}
```

### Delete Confirmation with Position

```javascript
import { showDeleteConfirm } from '@/utils/sweetAlert'

// Top confirmation for critical actions
const result = await showDeleteConfirm('Important Data', {
  position: 'top'
})

if (result.isConfirmed) {
  // Delete item
}
```

## Real-World Scenarios

### 1. Quick Actions (Top-End Toasts)
For quick, non-intrusive notifications like copy, save, etc.

```javascript
const handleCopy = () => {
  navigator.clipboard.writeText(data)
  showToast('Copied!', 'success', { position: 'top-end' })
}
```

### 2. Important Confirmations (Center)
For critical decisions that need user attention

```javascript
const handleDeleteAll = async () => {
  const result = await showDeleteConfirm('All Data', {
    position: 'center' // Default, but explicit for clarity
  })
  
  if (result.isConfirmed) {
    // Delete all
  }
}
```

### 3. Form Validation (Top)
For form-related feedback

```javascript
const handleSubmit = async (formData) => {
  if (!formData.name) {
    showError('Validation Failed', 'Name is required', {
      position: 'top'
    })
    return
  }
  
  try {
    await api.post('/items', formData)
    showSuccess('Created!', '', { position: 'top' })
  } catch (error) {
    showError('Failed', error.message, { position: 'top' })
  }
}
```

### 4. Side Panel Actions (Center-End)
For actions in side panels or drawers

```javascript
const handleSidebarAction = () => {
  showSuccess('Updated!', 'Settings saved', {
    position: 'center-end'
  })
}
```

### 5. Bottom Notifications (Bottom-Start/End)
For persistent notifications that don't block the UI

```javascript
const handleBackgroundTask = () => {
  showToast('Export started', 'info', {
    position: 'bottom-end',
    timer: 5000
  })
}
```

## Combining with Other Options

You can combine position with other options:

```javascript
showSuccess('Success!', 'Operation completed', {
  position: 'top-end',
  timer: 2000,
  timerProgressBar: true,
  showConfirmButton: true,
  confirmButtonText: 'View Details'
})
```

## Best Practices

1. **Use `top-end` for quick toasts** - Non-intrusive for minor actions
2. **Use `center` for confirmations** - Demands user attention
3. **Use `top` for form validation** - Near the form submit button
4. **Use `bottom-end` for background tasks** - Out of the way but visible
5. **Be consistent** - Use the same positions for similar actions throughout your app

## Visual Guide

```
┌─────────────────────────────────┐
│ top-start    top     top-end    │ ← Top positions
│                                 │
│                                 │
│ center-start center center-end  │ ← Center positions
│                                 │
│                                 │
│ bottom-start bottom bottom-end  │ ← Bottom positions
└─────────────────────────────────┘
```
