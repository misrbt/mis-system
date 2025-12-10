import { useQuery } from '@tanstack/react-query'
import { ping } from '../services/pingService'

const usePing = () =>
  useQuery({
    queryKey: ['ping-status'],
    queryFn: ping,
    staleTime: 30_000,
  })

export default usePing
