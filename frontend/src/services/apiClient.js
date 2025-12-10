import axios from 'axios'
import { getApiBaseUrl } from '../utils/env'

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
