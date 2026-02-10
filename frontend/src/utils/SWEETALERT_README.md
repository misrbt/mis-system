# SweetAlert Utility - Reusable Alert System

A clean, reusable SweetAlert2 wrapper for consistent alerts throughout the inventory system.

## Installation

The utility is already created at `src/utils/sweetAlert.js`. Make sure `sweetalert2` is installed:

```bash
npm install sweetalert2
```

## Quick Start

```javascript
import { showSuccess, showError, showConfirm, showDeleteConfirm } from '@/utils/sweetAlert'

// Success alert
showSuccess('Created!', 'Asset created successfully')

// Error alert
showError('Failed!', 'Something went wrong')

// Confirmation
const result = await showConfirm('Are you sure?', 'This will save changes')
if (result.isConfirmed) {
  // User confirmed
}

// Delete confirmation
const result = await showDeleteConfirm('Laptop HP-001')
if (result.isConfirmed) {
  // Delete the item
}
```

## Available Functions

### 1. `showSuccess(title, message, options)`
Display a success message with a green checkmark icon.

```javascript
showSuccess('Saved!', 'Changes saved successfully')
```

### 2. `showError(title, message, options)`
Display an error message with a red X icon.

```javascript
showError('Failed!', 'Could not save changes')
```

### 3. `showWarning(title, message, options)`
Display a warning message with an amber warning icon.

```javascript
showWarning('Warning', 'This action may have consequences')
```

### 4. `showInfo(title, message, options)`
Display an info message with a blue info icon.

```javascript
showInfo('Note', 'Please review before proceeding')
```

### 5. `showConfirm(title, message, options)`
Display a confirmation dialog with Yes/Cancel buttons.

```javascript
const result = await showConfirm('Confirm', 'Proceed with this action?')
if (result.isConfirmed) {
  // User clicked Yes
}
```

### 6. `showDeleteConfirm(itemName, options)`
Display a delete confirmation dialog.

```javascript
const result = await showDeleteConfirm('Asset HP-001')
if (result.isConfirmed) {
  // Proceed with deletion
}
```

### 7. `showLoading(title)`
Display a loading spinner.

```javascript
showLoading('Saving...')
// ... perform async operation
closeAlert() // Close when done
```

### 8. `closeAlert()`
Close any open alert.

```javascript
closeAlert()
```

### 9. `showToast(message, type, options)`
Display a small toast notification at the top-right corner.

```javascript
showToast('Copied to clipboard', 'success')
showToast('Validation failed', 'error')
showToast('Changes not saved', 'warning')
showToast('New update available', 'info')
```

## Common Patterns

### Creating an Item
```javascript
const handleCreate = async (data) => {
  try {
    showLoading('Creating...')
    await api.post('/assets', data)
    closeAlert()
    showSuccess('Created!', 'Asset created successfully')
  } catch (error) {
    closeAlert()
    showError('Failed', error.response?.data?.message)
  }
}
```

### Deleting an Item
```javascript
const handleDelete = async (item) => {
  const result = await showDeleteConfirm(item.name)
  
  if (result.isConfirmed) {
    try {
      await api.delete(`/assets/${item.id}`)
      showToast('Deleted successfully', 'success')
    } catch (error) {
      showError('Failed', 'Could not delete item')
    }
  }
}
```

### Updating an Item
```javascript
const handleUpdate = async (data) => {
  const result = await showConfirm('Save Changes?', 'Update this asset?')
  
  if (result.isConfirmed) {
    try {
      showLoading('Saving...')
      await api.put(`/assets/${data.id}`, data)
      closeAlert()
      showSuccess('Updated!', 'Changes saved')
    } catch (error) {
      closeAlert()
      showError('Failed', error.message)
    }
  }
}
```

## Migration Guide

### Before (Manual SweetAlert)
```javascript
Swal.fire({
  icon: 'success',
  title: 'Success!',
  text: 'Asset created',
  timer: 3000,
  showConfirmButton: false,
})
```

### After (Using Utility)
```javascript
showSuccess('Success!', 'Asset created')
```

### Before (Confirmation)
```javascript
const result = await Swal.fire({
  icon: 'question',
  title: 'Are you sure?',
  text: 'Delete this item?',
  showCancelButton: true,
  confirmButtonText: 'Yes',
  cancelButtonText: 'Cancel',
})
```

### After (Using Utility)
```javascript
const result = await showConfirm('Are you sure?', 'Delete this item?')
```

## Benefits

✅ **Consistent styling** - All alerts look the same across the app
✅ **Less code** - Simple function calls instead of config objects
✅ **Reusable** - Import once, use everywhere
✅ **Maintainable** - Update styling in one place
✅ **Type-safe** - Clear function signatures
✅ **Flexible** - Pass custom options when needed

## File Locations

- **Utility**: `src/utils/sweetAlert.js`
- **Examples**: `src/utils/sweetAlertExamples.js`
- **Documentation**: `src/utils/SWEETALERT_README.md`
