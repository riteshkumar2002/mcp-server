import { z } from "zod";
import { login } from "../auth.js";
import { loadConfig, clearConfig } from "../config.js";
import { initClient } from "../apiClient.js";

// ── configure ─────────────────────────────────────────────────────────────────

export const configureSchema = z.object({
  backendUrl: z
    .string()
    .url()
    .describe("Base URL of the Hyperform3 backend, e.g. 'http://192.168.1.10:8081'"),
  username: z.string().min(1).describe("Your Hyperform3 username"),
  password: z.string().min(1).describe("Your Hyperform3 password"),
});

export async function toolConfigure(args: z.infer<typeof configureSchema>) {
  // Strip trailing slash so all API paths are consistent
  const baseUrl = args.backendUrl.replace(/\/$/, "");

  let config;
  try {
    config = await login(baseUrl, args.username, args.password);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [
        {
          type: "text" as const,
          text: `Authentication failed: ${message}\n\nPlease check your backend URL, username, and password.`,
        },
      ],
      isError: true,
    };
  }

  // Reinitialize the shared HTTP client with the fresh token
  initClient(config.baseUrl, config.token);

  return {
    content: [
      {
        type: "text" as const,
        text: [
          "✓ Successfully authenticated with Hyperform3.",
          `  Backend : ${config.baseUrl}`,
          `  User    : ${config.username}`,
          `  Token ID: ${config.tokenId}`,
          "",
          "Configuration saved to ~/.hyperform-mcp/config.json.",
          "You can now use all MCP tools. The JWT is refreshed automatically when it expires.",
        ].join("\n"),
      },
    ],
  };
}

// ── check_auth_status ─────────────────────────────────────────────────────────

export const checkAuthStatusSchema = z.object({});

export function toolCheckAuthStatus(_args: z.infer<typeof checkAuthStatusSchema>) {
  const config = loadConfig();

  if (!config) {
    return {
      content: [
        {
          type: "text" as const,
          text: [
            "⚠ Not configured.",
            "",
            "Use the 'configure' tool to connect:",
            "  configure({ backendUrl, username, password })",
          ].join("\n"),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: [
          "✓ Configured and ready.",
          `  Backend : ${config.baseUrl}`,
          `  User    : ${config.username}`,
          `  Token ID: ${config.tokenId}`,
        ].join("\n"),
      },
    ],
  };
}

// ── logout ────────────────────────────────────────────────────────────────────

export const logoutSchema = z.object({});

export function toolLogout(_args: z.infer<typeof logoutSchema>) {
  clearConfig();
  return {
    content: [
      {
        type: "text" as const,
        text: "Logged out. Configuration cleared from ~/.hyperform-mcp/config.json.\nUse 'configure' to log in again.",
      },
    ],
  };
}
