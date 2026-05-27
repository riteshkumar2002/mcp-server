import fs from "fs";
import path from "path";
import { spawn, execSync, ChildProcess } from "child_process";
import { chromium, Browser, Page } from "@playwright/test";
import { z } from "zod";
import { buildUiSchema, buildSchema } from "impaktapps-ui-builder";

const MCP_ROOT = path.resolve(__dirname, "..", "..");
const FRONTEND_DIR = path.join(MCP_ROOT, "frontend");
const PREVIEW_DIR = path.join(MCP_ROOT, "preview");
const SCREENSHOTS_DIR = path.join(MCP_ROOT, "playwright-results", "screenshots");

// ── Session state (persists across tool calls) ────────────────────────────────

let rendererProc: ChildProcess | null = null;
let browser: Browser | null = null;
let activePage: Page | null = null;

// ── Schemas ───────────────────────────────────────────────────────────────────

export const previewLaunchSessionSchema = z.object({
  schemaFilePath: z.string().describe(
    "Absolute path to a JSON file containing { \"schema\": {...}, \"uiSchema\": {...} }. " +
    "Starts the renderer and opens a Playwright browser session at http://localhost:5173."
  ),
  headless: z.boolean().optional().default(true).describe(
    "Run browser headless (default true). Set false to watch the browser on screen."
  ),
});

export const previewScreenshotSchema = z.object({
  selector: z.string().optional().describe(
    "Optional CSS selector to screenshot a specific element. Omit to capture the full page."
  ),
  label: z.string().optional().describe(
    "Optional label appended to the screenshot filename for identification."
  ),
});

export const previewCloseSessionSchema = z.object({});

export const htmlPreviewSchema = z.object({
  htmlFilePath: z.string().describe(
    "Absolute path to the HTML file to render. " +
    "The file is opened directly in a Playwright browser via a file:// URL — no server needed."
  ),
  headless: z.boolean().optional().default(true).describe(
    "Run browser headless (default true). Set false to watch the browser on screen."
  ),
  waitUntil: z.enum(["load", "domcontentloaded", "networkidle"]).optional().default("load").describe(
    "Navigation wait condition (default: 'load'). Use 'networkidle' for pages with async content."
  ),
});

export const previewSessionFromConfigSchema = z.object({
  config: z.record(z.unknown()).describe(
    "The page config object. buildUiSchema and buildSchema are called on this to derive " +
    "the uiSchema and schema, which are written to a preview file and served to the renderer."
  ),
  pageName: z.string().describe(
    "Page name used as the preview file name, e.g. 'page_manualSign'. " +
    "File is written to <mcp-root>/preview/<pageName>.json."
  ),
  headless: z.boolean().optional().default(true).describe(
    "Run browser headless (default true). Set false to watch the browser on screen."
  ),
});

// ── Process helpers ───────────────────────────────────────────────────────────

function killByPort(port: number): void {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const pids = new Set<string>();
      for (const line of out.split("\n")) {
        if (!line.includes("LISTENING")) continue;
        const pid = line.trim().split(/\s+/).pop();
        if (pid && pid !== "0") pids.add(pid);
      }
      for (const pid of pids) {
        try { execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" }); } catch {}
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { shell: "/bin/bash" });
    }
  } catch {
    // port not in use
  }
}

function stopRenderer(): void {
  if (rendererProc) {
    const pid = rendererProc.pid;
    rendererProc = null;
    if (pid) {
      try {
        if (process.platform === "win32") {
          execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
        } else {
          process.kill(-pid, "SIGKILL");
        }
      } catch {}
    }
  }
  killByPort(4000);
  killByPort(5173);
}

function spawnRenderer(schemaPath: string): ChildProcess {
  stopRenderer();
  const isWin = process.platform === "win32";
  const proc = spawn(
    isWin ? "node.exe" : "node",
    ["start.js", schemaPath],
    {
      cwd: FRONTEND_DIR,
      detached: false,
      stdio: "pipe",
      env: { ...process.env, NODE_ENV: "development" },
    }
  );
  proc.stdout?.on("data", (d: Buffer) => process.stderr.write(`[pw-session] ${d}`));
  proc.stderr?.on("data", (d: Buffer) => process.stderr.write(`[pw-session] ${d}`));
  proc.on("exit", () => { rendererProc = null; });
  rendererProc = proc;
  return proc;
}

async function waitForUrl(url: string, timeoutMs = 40_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (res.status < 500) return true;
    } catch {}
    await new Promise<void>((r) => setTimeout(r, 800));
  }
  return false;
}

async function closeBrowser(): Promise<void> {
  activePage = null;
  if (browser) {
    try { await browser.close(); } catch {}
    browser = null;
  }
}

async function closeSession(): Promise<void> {
  await closeBrowser();
  stopRenderer();
}

// ── Tool handlers ─────────────────────────────────────────────────────────────

export async function toolPreviewLaunchSession(
  args: z.infer<typeof previewLaunchSessionSchema>
) {
  if (!fs.existsSync(args.schemaFilePath)) {
    return {
      content: [{ type: "text" as const, text: `File not found: ${args.schemaFilePath}` }],
      isError: true,
    };
  }

  // Close any existing session before starting a new one
  await closeSession();

  // Start renderer
  try {
    spawnRenderer(args.schemaFilePath);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Failed to start renderer: ${msg}` }],
      isError: true,
    };
  }

  // Wait for frontend to be accessible
  const ready = await waitForUrl("http://localhost:5173");
  if (!ready) {
    await closeSession();
    return {
      content: [{
        type: "text" as const,
        text: "Frontend did not become accessible within 40 seconds. " +
          "Ensure npm dependencies are installed in the frontend directory.",
      }],
      isError: true,
    };
  }

  // Launch Playwright browser and navigate
  try {
    browser = await chromium.launch({ headless: args.headless ?? true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    activePage = await context.newPage();
    await activePage.goto("http://localhost:5173", { waitUntil: "networkidle", timeout: 20_000 });
    await activePage.waitForTimeout(1500);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await closeSession();
    return {
      content: [{ type: "text" as const, text: `Failed to launch browser: ${msg}` }],
      isError: true,
    };
  }

  // Take initial screenshot
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const screenshotPath = path.join(SCREENSHOTS_DIR, `session-start-${Date.now()}.png`);
  let screenshotData: string | null = null;
  try {
    const buf = await activePage.screenshot({ path: screenshotPath, fullPage: true });
    screenshotData = buf.toString("base64");
  } catch {}

  const content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }> = [
    {
      type: "text" as const,
      text: [
        `Session launched.`,
        `URL: http://localhost:5173`,
        `Schema: ${args.schemaFilePath}`,
        `Screenshot saved: ${screenshotPath}`,
        ``,
        `Use preview_screenshot to capture more screenshots.`,
        `Use preview_close_session when done.`,
      ].join("\n"),
    },
  ];

  if (screenshotData) {
    content.push({ type: "image" as const, data: screenshotData, mimeType: "image/png" });
  }

  return { content };
}

export async function toolPreviewScreenshot(
  args: z.infer<typeof previewScreenshotSchema>
) {
  if (!activePage) {
    return {
      content: [{
        type: "text" as const,
        text: "No active session. Call preview_launch_session first.",
      }],
      isError: true,
    };
  }

  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const suffix = args.label ? `-${args.label.replace(/[^a-zA-Z0-9_-]/g, "_")}` : "";
  const screenshotPath = path.join(SCREENSHOTS_DIR, `screenshot${suffix}-${Date.now()}.png`);

  try {
    let buf: Buffer;
    if (args.selector) {
      const element = activePage.locator(args.selector);
      await element.waitFor({ timeout: 5_000 });
      buf = await element.screenshot({ path: screenshotPath });
    } else {
      buf = await activePage.screenshot({ path: screenshotPath, fullPage: true });
    }

    const base64 = buf.toString("base64");
    return {
      content: [
        {
          type: "text" as const,
          text: `Screenshot saved: ${screenshotPath}${args.selector ? `\nSelector: ${args.selector}` : " (full page)"}`,
        },
        { type: "image" as const, data: base64, mimeType: "image/png" },
      ],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Screenshot failed: ${msg}` }],
      isError: true,
    };
  }
}

export async function toolPreviewCloseSession(
  _args: z.infer<typeof previewCloseSessionSchema>
) {
  const hadSession = activePage !== null || rendererProc !== null;
  await closeSession();
  return {
    content: [{
      type: "text" as const,
      text: hadSession
        ? "Session closed. Browser and renderer stopped. Ports 4000 and 5173 freed."
        : "No active session was running.",
    }],
  };
}

export async function toolHtmlPreview(
  args: z.infer<typeof htmlPreviewSchema>
) {
  const resolved = path.resolve(args.htmlFilePath);

  if (!fs.existsSync(resolved)) {
    return {
      content: [{ type: "text" as const, text: `File not found: ${resolved}` }],
      isError: true,
    };
  }

  // Close any existing session before opening a new one
  await closeSession();

  const fileUrl = `file:///${resolved.replace(/\\/g, "/")}`;

  try {
    browser = await chromium.launch({ headless: args.headless ?? true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    activePage = await context.newPage();
    await activePage.goto(fileUrl, {
      waitUntil: args.waitUntil ?? "load",
      timeout: 20_000,
    });
    await activePage.waitForTimeout(500);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await closeSession();
    return {
      content: [{ type: "text" as const, text: `Failed to open HTML file in browser: ${msg}` }],
      isError: true,
    };
  }

  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const screenshotPath = path.join(
    SCREENSHOTS_DIR,
    `html-preview-${Date.now()}.png`
  );

  let screenshotData: string | null = null;
  try {
    const buf = await activePage.screenshot({ path: screenshotPath, fullPage: true });
    screenshotData = buf.toString("base64");
  } catch {}

  const content: Array<
    { type: "text"; text: string } | { type: "image"; data: string; mimeType: string }
  > = [
    {
      type: "text" as const,
      text: [
        `HTML file rendered.`,
        `File      : ${resolved}`,
        `URL       : ${fileUrl}`,
        `Screenshot: ${screenshotPath}`,
        ``,
        `Use preview_screenshot to take more screenshots.`,
        `Use preview_close_session when done.`,
      ].join("\n"),
    },
  ];

  if (screenshotData) {
    content.push({ type: "image" as const, data: screenshotData, mimeType: "image/png" });
  }

  return { content };
}

export async function toolPreviewSessionFromConfig(
  args: z.infer<typeof previewSessionFromConfigSchema>
) {
  // Build uiSchema and schema from config
  let uiSchema: unknown;
  let schema: unknown;
  try {
    uiSchema = buildUiSchema(args.config, {});
    schema   = buildSchema(args.config) ?? {};
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Failed to build uiSchema/schema from config: ${msg}` }],
      isError: true,
    };
  }

  // Write preview file
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  const previewFile = path.join(PREVIEW_DIR, `${args.pageName}.json`);
  try {
    fs.writeFileSync(previewFile, JSON.stringify({ schema, uiSchema }, null, 2), "utf-8");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Failed to write preview file: ${msg}` }],
      isError: true,
    };
  }

  // Close any existing session before starting a new one
  await closeSession();

  // Start renderer
  try {
    spawnRenderer(previewFile);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Failed to start renderer: ${msg}` }],
      isError: true,
    };
  }

  // Wait for frontend to be accessible
  const ready = await waitForUrl("http://localhost:5173");
  if (!ready) {
    await closeSession();
    return {
      content: [{
        type: "text" as const,
        text: "Frontend did not become accessible within 40 seconds. " +
          "Ensure npm dependencies are installed in the frontend directory.",
      }],
      isError: true,
    };
  }

  // Launch Playwright browser and navigate
  try {
    browser = await chromium.launch({ headless: args.headless ?? true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    activePage = await context.newPage();
    await activePage.goto("http://localhost:5173", { waitUntil: "networkidle", timeout: 20_000 });
    await activePage.waitForTimeout(1500);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await closeSession();
    return {
      content: [{ type: "text" as const, text: `Failed to launch browser: ${msg}` }],
      isError: true,
    };
  }

  // Take initial screenshot
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const screenshotPath = path.join(SCREENSHOTS_DIR, `session-start-${Date.now()}.png`);
  let screenshotData: string | null = null;
  try {
    const buf = await activePage.screenshot({ path: screenshotPath, fullPage: true });
    screenshotData = buf.toString("base64");
  } catch {}

  const content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }> = [
    {
      type: "text" as const,
      text: [
        `Session launched from config.`,
        `Page    : ${args.pageName}`,
        `File    : ${previewFile}`,
        `URL     : http://localhost:5173`,
        `Screenshot: ${screenshotPath}`,
        ``,
        `uiSchema and schema were derived automatically via buildUiSchema / buildSchema.`,
        `Use preview_screenshot to capture more screenshots.`,
        `Use preview_close_session when done.`,
      ].join("\n"),
    },
  ];

  if (screenshotData) {
    content.push({ type: "image" as const, data: screenshotData, mimeType: "image/png" });
  }

  return { content };
}
