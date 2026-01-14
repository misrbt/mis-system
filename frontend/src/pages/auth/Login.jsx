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
    <div className="w-full">
      {/* Logo and Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
            <img
              src={Logo}
              alt="MIS System Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <p className="text-slate-500 text-sm">Management Information System</p>
      </div>

      {/* Login Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        {/* Card Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">Sign In</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm flex items-start gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email/Username Field */}
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

          {/* Password Field */}
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

          {/* Submit Button */}
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

        {/* Divider */}
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
    </div>
  </div>
  )
}

export default Login
