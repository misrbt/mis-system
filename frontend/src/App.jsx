import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './routes'

// Simple loading component
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#666'
    }}>
      Loading...
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App
