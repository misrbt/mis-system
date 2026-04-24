// MIS Helpdesk realtime server
//
// Receives events from Laravel via authenticated HTTP POST and fans them
// out to connected browser clients over Socket.io. Clients join ticket-
// scoped rooms ("ticket:<ticket_number>") so each browser only receives
// events for the ticket it's viewing.
//
// Start:  node server.js
//
// Env (see .env.*.example):
//   NODE_ENV          development | staging | production
//   PORT              default 6001
//   REALTIME_SECRET   shared secret — required in staging/production
//   CORS_ORIGIN       comma-separated list; "*" means any (DEV ONLY)
//   TRUST_PROXY       set to 1 when running behind Nginx/CloudFront to
//                     make req.ip reflect the real client IP

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'node:http'
import { Server as SocketServer } from 'socket.io'

const NODE_ENV = process.env.NODE_ENV || 'development'
const PORT = parseInt(process.env.PORT || '6001', 10)
const SECRET = process.env.REALTIME_SECRET || ''
const ORIGINS = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const IS_PROD = NODE_ENV === 'production' || NODE_ENV === 'staging'
const TRUST_PROXY = process.env.TRUST_PROXY === '1'

// Hard fail-fast guards for production
if (IS_PROD) {
  if (!SECRET || SECRET.length < 32) {
    console.error(
      '[realtime] FATAL: REALTIME_SECRET must be at least 32 chars in staging/production'
    )
    process.exit(1)
  }
  if (ORIGINS.length === 0 || ORIGINS.includes('*')) {
    console.error(
      '[realtime] FATAL: CORS_ORIGIN must be an explicit allow-list in staging/production (no "*")'
    )
    process.exit(1)
  }
}
if (!IS_PROD && !SECRET) {
  console.warn('[realtime] WARNING: REALTIME_SECRET empty — /emit is unprotected (dev mode)')
}

const corsOptions = {
  origin: ORIGINS.length && ORIGINS[0] !== '*' ? ORIGINS : true,
  credentials: true,
}

const app = express()
if (TRUST_PROXY) app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(cors(corsOptions))
app.use(express.json({ limit: '512kb' }))

// Minimal request log (prod-friendly — one line, no body)
app.use((req, _res, next) => {
  if (req.path === '/health') return next()
  console.log(
    `[realtime] ${new Date().toISOString()} ${req.method} ${req.path} from ${req.ip}`
  )
  next()
})

const server = http.createServer(app)
const io = new SocketServer(server, { cors: corsOptions })

// --- Routes --------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: NODE_ENV,
    connections: io.engine.clientsCount,
    uptime_s: Math.round(process.uptime()),
  })
})

// HTTP → Socket.io bridge. Laravel POSTs here to broadcast into a room.
//   Headers: X-Realtime-Secret
//   Body:    { event, room, data }
app.post('/emit', (req, res) => {
  const token = req.header('x-realtime-secret') || ''
  if (SECRET && token !== SECRET) {
    return res.status(401).json({ success: false, message: 'Invalid secret' })
  }

  const { event, room, data } = req.body || {}
  if (!event || typeof event !== 'string' || !room || typeof room !== 'string') {
    return res
      .status(422)
      .json({ success: false, message: 'event and room are required strings' })
  }

  io.to(room).emit(event, data ?? null)
  return res.json({ success: true, delivered_to_room: room, event })
})

// Fallback for unknown paths
app.use((_req, res) => res.status(404).json({ success: false, message: 'Not found' }))

// --- WebSocket lifecycle -------------------------------------------------
io.on('connection', (socket) => {
  if (!IS_PROD) console.log(`[realtime] client ${socket.id} connected`)

  socket.on('ticket:join', ({ ticket_number } = {}) => {
    if (!ticket_number || typeof ticket_number !== 'string') return
    const room = `ticket:${ticket_number}`
    socket.join(room)
    socket.emit('ticket:joined', { room })
  })

  socket.on('ticket:leave', ({ ticket_number } = {}) => {
    if (!ticket_number || typeof ticket_number !== 'string') return
    socket.leave(`ticket:${ticket_number}`)
  })

  // Global helpdesk room — used by /helpdesk/tickets list and dashboard to
  // hear about any new/updated ticket system-wide. No identifier needed:
  // join just puts the socket in a single 'helpdesk' room.
  socket.on('helpdesk:join', () => {
    socket.join('helpdesk')
    socket.emit('helpdesk:joined', { room: 'helpdesk' })
  })

  socket.on('helpdesk:leave', () => {
    socket.leave('helpdesk')
  })

  socket.on('disconnect', (reason) => {
    if (!IS_PROD) console.log(`[realtime] client ${socket.id} disconnected (${reason})`)
  })
})

// --- Boot + graceful shutdown -------------------------------------------
server.listen(PORT, () => {
  console.log(
    `[realtime] ${NODE_ENV} Socket.io listening on :${PORT} | origins: ${
      ORIGINS.join(', ') || '(any)'
    } | trustProxy: ${TRUST_PROXY}`
  )
})

const shutdown = (signal) => {
  console.log(`[realtime] received ${signal}, shutting down...`)
  io.close(() => {
    server.close(() => {
      console.log('[realtime] stopped')
      process.exit(0)
    })
  })
  // Force exit if still hanging after 10s
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (err) => {
  console.error('[realtime] unhandledRejection:', err)
})
process.on('uncaughtException', (err) => {
  console.error('[realtime] uncaughtException:', err)
  // Don't crash in prod — let the process manager restart us on repeat failures
})
