import axios from "axios";
import { saveConfig, updateToken, type McpConfig } from "./config.js";

interface AuthResponse {
  token?: string;
  jwtToken?: string;
  tokenId?: number;
  id?: number;
  userId?: number;
  user?: { id?: number; userId?: number; [key: string]: unknown };
  [key: string]: unknown;
}

interface RefreshResponse {
  token: string;
  tokenId: number;
}

export async function login(
  baseUrl: string,
  username: string,
  password: string
): Promise<McpConfig> {
  const res = await axios.post<AuthResponse>(
    `${baseUrl}/auth/authenticate`,
    { username, password },
    { headers: { "Content-Type": "application/json" }, timeout: 15000 }
  );

  const data = res.data;
  const token = (data["token"] ?? data["jwtToken"] ?? "") as string;
  const tokenId = (data["tokenId"] ?? data["id"] ?? 0) as number;
  // userId may be top-level or nested under a 'user' object
  const userId = (
    data["userId"] ??
    data["user"]?.["id"] ??
    data["user"]?.["userId"] ??
    undefined
  ) as number | undefined;

  if (!token) {
    throw new Error("Authentication succeeded but no JWT token was returned. Check the backend response.");
  }

  const config: McpConfig = { baseUrl, username, password, token, tokenId, userId };
  saveConfig(config);
  return config;
}

export async function refreshToken(
  baseUrl: string,
  tokenId: number
): Promise<{ token: string; tokenId: number }> {
  const res = await axios.post<RefreshResponse>(
    `${baseUrl}/auth/refreshtoken`,
    { tokenId },
    { headers: { "Content-Type": "application/json" }, timeout: 15000 }
  );

  const { token, tokenId: newTokenId } = res.data;
  updateToken(token, newTokenId);
  return { token, tokenId: newTokenId };
}
