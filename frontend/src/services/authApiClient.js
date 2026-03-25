import axios from 'axios'

const normalizeUrl = (value) => (value ? value.replace(/\/+$/, '') : value)

const getAuthApiBaseUrl = () => {
  const authUrl = normalizeUrl(import.meta.env.VITE_AUTH_API_URL)
  if (authUrl) {
    return authUrl
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:8001/api'
  }

  return '/auth-api'
}

const authApiClient = axios.create({
  baseURL: getAuthApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
})

// Request interceptor to add auth token
authApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
authApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default authApiClient
