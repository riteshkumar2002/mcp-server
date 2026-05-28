import fs from "fs";
import path from "path";
import os from "os";

export interface McpConfig {
  baseUrl: string;
  username: string;
  password: string;
  token: string;
  tokenId: number;
  userId?: number;
}

const CONFIG_DIR = path.join(os.homedir(), ".hyperform-mcp");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

// undefined = not yet loaded; null = loaded, file absent; McpConfig = loaded and present
let configCache: McpConfig | null | undefined = undefined;

export function loadConfig(): McpConfig | null {
  if (configCache !== undefined) return configCache;
  try {
    if (!fs.existsSync(CONFIG_FILE)) { configCache = null; return null; }
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    configCache = JSON.parse(raw) as McpConfig;
    return configCache;
  } catch {
    configCache = null;
    return null;
  }
}

export function saveConfig(config: McpConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  configCache = config;
}

export function clearConfig(): void {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
  configCache = null;
}

export function updateToken(token: string, tokenId: number): void {
  const config = loadConfig();
  if (!config) return;
  config.token = token;
  config.tokenId = tokenId;
  saveConfig(config);
}
