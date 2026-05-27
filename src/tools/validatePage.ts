import fs from "fs";
import path from "path";
import { spawn, execSync, ChildProcess } from "child_process";
import { z } from "zod";

// ── Paths ─────────────────────────────────────────────────────────────────────
// __dirname in compiled output is dist/tools — two levels up is the server root
const MCP_ROOT = path.resolve(__dirname, "..", "..");
const FRONTEND_DIR = path.join(MCP_ROOT, "frontend");
const GENERATED_DIR = path.join(FRONTEND_DIR, "generated");
const SCHEMA_FILE = path.join(GENERATED_DIR, "generated-schema.json");
const RESULTS_DIR = path.join(MCP_ROOT, "playwright-results");
const SCREENSHOTS_DIR = path.join(RESULTS_DIR, "screenshots");

// ── Process state (module-level — survives across tool calls) ─────────────────
let activeRenderer: ChildProcess | null = null;

// ── Schemas ──────────────────────────────────────────────────────────────────
const validationCheckSchema = z.object({
  type: z.enum(["text", "label", "selector"]).describe(
    "How to locate: 'text' for visible text, 'label' for form label, 'selector' for CSS selector"
  ),
  value: z.string().describe("The text content, label text, or CSS selector to look for"),
  description: z.string().optional().describe("Human-readable description used in error messages"),
});

export type ValidationCheck = z.infer<typeof validationCheckSchema>;

export const validatePageSchema = z.object({
  uiSchema: z.record(z.unknown()).describe("The uiSchema object for the page"),
  schema: z.record(z.unknown()).describe("The JSON Schema object for the page"),
  validationChecks: z.array(validationCheckSchema).describe(
    "Elements to verify are present in the rendered page. " +
    "Pass an empty array to only verify the page renders without errors."
  ),
  pageName: z.string().optional().describe("Page name for logging"),
  attemptNumber: z.number().optional().describe("Current attempt number (1-3). For AI retry tracking."),
});

// ── Process management ───────────────────────────────────────────────────────

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
  if (activeRenderer) {
    const pid = activeRenderer.pid;
    activeRenderer = null;
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
  // Also kill by port to catch any orphaned processes
  killByPort(4000);
  killByPort(5173);
}

function startRenderer(schemaPath: string): ChildProcess {
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

  proc.stdout?.on("data", (d: Buffer) => process.stderr.write(`[renderer] ${d}`));
  proc.stderr?.on("data", (d: Buffer) => process.stderr.write(`[renderer] ${d}`));

  activeRenderer = proc;
  return proc;
}

// ── Port readiness polling ────────────────────────────────────────────────────

async function waitForUrl(url: string, timeoutMs = 40_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (res.status < 500) return true;
    } catch {
      // not ready yet
    }
    await new Promise<void>((r) => setTimeout(r, 800));
  }
  return false;
}

// ── Playwright runner ─────────────────────────────────────────────────────────

interface PlaywrightResult {
  passed: boolean;
  output: string;
  screenshotPaths: string[];
  errorDetails: string;
}

function clearScreenshots(): void {
  try {
    if (fs.existsSync(SCREENSHOTS_DIR)) {
      for (const f of fs.readdirSync(SCREENSHOTS_DIR)) {
        if (f.endsWith(".png")) fs.unlinkSync(path.join(SCREENSHOTS_DIR, f));
      }
    }
  } catch {}
}

function collectScreenshots(): string[] {
  try {
    if (!fs.existsSync(SCREENSHOTS_DIR)) return [];
    return fs
      .readdirSync(SCREENSHOTS_DIR)
      .filter((f) => f.endsWith(".png"))
      .map((f) => path.join(SCREENSHOTS_DIR, f));
  } catch {
    return [];
  }
}

function runPlaywright(checks: ValidationCheck[]): Promise<PlaywrightResult> {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  clearScreenshots();

  return new Promise<PlaywrightResult>((resolve) => {
    const isWin = process.platform === "win32";
    const proc = spawn(
      isWin ? "npx.cmd" : "npx",
      ["playwright", "test", "--config", "playwright.config.ts"],
      {
        cwd: MCP_ROOT,
        env: {
          ...process.env,
          VALIDATION_CHECKS: JSON.stringify(checks),
        },
      }
    );

    let stdout = "";
    let stderr = "";
    proc.stdout?.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("close", (code) => {
      const passed = code === 0;
      resolve({
        passed,
        output: (stdout + stderr).slice(0, 4000),
        screenshotPaths: collectScreenshots(),
        errorDetails: passed ? "" : ((stderr || stdout).slice(0, 2000)),
      });
    });

    proc.on("error", (err) => {
      resolve({
        passed: false,
        output: err.message,
        screenshotPaths: [],
        errorDetails:
          `Failed to run Playwright: ${err.message}\n` +
          `Make sure @playwright/test is installed: npm install && npx playwright install`,
      });
    });
  });
}

// ── Main tool ─────────────────────────────────────────────────────────────────

export async function toolValidatePage(args: z.infer<typeof validatePageSchema>) {
  const attempt = args.attemptNumber ?? 1;
  const pageName = args.pageName ?? "page";

  // 1. Save JSON to the generated schema file
  try {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
    fs.writeFileSync(
      SCHEMA_FILE,
      JSON.stringify({ schema: args.schema, uiSchema: args.uiSchema }, null, 2),
      "utf-8"
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Failed to save schema: ${msg}` }], isError: true };
  }

  // 2. Start renderer
  try {
    startRenderer(SCHEMA_FILE);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Failed to start renderer: ${msg}` }], isError: true };
  }

  // 3. Wait for frontend to become accessible
  const ready = await waitForUrl("http://localhost:5173");
  if (!ready) {
    stopRenderer();
    return {
      content: [{
        type: "text" as const,
        text: "Frontend did not become accessible within 40 seconds. Check that npm dependencies are installed in the frontend directory.",
      }],
      isError: true,
    };
  }

  // 4. Run Playwright validation
  const pwResult = await runPlaywright(args.validationChecks);

  // 5. Stop renderer
  stopRenderer();

  // 6. Build response
  const status = pwResult.passed ? "PASSED ✓" : "FAILED ✗";
  const lines: string[] = [
    `## Validation ${status} — Attempt ${attempt}`,
    ``,
    `**Page:** ${pageName}`,
    `**Schema file:** \`${SCHEMA_FILE}\``,
    `**Checks run:** ${args.validationChecks.length}`,
    ``,
  ];

  if (pwResult.screenshotPaths.length) {
    lines.push(`**Screenshots:**`);
    pwResult.screenshotPaths.forEach((p) => lines.push(`  - \`${p}\``));
    lines.push("");
  }

  if (!pwResult.passed) {
    lines.push(`**Failure details:**`);
    lines.push("```");
    lines.push(pwResult.errorDetails);
    lines.push("```");
    lines.push("");

    if (attempt < 3) {
      lines.push(
        `**Next step:** Analyze the failure, fix the uiSchema/schema, ` +
        `and call \`validate_page\` again with \`attemptNumber: ${attempt + 1}\`.`
      );
    } else {
      lines.push(`**Max retries reached (3/3).** Review the schema manually.`);
    }
    lines.push("");
  }

  lines.push(`**Playwright output:**`);
  lines.push("```");
  lines.push(pwResult.output);
  lines.push("```");

  return {
    content: [{ type: "text" as const, text: lines.join("\n") }],
  };
}
