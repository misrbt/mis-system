import { useRouteError, Link } from 'react-router-dom'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

const ErrorPage = () => {
  const error = useRouteError()
  console.error('Application Error:', error)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Oops! Something went wrong.
          </h1>
          
          <p className="text-slate-600 mb-6">
            We encountered an unexpected error.
            {error?.message && (
              <span className="block mt-2 text-sm bg-red-50 text-red-700 p-2 rounded border border-red-100 font-mono">
                {error.message}
              </span>
            )}
          </p>

          <div className="flex flex-col gap-3">
             <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
            
            <Link
              to="/portal"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Return to Portal
            </Link>
          </div>
        </div>
        
        {import.meta.env.MODE === 'development' && error?.stack && (
             <div className="bg-slate-900 p-4 overflow-x-auto border-t border-slate-800">
             <summary className="text-xs font-mono text-slate-400 mb-2 cursor-pointer">Stack Trace</summary>
            <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap">
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ErrorPage
