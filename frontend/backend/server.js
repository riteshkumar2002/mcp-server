import http from 'http'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 4000
const DATA_FILE = process.env.DATA_FILE || process.argv[2]

if (!DATA_FILE) {
  console.error('Error: DATA_FILE environment variable or file path argument is required')
  console.error('Usage: node server.js <path-to-schema.json>')
  console.error('Or set DATA_FILE environment variable')
  process.exit(1)
}

const sendJson = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(JSON.stringify(data))
}

const sendError = (res, status, message) => {
  sendJson(res, status, { error: message })
}

const parseUrl = (req) => {
  try {
    return new URL(req.url, `http://${req.headers.host}`)
  } catch {
    return null
  }
}

const loadData = async () => {
  const raw = await readFile(DATA_FILE, 'utf8')
  return JSON.parse(raw)
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    return res.end()
  }

  const url = parseUrl(req)
  if (!url) {
    return sendError(res, 400, 'Invalid request URL')
  }

  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed')
  }

  const route = url.pathname.replace(/\/+$/, '')
  try {
    const data = await loadData()
    switch (route) {
      case '/api/page/home':
        return sendJson(res, 200, data)
      case '/api/schema':
        return sendJson(res, 200, data.schema ?? null)
      case '/api/uiSchema':
        return sendJson(res, 200, data.uiSchema ?? null)
      default:
        return sendError(res, 404, 'Not found')
    }
  } catch (error) {
    return sendError(res, 500, 'Unable to load schema data')
  }
})

server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`)
})
