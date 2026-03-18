import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { VIEW_TYPES } from '../constants'

const STORAGE_KEY = 'employee-transitions-view'

const TransitionViewContext = createContext(null)

export function TransitionViewProvider({ children }) {
  const [currentView, setCurrentViewState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && Object.values(VIEW_TYPES).includes(saved)) {
        return saved
      }
    }
    return VIEW_TYPES.ENHANCED_TABLE
  })

  const setCurrentView = useCallback((view) => {
    if (Object.values(VIEW_TYPES).includes(view)) {
      setCurrentViewState(view)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, view)
      }
    }
  }, [])

  // Keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle when not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return
      }

      // Alt + number to switch views
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            setCurrentView(VIEW_TYPES.VISUAL_GRID)
            break
          case '2':
            e.preventDefault()
            setCurrentView(VIEW_TYPES.FLOW_BUILDER)
            break
          case '3':
            e.preventDefault()
            setCurrentView(VIEW_TYPES.SPLIT_PANEL)
            break
          case '4':
            e.preventDefault()
            setCurrentView(VIEW_TYPES.ENHANCED_TABLE)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCurrentView])

  return (
    <TransitionViewContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </TransitionViewContext.Provider>
  )
}

export function useTransitionView() {
  const context = useContext(TransitionViewContext)
  if (!context) {
    throw new Error('useTransitionView must be used within a TransitionViewProvider')
  }
  return context
}
