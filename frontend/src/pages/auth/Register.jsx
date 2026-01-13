import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, UserPlus, Loader2, Mail, Lock, User, AtSign, Shield, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../assets/logos.png'

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')

    try {
      await registerUser({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
      })
      navigate('/portal')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicators
  const passwordChecks = [
    { label: 'At least 8 characters', valid: password?.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password || '') },
    { label: 'Lowercase letter', valid: /[a-z]/.test(password || '') },
    { label: 'Number', valid: /\d/.test(password || '') },
    { label: 'Special character', valid: /[@$!%*?&]/.test(password || '') },
  ]

  return (
    <div className="w-full">
      {/* Logo and Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
            <img
              src={Logo}
              alt="MIS System Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm">Management Information System</p>
      </div>

      {/* Register Form Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 p-5 sm:p-6">
        {/* Card Header */}
        <div className="text-center mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Create Account</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Join the MIS System</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-3 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm flex items-start gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-3">
          {/* Full Name Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                {...register('name', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                className={`w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-50 border ${
                  errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                } rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                <AtSign className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' },
                  pattern: {
                    value: /^[a-zA-Z0-9_-]+$/,
                    message: 'Letters, numbers, dashes and underscores only',
                  },
                })}
                className={`w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-50 border ${
                  errors.username ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                } rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                placeholder="johndoe"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-50 border ${
                  errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                } rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                placeholder="john.doe@company.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must meet all requirements',
                  },
                })}
                className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-50 border ${
                  errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                } rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength indicators */}
            {password && (
              <div className="mt-2 space-y-1">
                {passwordChecks.map((check, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className={`w-3 h-3 flex-shrink-0 ${check.valid ? 'text-green-500' : 'text-slate-300'}`} />
                    <span className={`text-xs ${check.valid ? 'text-green-600' : 'text-slate-400'}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-50 border ${
                  errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
                } rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Divider - Hidden on mobile */}
        <div className="hidden sm:block mt-4 pt-4 border-t border-slate-200">
          <p className="text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
