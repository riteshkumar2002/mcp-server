import fs from "fs";
import path from "path";
import { spawn, exec, execSync, ChildProcess } from "child_process";
import { z } from "zod";
import { buildUiSchema, buildSchema } from "impaktapps-ui-builder";

const MCP_ROOT = path.resolve(__dirname, "..", "..");
const FRONTEND_DIR = path.join(MCP_ROOT, "frontend");
const PREVIEW_DIR = path.join(MCP_ROOT, "preview");

let activePreview: ChildProcess | null = null;

// ── Schemas ───────────────────────────────────────────────────────────────────

export const launchPreviewSchema = z.object({
  schemaFilePath: z.string().describe(
    "Absolute path to a JSON file containing { \"schema\": {...}, \"uiSchema\": {...} }. " +
    "The renderer will serve this file and open the UI at http://localhost:5173."
  ),
});

export const closePreviewSchema = z.object({});

export const previewFromConfigSchema = z.object({
  config: z.record(z.unknown()).describe(
    "The page config object. buildUiSchema and buildSchema are called on this to derive " +
    "the uiSchema and schema, which are written to a preview file and served to the renderer."
  ),
  pageName: z.string().describe(
    "Page name used as the preview file name, e.g. 'page_manualSign'. " +
    "File is written to <mcp-root>/preview/<pageName>.json."
  ),
});

// ── Process helpers ───────────────────────────────────────────────────────────

function killByPort(port: number): Promise<void> {
  return new Promise((resolve) => {
    if (process.platform === "win32") {
      exec(`netstat -ano | findstr :${port}`, { encoding: "utf8" }, (_err, out) => {
        if (!out) { resolve(); return; }
        const pids = new Set<string>();
        for (const line of out.split("\n")) {
          if (!line.includes("LISTENING")) continue;
          const pid = line.trim().split(/\s+/).pop();
          if (pid && pid !== "0") pids.add(pid);
        }
        if (pids.size === 0) { resolve(); return; }
        let pending = pids.size;
        for (const pid of pids) {
          exec(`taskkill /PID ${pid} /F`, () => { if (--pending === 0) resolve(); });
        }
      });
    } else {
      exec(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { shell: "/bin/bash" }, () => resolve());
    }
  });
}

async function stopPreview(): Promise<void> {
  if (activePreview) {
    const pid = activePreview.pid;
    activePreview = null;
    if (pid) {
      try {
        if (process.platform === "win32") {
          execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
        } else {
          process.kill(-pid, "SIGKILL");
        }
      } catch {}
    }
    // tree kill freed ports 4000 and 5173 — no port scan needed
    return;
  }
  // no handle: orphan from a crash — fall back to async port scan
  await Promise.all([killByPort(4000), killByPort(5173)]);
}

async function startPreviewProcess(schemaPath: string): Promise<ChildProcess> {
  await stopPreview();

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

  proc.stdout?.on("data", (d: Buffer) => process.stderr.write(`[preview] ${d}`));
  proc.stderr?.on("data", (d: Buffer) => process.stderr.write(`[preview] ${d}`));
  proc.on("exit", () => { activePreview = null; });

  activePreview = proc;
  return proc;
}

async function waitForUrl(url: string, timeoutMs = 20_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1_000) });
      if (res.status < 500) return true;
    } catch {
      // not ready yet
    }
    await new Promise<void>((r) => setTimeout(r, 200));
  }
  return false;
}

// ── Tool handlers ─────────────────────────────────────────────────────────────

export async function toolLaunchPreview(args: z.infer<typeof launchPreviewSchema>) {
  if (!fs.existsSync(args.schemaFilePath)) {
    return {
      content: [{ type: "text" as const, text: `File not found: ${args.schemaFilePath}` }],
      isError: true,
    };
  }

  try {
    await startPreviewProcess(args.schemaFilePath);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Failed to start preview: ${msg}` }],
      isError: true,
    };
  }

  const ready = await waitForUrl("http://localhost:5173");
  if (!ready) {
    await stopPreview();
    return {
      content: [{
        type: "text" as const,
        text: "Frontend did not become accessible within 40 seconds. " +
          "Check that npm dependencies are installed in the frontend directory.",
      }],
      isError: true,
    };
  }

  return {
    content: [{
      type: "text" as const,
      text: [
        `Preview launched successfully.`,
        ``,
        `Open http://localhost:5173 in your browser to view the rendered UI.`,
        ``,
        `Schema file: ${args.schemaFilePath}`,
        ``,
        `Call close_preview when you are done to stop the renderer.`,
      ].join("\n"),
    }],
  };
}

export async function toolClosePreview(_args: z.infer<typeof closePreviewSchema>) {
  const wasRunning = activePreview !== null;
  await stopPreview();
  return {
    content: [{
      type: "text" as const,
      text: wasRunning
        ? "Preview renderer stopped. Ports 4000 and 5173 have been freed."
        : "No active preview was running.",
    }],
  };
}

export async function toolPreviewFromConfig(args: z.infer<typeof previewFromConfigSchema>) {
  // Build uiSchema and schema from config using the same builder the frontend uses
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

  // Launch renderer
  try {
    await startPreviewProcess(previewFile);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text" as const, text: `Failed to start preview: ${msg}` }],
      isError: true,
    };
  }

  const ready = await waitForUrl("http://localhost:5173");
  if (!ready) {
    await stopPreview();
    return {
      content: [{
        type: "text" as const,
        text: "Frontend did not become accessible within 40 seconds. " +
          "Check that npm dependencies are installed in the frontend directory.",
      }],
      isError: true,
    };
  }

  return {
    content: [{
      type: "text" as const,
      text: [
        `Preview launched from config.`,
        ``,
        `Page    : ${args.pageName}`,
        `File    : ${previewFile}`,
        `URL     : http://localhost:5173`,
        ``,
        `uiSchema and schema were derived automatically via buildUiSchema / buildSchema.`,
        `Call close_preview when done to stop the renderer.`,
      ].join("\n"),
    }],
  };
}
