import { z } from "zod";
import fs from "fs";
import path from "path";

export const readFileSchema = z.object({
  filePath: z.string().describe("Absolute or relative path to the text file to read"),
  encoding: z.enum(["utf8", "utf-8", "ascii", "base64", "binary", "hex", "latin1"])
    .optional()
    .default("utf8")
    .describe("File encoding (default: utf8)"),
  maxBytes: z.number().int().positive().optional().default(200_000)
    .describe("Maximum bytes to return. Defaults to 200000 to avoid oversized MCP responses."),
});

export async function toolReadFile(args: z.infer<typeof readFileSchema>) {
  const resolved = path.resolve(args.filePath);

  if (!fs.existsSync(resolved)) {
    return {
      content: [{
        type: "text" as const,
        text: `Error: file does not exist at '${resolved}'.`,
      }],
      isError: true,
    };
  }

  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    return {
      content: [{
        type: "text" as const,
        text: `Error: '${resolved}' is not a file.`,
      }],
      isError: true,
    };
  }

  const maxBytes = args.maxBytes ?? 200_000;
  const buffer = fs.readFileSync(resolved);
  const truncated = buffer.length > maxBytes;
  const data = buffer.subarray(0, maxBytes).toString(args.encoding as BufferEncoding);

  return {
    content: [{
      type: "text" as const,
      text: [
        `Path: ${resolved}`,
        `Size: ${stat.size} bytes`,
        truncated ? `Returned: first ${maxBytes} bytes (truncated)` : "Returned: full file",
        "",
        data,
      ].join("\n"),
    }],
  };
}

// ── write_file ────────────────────────────────────────────────────────────────

export const writeFileSchema = z.object({
  filePath: z.string().describe("Absolute or relative path where the file should be written"),
  content: z.string().describe("Content to write into the file"),
  encoding: z.enum(["utf8", "utf-8", "ascii", "base64", "binary", "hex", "latin1"])
    .optional()
    .default("utf8")
    .describe("File encoding (default: utf8)"),
  overwrite: z.boolean().optional().default(true)
    .describe("If false, the tool will error when the file already exists (default: true)"),
});

export async function toolWriteFile(args: z.infer<typeof writeFileSchema>) {
  const resolved = path.resolve(args.filePath);

  if (!args.overwrite && fs.existsSync(resolved)) {
    return {
      content: [{
        type: "text" as const,
        text: `Error: file already exists at '${resolved}' and overwrite=false.`,
      }],
    };
  }

  const dir = path.dirname(resolved);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(resolved, args.content, { encoding: args.encoding as BufferEncoding });

  const stats = fs.statSync(resolved);
  return {
    content: [{
      type: "text" as const,
      text: [
        `File written successfully.`,
        `Path    : ${resolved}`,
        `Size    : ${stats.size} bytes`,
        `Encoding: ${args.encoding}`,
      ].join("\n"),
    }],
  };
}

// ── list_files ────────────────────────────────────────────────────────────────

export const listFilesSchema = z.object({
  dirPath: z.string().describe("Absolute or relative path to the directory to list"),
  recursive: z.boolean().optional().default(false)
    .describe("If true, list files in all subdirectories recursively (default: false)"),
  includeHidden: z.boolean().optional().default(false)
    .describe("If true, include files and folders that start with '.' (default: false)"),
  pattern: z.string().optional()
    .describe("Optional glob-style extension filter, e.g. '.ts' or '.json' — only files whose name ends with this string are returned"),
});

function walk(dir: string, recursive: boolean, includeHidden: boolean, pattern?: string): string[] {
  let results: string[] = [];
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (!includeHidden && entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) results = results.concat(walk(full, recursive, includeHidden, pattern));
    } else {
      if (!pattern || entry.name.endsWith(pattern)) {
        results.push(full);
      }
    }
  }
  return results;
}

export async function toolListFiles(args: z.infer<typeof listFilesSchema>) {
  const resolved = path.resolve(args.dirPath);

  if (!fs.existsSync(resolved)) {
    return {
      content: [{
        type: "text" as const,
        text: `Error: directory '${resolved}' does not exist.`,
      }],
    };
  }

  const stat = fs.statSync(resolved);
  if (!stat.isDirectory()) {
    return {
      content: [{
        type: "text" as const,
        text: `Error: '${resolved}' is not a directory.`,
      }],
    };
  }

  const files = walk(resolved, args.recursive ?? false, args.includeHidden ?? false, args.pattern);

  if (files.length === 0) {
    return {
      content: [{
        type: "text" as const,
        text: `No files found in '${resolved}'${args.pattern ? ` matching '*${args.pattern}'` : ""}.`,
      }],
    };
  }

  const lines = [
    `Directory : ${resolved}`,
    `Recursive : ${args.recursive ?? false}`,
    `File count: ${files.length}`,
    "",
    ...files,
  ];

  return {
    content: [{ type: "text" as const, text: lines.join("\n") }],
  };
}
