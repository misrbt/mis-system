import { io } from 'socket.io-client'

// Single shared Socket.io connection for the whole app. Opened lazily on first
// use; reused across all pages so we never open more than one WebSocket.
let socket = null

/**
 * Determine the realtime URL:
 *   - If VITE_REALTIME_URL is set, use it verbatim (dev points at http://127.0.0.1:6001)
 *   - Otherwise connect to the current origin (same host as the frontend).
 *     In staging/prod the Nginx vhost proxies /socket.io/ → Node localhost:6001,
 *     so clients stay on the same origin: wss://mis.rbtbank.com/socket.io/
 */
const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || window.location.origin

export function getSocket() {
  if (!socket) {
    socket = io(REALTIME_URL, {
      // Prefer wss in production (browser auto-upgrades based on URL scheme).
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      // path defaults to /socket.io/ — matches our Nginx reverse proxy rule
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
