import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn, Loader2, Mail, Lock, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../assets/logos.png'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')

    try {
      await login(data.login, data.password)
      navigate('/portal')
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left column: Brand + intro */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 text-white p-10 lg:p-12 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 border border-white/20">
                <img src={Logo} alt="MIS System Logo" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">MIS System</p>
                <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">Management Information Portal</h1>
              </div>
            </div>

            <div className="space-y-3 max-w-lg">
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                Access dashboards, manage assets, and stay on top of your organization with a secure, streamlined
                experience.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-white/15 rounded-full border border-white/20">
                  Secure Access
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-white/15 rounded-full border border-white/20">
                  Real-time Insights
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-white/15 rounded-full border border-white/20">
                  Centralized Control
                </span>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-3 text-sm text-white/80">
              <div className="h-px flex-1 bg-white/30" />
              <span>Welcome back</span>
              <div className="h-px flex-1 bg-white/30" />
            </div>
          </div>

          {/* Right column: Form */}
          <div className="p-8 sm:p-10 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-800">Sign In</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm flex items-start gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...register('login', {
                      required: 'Email or username is required',
                    })}
                    className={`w-full pl-10 pr-3 py-3 bg-slate-50 border ${
                      errors.login ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                    } rounded-lg text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your email or username"
                  />
                </div>
                {errors.login && (
                  <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-500">{errors.login.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    className={`w-full pl-10 pr-10 py-3 bg-slate-50 border ${
                      errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                    } rounded-lg text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-center text-slate-500 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/auth/register"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
=======
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_75%_30%,rgba(59,130,246,0.12),rgba(255,255,255,0))]" />
      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32">
              <img src={Logo} alt="MIS System Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800">Welcome back</h2>
              <p className="text-slate-500 text-sm sm:text-base mt-2">Management Information System</p>
            </div>
            <p className="text-slate-600 text-sm sm:text-base max-w-md">
              Sign in to manage assets, requests, and reports from one secure portal.
            </p>
          </div>

          {/* Right column */}
          <div className="flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-xl lg:max-w-[520px] lg:min-w-[420px] bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 lg:p-10">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-800">Sign In</h2>
                <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email or Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      {...register('login', { required: 'Email or username is required' })}
                      className={`w-full pl-10 pr-3 py-3 text-base bg-slate-50 border ${
                        errors.login ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                      } rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter your email or username"
                    />
                  </div>
                  {errors.login && <p className="mt-1.5 text-sm text-red-500">{errors.login.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { required: 'Password is required' })}
                      className={`w-full pl-10 pr-10 py-3 text-base bg-slate-50 border ${
                        errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                      } rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-lg shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-center text-slate-500 text-sm">
                  Don't have an account?{' '}
                  <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>
>>>>>>> staging
        </div>
      </div>
    </div>
  )
}

export default Login
