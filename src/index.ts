import { randomUUID } from "node:crypto";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { loadConfig } from "./config.js";
import { initClient } from "./apiClient.js";
import { createMcpServer } from "./server.js";

// ── Config ────────────────────────────────────────────────────────────────────

const PORT = Number(process.env["MCP_PORT"] ?? 3333);
const CERT_DIR = path.join(process.cwd(), "certs");
const CERT_FILE = process.env["HTTPS_CERT"] ?? path.join(CERT_DIR, "localhost.pem");
const KEY_FILE  = process.env["HTTPS_KEY"]  ?? path.join(CERT_DIR, "localhost-key.pem");

// Hydrate HTTP client from saved config on boot
const savedConfig = loadConfig();
if (savedConfig) {
  initClient(savedConfig.baseUrl, savedConfig.token);
}

// ── Express (plain, no SDK host-header middleware) ────────────────────────────

const app = express();
app.use(express.json());

// CORS — Claude Desktop connects from a local origin
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Authorization");
  next();
});
app.options("*", (_req, res) => res.sendStatus(200));

// ── Session maps ──────────────────────────────────────────────────────────────

const streamableTransports = new Map<string, StreamableHTTPServerTransport>();
const sseTransports = new Map<string, SSEServerTransport>();

// ── /mcp — Streamable HTTP transport (Claude Desktop connectors) ──────────────

app.all("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    // Reuse existing session
    if (sessionId && streamableTransports.has(sessionId)) {
      await streamableTransports.get(sessionId)!.handleRequest(req, res, req.body);
      return;
    }

    // New session — must be an initialise POST
    if (!sessionId && req.method === "POST" && isInitializeRequest(req.body)) {
      const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid: string) => { streamableTransports.set(sid, transport); },
      });
      transport.onclose = () => {
        if (transport.sessionId) streamableTransports.delete(transport.sessionId);
      };
      await createMcpServer().connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    // GET with no session — Claude Desktop connectivity probe
    if (req.method === "GET" && !sessionId) {
      res.status(200).json({ status: "ok", server: "hyperform-ui-mcp", version: "1.0.0" });
      return;
    }

    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bad Request: send POST with initialize first" },
      id: null,
    });
  } catch (err) {
    console.error("Error in /mcp:", err);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
    }
  }
});

// ── /sse + /messages — SSE legacy fallback ────────────────────────────────────

app.get("/sse", async (req, res) => {
  try {
    const transport = new SSEServerTransport("/messages", res);
    sseTransports.set(transport.sessionId, transport);
    res.on("close", () => sseTransports.delete(transport.sessionId));
    await createMcpServer().connect(transport);
  } catch (err) {
    console.error("Error in /sse:", err);
  }
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query["sessionId"] as string | undefined;
  if (!sessionId || !sseTransports.has(sessionId)) {
    res.status(400).json({ error: "No transport for sessionId" });
    return;
  }
  try {
    await sseTransports.get(sessionId)!.handlePostMessage(req, res, req.body);
  } catch (err) {
    console.error("Error in /messages:", err);
    if (!res.headersSent) res.status(500).send("Internal error");
  }
});

// ── /health ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  const config = loadConfig();
  res.json({ status: "ok", configured: !!config, user: config?.username ?? null, backend: config?.baseUrl ?? null });
});

// ── /preview — serve locally-written page preview JSON files ─────────────────
//   render_page tool writes: preview/<pageName>.json
//   Frontend fetches: /preview/<pageName>.json

const PREVIEW_DIR = path.join(process.cwd(), "preview");
if (!fs.existsSync(PREVIEW_DIR)) fs.mkdirSync(PREVIEW_DIR, { recursive: true });
app.use("/preview", express.static(PREVIEW_DIR));

// ── /api/config — exposes baseUrl + token so the frontend renderer can talk
//   directly to the Hyperform backend (localhost-only, no CORS risk) ───────────

app.get("/api/config", (_req, res) => {
  const config = loadConfig();
  if (!config) {
    res.status(401).json({ error: "MCP server not configured. Run the 'configure' tool first." });
    return;
  }
  res.json({ baseUrl: config.baseUrl, token: config.token });
});

// ── Serve the built json_to_ui frontend (SPA) ────────────────────────────────
//   Build: cd frontend && npm install && npm run build
//   The SPA is served AFTER all API/MCP routes so they take priority.

const FRONTEND_DIST = path.join(process.cwd(), "frontend", "dist");

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  // SPA fallback — any unmatched GET returns index.html so React Router handles routing
  app.get("*", (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
} else {
  // Frontend not built yet — show a helpful message
  app.get("/", (_req, res) => {
    res.status(200).send(
      "<h2>Hyperform MCP Server</h2>" +
      "<p>Frontend not built yet. Run:</p>" +
      "<pre>cd frontend && npm install && npm run build</pre>" +
      "<p>Then restart the server.</p>"
    );
  });
}

// ── Shutdown ──────────────────────────────────────────────────────────────────

async function shutdown() {
  for (const [sid, t] of streamableTransports) {
    try { await t.close(); } catch { /* ignore */ }
    streamableTransports.delete(sid);
  }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ── Start ─────────────────────────────────────────────────────────────────────

function startServer() {
  if (!fs.existsSync(CERT_FILE) || !fs.existsSync(KEY_FILE)) {
    console.error(`
SSL certificates not found in ./certs/
Run  npm run gen-cert  to generate them, then restart.
`);
    process.exit(1);
  }

  const httpsServer = https.createServer(
    { cert: fs.readFileSync(CERT_FILE), key: fs.readFileSync(KEY_FILE) },
    app
  );

  httpsServer.listen(PORT, "0.0.0.0", () => {
    const config = loadConfig();
    const auth = config ? `"${config.username}" → ${config.baseUrl}` : "not configured — run: npm run setup";
    console.log(`
╔══════════════════════════════════════════════════════╗
║        Hyperform UI MCP Server  (HTTPS)              ║
╠══════════════════════════════════════════════════════╣
║  MCP  : https://localhost:${PORT}/mcp               ║
║  SSE  : https://localhost:${PORT}/sse               ║
║  Auth : ${auth.padEnd(43)}║
╚══════════════════════════════════════════════════════╝

Claude Desktop connector URL: https://localhost:${PORT}/mcp
`);
  });

  httpsServer.on("error", (err) => {
    console.error("HTTPS server error:", err);
    process.exit(1);
  });
}

startServer();
