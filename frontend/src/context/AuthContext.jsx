import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../services/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('auth_token'))
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Set up axios interceptor for auth header
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await apiClient.get('/auth/profile')
          if (response.data.success) {
            setUser(response.data.data.user)
            setIsAuthenticated(true)
          }
        } catch {
          // Token is invalid, clear it
          localStorage.removeItem('auth_token')
          setToken(null)
          setUser(null)
          setIsAuthenticated(false)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [token])

  const login = async (loginCredential, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        login: loginCredential,
        password,
      })

      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data
        localStorage.setItem('auth_token', authToken)
        setToken(authToken)
        setUser(userData)
        setIsAuthenticated(true)
        return userData
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      throw new Error(message)
    }
  }

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData)

      if (response.data.success) {
        const { user: newUser, token: authToken } = response.data.data
        localStorage.setItem('auth_token', authToken)
        setToken(authToken)
        setUser(newUser)
        setIsAuthenticated(true)
        return newUser
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      const errors = error.response?.data?.errors
      if (errors) {
        // Get first error message
        const firstError = Object.values(errors)[0]
        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError)
      }
      throw new Error(message)
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await apiClient.post('/auth/refresh')
      if (response.data.success) {
        const { token: newToken } = response.data.data
        localStorage.setItem('auth_token', newToken)
        setToken(newToken)
        return newToken
      }
    } catch {
      // Token refresh failed, logout user
      await logout()
      throw new Error('Session expired. Please login again.')
    }
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
