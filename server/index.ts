/* eslint-disable no-console */

import { createServer } from 'node:http'
import process from 'node:process'
import { createApp, createRouter, defineEventHandler, readBody, toNodeListener } from 'h3'
import { WebSocketServer } from 'ws'

const PORT = Number(process.env.PORT) || 5632

const app = createApp({
  debug: true,
  onError: (error) => {
    console.error('Error:', error)
  },
  onRequest: async (event) => {
    console.log('Request:', event.path)
  },

})
const router = createRouter()
app.use(router)
router.get('/', defineEventHandler(() => {
  return 'hello world'
}))
router.get('/json', defineEventHandler(() => {
  return {
    data: '123',
  }
}))
router.post('/test', defineEventHandler(async (ev) => {
  const body = await readBody(ev)
  return {
    data: '123',
    body,
  }
}))
const wss = new WebSocketServer({ path: '/_ws', port: PORT + 1 }, () => {
  console.log(`socket is running at http://127.0.0.1:${PORT + 1}${'/_ws'}`)
})
wss.on('connection', (ws) => {
  console.log('connection')
  ws.send('connection')
})
wss.on('error', () => {
  console.log('error')
})

const server = createServer(toNodeListener(app))
server.listen(PORT, () => {
  console.log(`server is running at http://127.0.0.1:${PORT}/`)
})
