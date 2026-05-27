import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Get the schema file path from command line argument
const schemaPath = process.argv[2]

if (!schemaPath) {
  console.error('Error: Schema file path is required')
  console.error('Usage: node start.js <path-to-schema.json>')
  console.error('Example: node start.js ./backend/schema.json')
  process.exit(1)
}

// Resolve to absolute path
const absoluteSchemaPath = path.resolve(process.cwd(), schemaPath)

console.log('🚀 Starting application...')
console.log(`📄 Using schema: ${absoluteSchemaPath}`)
console.log()

// Array to track child processes
const processes = []

// Spawn backend server
console.log('🔧 Starting backend server on port 4000...')
const backendProcess = spawn('node', [path.join(__dirname, 'backend', 'server.js'), absoluteSchemaPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATA_FILE: absoluteSchemaPath,
    NODE_ENV: 'development'
  }
})

processes.push(backendProcess)

// Wait a moment before starting frontend to ensure backend is ready
setTimeout(() => {
  console.log()
  console.log('🎨 Starting frontend dev server on port 5173...')
  
  // Determine npm command based on OS
  const isWindows = os.platform() === 'win32'
  const npmCmd = isWindows ? 'npm.cmd' : 'npm'
  
  const frontendProcess = spawn(npmCmd, ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  })
  
  processes.push(frontendProcess)
  
  frontendProcess.on('error', (err) => {
    console.error('Frontend process error:', err)
  })
}, 1000)

backendProcess.on('error', (err) => {
  console.error('Backend process error:', err)
})

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Shutting down application...')
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM')
    }
  })
  
  setTimeout(() => {
    process.exit(0)
  }, 1000)
})

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Shutting down application...')
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM')
    }
  })
  
  setTimeout(() => {
    process.exit(0)
  }, 1000)
})

// Handle errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM')
    }
  })
  process.exit(1)
})
