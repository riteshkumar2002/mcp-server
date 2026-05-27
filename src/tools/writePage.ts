import { z } from "zod";
import axios from "axios";
import { masterSave, masterAction, masterDelete } from "../apiClient.js";
import { loadConfig } from "../config.js";

// ── helpers ───────────────────────────────────────────────────────────────────

function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    const body = data !== undefined ? JSON.stringify(data, null, 2) : "(no response body)";
    return `HTTP ${status ?? "?"} from backend:\n${body}`;
  }
  return err instanceof Error ? err.message : String(err);
}

// ── save_record ───────────────────────────────────────────────────────────────

export const saveRecordSchema = z.object({
  entityName: z.string().describe(
    "Fully-qualified Java entity class name, e.g. 'com.act21.hyperform3.entity.page.PageStaging'"
  ),
  entityValue: z.record(z.unknown()).describe(
    [
      "Full PageStaging entity to save. Required fields:",
      "  id          — staging record ID (string/number) or null for a new record",
      "  name        — page name, e.g. 'page_eSign'",
      "  uiSchema    — the uiSchema JSON object",
      "  schema      — the schema JSON object",
      "  config      — the page config object",
      "  main        — main record ID (number) or null",
      "  templateName — template ID number, e.g. 1",
      "  promotionStatus — 'N'",
      "  isDeleted   — 'N'",
      "  pageUrl     — e.g. 'Template-1/page_eSign'",
    ].join("\n")
  ),
  userId: z.number().int().positive().optional().describe(
    "User ID for the save request. Auto-read from stored config if omitted. Ask the user if not found."
  ),
});

export async function toolSaveRecord(args: z.infer<typeof saveRecordSchema>) {
  const config = loadConfig();
  const userId = args.userId ?? config?.userId;

  if (!userId) {
    return {
      content: [{
        type: "text" as const,
        text: [
          "userId is required but is not stored in config.",
          "Please provide it explicitly as the 'userId' parameter.",
          "You can find your userId by checking your Hyperform3 profile or asking your system administrator.",
        ].join("\n"),
      }],
    };
  }

  // Validate that the critical entityValue fields are present before sending
  const ev = args.entityValue;
  const missing: string[] = [];
  for (const f of ["name", "uiSchema", "schema", "config", "templateName", "promotionStatus", "isDeleted"]) {
    if (ev[f] === undefined) missing.push(f);
  }
  if (missing.length > 0) {
    return {
      content: [{
        type: "text" as const,
        text: `entityValue is missing required fields: ${missing.join(", ")}.\nPlease provide them before saving.`,
      }],
    };
  }

  try {
    const result = await masterSave(args.entityName, args.entityValue, userId);
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ success: true, result }, null, 2),
      }],
    };
  } catch (err) {
    return {
      content: [{
        type: "text" as const,
        text: `Save failed.\n\n${extractApiError(err)}`,
      }],
    };
  }
}

// ── approve_or_reject_record ──────────────────────────────────────────────────

// export const masterActionSchema = z.object({
//   entityName: z.string().describe(
//     "Fully-qualified Java entity class name, e.g. 'com.act21.hyperform3.entity.page.PageStaging'"
//   ),
//   action: z.enum(["A", "R"]).describe("'A' = Approve,  'R' = Reject"),
//   entityValue: z.record(z.unknown()).describe(
//     "The full entity object to approve or reject (as returned by get_page_record or get_staging_by_main_id)."
//   ),
// });

// export async function toolMasterAction(args: z.infer<typeof masterActionSchema>) {
//   try {
//     await masterAction(args.entityName, args.action, args.entityValue);
//     const label = args.action === "A" ? "approved" : "rejected";
//     return {
//       content: [{
//         type: "text" as const,
//         text: JSON.stringify({ success: true, message: `Record ${label} successfully` }, null, 2),
//       }],
//     };
//   } catch (err) {
//     return {
//       content: [{
//         type: "text" as const,
//         text: `Action failed.\n\n${extractApiError(err)}`,
//       }],
//     };
//   }
// }

// ── delete_record ─────────────────────────────────────────────────────────────

// export const deleteRecordSchema = z.object({
//   entityName: z.string().describe("Fully-qualified Java entity class name"),
//   id: z.number().int().positive().describe("ID of the record to delete"),
// });

// export async function toolDeleteRecord(args: z.infer<typeof deleteRecordSchema>) {
//   try {
//     await masterDelete(args.entityName, args.id);
//     return {
//       content: [{
//         type: "text" as const,
//         text: JSON.stringify({ success: true, message: `Record ${args.id} deleted` }, null, 2),
//       }],
//     };
//   } catch (err) {
//     return {
//       content: [{
//         type: "text" as const,
//         text: `Delete failed.\n\n${extractApiError(err)}`,
//       }],
//     };
//   }
// }
