# MCP Server - Hyperform UI Builder

An MCP (Model Context Protocol) server implementation for building and managing Hyperform UI pages with AI-assisted page generation and validation.

## Overview

This project provides a server-based interface for creating, editing, and validating Hyperform pages with support for:
- Page configuration management
- UI schema generation
- Visual page preview and validation using Playwright
- Integration with the Hyperform3 backend
- Multiple UI components (charts, forms, tables, etc.)

## Project Structure

- **src/** - TypeScript source code
  - `server.ts` - Main MCP server entry point
  - `apiClient.ts` - Backend API communication
  - `tools/` - Tool implementations for page operations
  - `skills/` - AI skill definitions
- **frontend/** - React-based preview application (Vite + TypeScript)
- **playwright/** - End-to-end testing and page validation
- **preview/** - Sample page configurations
- **.claude/commands/hyperform-ui-skill/** - Claude AI skill definitions for page building

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- GitHub account (for repository)

### Installation

```bash
npm install
```

### Development

Build TypeScript:
```bash
npm run build
```

Start the MCP server:
```bash
npm start
```

Start the preview frontend (in another terminal):
```bash
cd frontend && npm install && npm start
```

### Testing

Run Playwright tests:
```bash
npm run test
```

## Usage

The server provides MCP tools for:
- Creating and updating Hyperform pages
- Fetching page configurations
- Rendering page previews
- Validating page schemas
- Managing file uploads

## Configuration

Create a `.env` file in the root directory:
```
BACKEND_URL=http://localhost:8080
PORT=3000
```

## Documentation

- [CLAUDE.md](CLAUDE.md) - Claude AI integration instructions
- [impaktapps-jsonforms-page-builder.skill.md](impaktapps-jsonforms-page-builder.skill.md) - Page builder skill documentation

## License

Proprietary - All rights reserved
