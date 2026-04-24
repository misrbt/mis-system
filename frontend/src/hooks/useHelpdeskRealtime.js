import { useEffect, useState } from 'react'
import { getSocket } from '../services/realtimeClient'

/**
 * Subscribe the current page to the global "helpdesk" Socket.io room. While
 * mounted, the browser hears about every new ticket (and whatever else we
 * publish on the helpdesk channel) so the admin views — /helpdesk/tickets,
 * dashboard — can update without a page refresh.
 *
 * handlers — optional callbacks, any of which may be omitted:
 *   onTicketCreated(payload) — fired when a new ticket lands (staff or public)
 *   onTicketUpdated(payload) — fired when a ticket is mutated (future-proofing)
 *
 * Returns { connected } so the UI can render a live/offline indicator.
 */
export function useHelpdeskRealtime({ onTicketCreated, onTicketUpdated } = {}) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = getSocket()

    const handleConnect = () => {
      setConnected(true)
      socket.emit('helpdesk:join')
    }
    const handleDisconnect = () => setConnected(false)
    const handleCreated = (payload) => onTicketCreated?.(payload)
    const handleUpdated = (payload) => onTicketUpdated?.(payload)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('ticket.created', handleCreated)
    socket.on('ticket.updated', handleUpdated)

    // If the singleton socket is already connected when this hook mounts,
    // run the connect handler ourselves so we join the room immediately.
    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.emit('helpdesk:leave')
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('ticket.created', handleCreated)
      socket.off('ticket.updated', handleUpdated)
    }
  }, [onTicketCreated, onTicketUpdated])

  return { connected }
}
