import { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown, User } from 'lucide-react'

function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Search...',
  label,
  displayField = 'name',
  secondaryField,
  tertiaryField,
  emptyMessage = 'No results found',
  allowClear = true,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase()
    const primaryMatch = option[displayField]?.toLowerCase().includes(searchLower)
    const secondaryMatch = secondaryField && option[secondaryField]?.toLowerCase().includes(searchLower)
    const tertiaryMatch = tertiaryField && option[tertiaryField]?.toLowerCase().includes(searchLower)
    return primaryMatch || secondaryMatch || tertiaryMatch
  })

  // Get selected option
  const selectedOption = options.find(opt => opt.id === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      default:
        break
    }
  }

  const handleSelect = (option) => {
    onChange(option.id)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(0)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setSearchTerm('')
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setHighlightedIndex(0)
  }

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between hover:border-slate-400 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption ? (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-slate-900 truncate">
                {selectedOption[displayField]}
              </span>
              {secondaryField && selectedOption[secondaryField] && (
                <span className="text-xs text-slate-500 truncate">
                  {selectedOption[secondaryField]}
                  {tertiaryField && selectedOption[tertiaryField] &&
                    ` • ${selectedOption[tertiaryField]}`
                  }
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-sm">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2">
          {allowClear && selectedOption && (
            <X
              className="w-4 h-4 text-slate-400 hover:text-slate-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-200 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder={`Search ${label?.toLowerCase() || 'items'}...`}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex flex-col ${
                    highlightedIndex === index ? 'bg-blue-50' : ''
                  } ${
                    value === option.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <span className="text-sm font-medium text-slate-900">
                    {option[displayField]}
                  </span>
                  {secondaryField && option[secondaryField] && (
                    <span className="text-xs text-slate-600 mt-0.5">
                      {option[secondaryField]}
                      {tertiaryField && option[tertiaryField] &&
                        ` • ${option[tertiaryField]}`
                      }
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
