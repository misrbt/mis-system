import apiClient from './apiClient'

export const ping = async () => {
  const { data } = await apiClient.get('/ping')
  return data
}
