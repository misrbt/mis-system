const normalizeUrl = (value) => (value ? value.replace(/\/+$/, '') : value)

export const getApiBaseUrl = () => {
  const apiUrl = normalizeUrl(import.meta.env.VITE_API_URL)
  if (apiUrl) {
    return apiUrl
  }

  const baseUrl = normalizeUrl(import.meta.env.VITE_API_BASE_URL)
  if (baseUrl) {
    return `${baseUrl}/api`
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api'
  }

  return '/api'
}
