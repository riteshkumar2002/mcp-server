import http from 'http'
import { readFile } from 'fs/promises'
import { createRequire } from 'module'

const PORT = process.env.PORT || 4000
const DATA_FILE = process.env.DATA_FILE || process.argv[2]

if (!DATA_FILE) {
  console.error('Error: DATA_FILE environment variable or config file path argument is required')
  console.error('Usage: node server.js <path-to-config.json>')
  console.error('Or set DATA_FILE environment variable')
  process.exit(1)
}

// Load buildUiSchema / buildSchema / buildConfig from impaktapps-ui-builder.
// The package lives in the parent node_modules (D:\Act21files\mcp-server\node_modules)
// and is a UMD/CJS bundle, so we use createRequire to load it from an ES-module context.
const require = createRequire(import.meta.url)
const { buildUiSchema, buildSchema, buildConfig } = require('impaktapps-ui-builder')

// Hyperform theme — must match the theme used by the MCP server when saving pages
const pageBuilderStore = {
  theme: {
    myTheme: {
      palette: {
        mode: 'light',
        common: { black: '#000000', white: '#ffffff' },
        primary:    { main: '#0FAFAF', light: '#3fbfbf', dark: '#0F7B81', contrastText: '#ffffff' },
        secondary:  { main: '#F0F3F6', light: '#D1D3D4', dark: '#EBEBEB', contrastText: '#A7A9AC' },
        error:      { main: '#FF0000' },
        text:       { primary: '#000000', secondary: '#58595B', disabled: '#AFAFAF' },
        background: { heading: '#ffffff', default: '#ffffff', paper: '#ffffff' },
        action:     { hover: '#00747B', active: '#0D8B92' },
        typography: {},
        shape: { borderRadius: 4 },
      },
      typography: { fontFamily: 'Calibri', fontSize: 14 },
      table: {
        header: { alignment: 'center' },
        columns: {
          alignment: { integer: 'right', string: 'left', amount: 'right', date: 'right', dateTime: 'right' },
        },
      },
    },
  },
}

const sendJson = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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

/**
 * Read the config file and derive uiSchema + schema via the builder.
 *
 * File format accepted:
 *   { "config": { "name": "page_xyz", "type": "page", ... } }   ← preferred
 *   { "name": "page_xyz", "type": "page", ... }                  ← bare config object
 *
 * Both formats produce the same output.
 */
const loadData = async () => {
  const raw = await readFile(DATA_FILE, 'utf8')
  const file = JSON.parse(raw)

  // Support both { config: {...} } and a bare config object
  const config = (file && typeof file === 'object' && file.config) ? file.config : file

  const uiSchema   = buildUiSchema(config, pageBuilderStore)
  const schema     = buildSchema(config) ?? {}
  const builtConfig = buildConfig(config)

  return { config: builtConfig, uiSchema, schema }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    return res.end()
  }

  const url = parseUrl(req)
  if (!url) return sendError(res, 400, 'Invalid request URL')

  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed')

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
      case '/api/config':
        return sendJson(res, 200, data.config ?? null)
      default:
        return sendError(res, 404, 'Not found')
    }
  } catch (error) {
    console.error('Error loading/building config:', error)
    return sendError(res, 500, 'Unable to load or build config data')
  }
})

server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`)
})
