/**
 * Stdio entry point — use this with claude_desktop_config.json.
 * No HTTPS or certificates needed.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { initClient } from "./apiClient.js";
import { createMcpServer } from "./server.js";

const savedConfig = loadConfig();
if (savedConfig) {
  initClient(savedConfig.baseUrl, savedConfig.token);
}

const server = createMcpServer();
const transport = new StdioServerTransport();

process.stderr.write("MCP stdio server starting...\n");
server.connect(transport).catch((err) => {
  process.stderr.write(`Fatal: ${err}\n`);
  process.exit(1);
});
