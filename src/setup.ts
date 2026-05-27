/**
 * Interactive setup script.
 * Run with:  npm run setup
 *
 * Prompts for backend URL, username, and password,
 * verifies them by calling /auth/authenticate, then
 * saves the config to ~/.hyperform-mcp/config.json.
 */

import readline from "readline";
import { login } from "./auth.js";
import { loadConfig, clearConfig } from "./config.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    if (hidden) {
      // Suppress echo for password input
      process.stdout.write(question);
      process.stdin.setRawMode?.(true);
      process.stdin.resume();
      let input = "";
      process.stdin.setEncoding("utf8");
      const onData = (ch: string) => {
        if (ch === "\r" || ch === "\n") {
          process.stdin.setRawMode?.(false);
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(input);
        } else if (ch === "") {
          // Ctrl+C
          process.stdin.setRawMode?.(false);
          process.exit(0);
        } else if (ch === "" || ch === "\b") {
          // Backspace
          if (input.length > 0) {
            input = input.slice(0, -1);
          }
        } else {
          input += ch;
        }
      };
      process.stdin.on("data", onData);
    } else {
      rl.question(question, (answer) => resolve(answer.trim()));
    }
  });
}

async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   Hyperform UI MCP — Setup               ║");
  console.log("╚══════════════════════════════════════════╝\n");

  const existing = loadConfig();
  if (existing) {
    console.log(`Already configured:`);
    console.log(`  Backend : ${existing.baseUrl}`);
    console.log(`  User    : ${existing.username}\n`);
    const overwrite = await ask("Reconfigure? (y/N): ");
    if (overwrite.toLowerCase() !== "y") {
      console.log("Setup cancelled. Existing config kept.");
      rl.close();
      return;
    }
    clearConfig();
  }

  // Collect inputs
  const backendUrl = await ask("Backend URL (e.g. http://192.168.1.10:8081): ");
  if (!backendUrl) {
    console.error("Backend URL is required.");
    rl.close();
    process.exit(1);
  }

  const username = await ask("Username: ");
  if (!username) {
    console.error("Username is required.");
    rl.close();
    process.exit(1);
  }

  const password = await ask("Password: ", true);
  if (!password) {
    console.error("Password is required.");
    rl.close();
    process.exit(1);
  }

  const userIdRaw = await ask("User ID (numeric ID from Hyperform3, e.g. 1): ");
  const userId = userIdRaw ? parseInt(userIdRaw, 10) : undefined;
  if (userIdRaw && isNaN(userId!)) {
    console.error("User ID must be a number.");
    rl.close();
    process.exit(1);
  }

  rl.close();

  // Authenticate
  console.log("\nConnecting to Hyperform3...");
  try {
    const config = await login(backendUrl.replace(/\/$/, ""), username, password);
    // Store userId if provided (auth response doesn't include it)
    if (userId) {
      config.userId = userId;
      const { saveConfig } = await import("./config.js");
      saveConfig(config);
    }
    console.log("\n✓ Authentication successful!");
    console.log(`  Backend : ${config.baseUrl}`);
    console.log(`  User    : ${config.username}`);
    console.log(`  User ID : ${config.userId ?? "(not set)"}`);
    console.log(`  Token ID: ${config.tokenId}`);
    console.log("\nConfig saved to ~/.hyperform-mcp/config.json");
    console.log("\nYou can now start the MCP server with:  npm start");
    console.log('Then add it to Claude Desktop as:  http://localhost:3333/mcp\n');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n✗ Authentication failed: ${message}`);
    console.error("Please check your backend URL, username, and password.\n");
    process.exit(1);
  }
}

main();
