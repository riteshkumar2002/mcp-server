import fs from "fs";
import { z } from "zod";

export const renderPageSchema = z.object({
  filePath: z.string().describe(
    "Absolute path to a JSON file containing { \"schema\": {...}, \"uiSchema\": {...} }. " +
    "The backend server will serve this file to the frontend renderer."
  ),
});

export function toolRenderPage(args: z.infer<typeof renderPageSchema>) {
  if (!fs.existsSync(args.filePath)) {
    return {
      content: [{ type: "text" as const, text: `File not found: ${args.filePath}` }],
      isError: true,
    };
  }

  const backendDir = "D:\\Act21files\\mcp-server\\frontend";

  return {
    content: [{
      type: "text" as const,
      text: [
        `Open http://localhost:5173 in your browser to render the page.`,
        ``,
        `Start (or restart) the renderer with a single command:`,
        ``,
        `  cd ${backendDir}`,
        `  node start.js "${args.filePath}"`,
        ``,
        `This starts both the backend (port 4000) and the Vite frontend (port 5173).`,
        ``,
        `To also run Playwright validation automatically, use the validate_page tool instead.`,
      ].join("\n"),
    }],
  };
}
