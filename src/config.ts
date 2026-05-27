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

export function loadConfig(): McpConfig | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw) as McpConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: McpConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export function clearConfig(): void {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
}

export function updateToken(token: string, tokenId: number): void {
  const config = loadConfig();
  if (!config) return;
  config.token = token;
  config.tokenId = tokenId;
  saveConfig(config);
}
