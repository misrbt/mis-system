import { useEffect, useState } from 'react'
import { getSocket } from '../services/realtimeClient'

/**
 * Subscribe to realtime events for a single ticket. While the component
 * is mounted, the browser joins the ticket's Socket.io room and fires
 * `onRemark(remark)` whenever a new comment is posted by either side.
 *
 * Returns { connected } so UI can show a live/offline indicator.
 *
 * ticketNumber — the TKT-YYYY-NNNNNN identifier (falsy = no-op)
 * onRemark     — callback; invoked for every `remark.created` event
 */
export function useTicketRealtime(ticketNumber, onRemark) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!ticketNumber) return undefined

    const socket = getSocket()

    const handleConnect = () => {
      setConnected(true)
      socket.emit('ticket:join', { ticket_number: ticketNumber })
    }
    const handleDisconnect = () => setConnected(false)
    const handleRemark = (payload) => onRemark?.(payload)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('remark.created', handleRemark)

    // If the singleton socket is already connected when the hook mounts,
    // run the connect handler ourselves to set state + join the room.
    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.emit('ticket:leave', { ticket_number: ticketNumber })
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('remark.created', handleRemark)
    }
  }, [ticketNumber, onRemark])

  return { connected }
}
