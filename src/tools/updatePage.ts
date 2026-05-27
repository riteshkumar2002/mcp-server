import { z } from "zod";
import axios from "axios";
import {
  getPageByName,
  getDetailById,
  getStagingByMainId,
  masterAction,
  masterSave,
} from "../apiClient.js";
import { loadConfig } from "../config.js";
import {
  buildPageArtifacts,
  formatValidationResult,
  validatePageStagingEntity,
} from "./validatePageStagingConfig.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_MASTER  = "com.act21.hyperform3.entity.page.PageStaging";
const PAGE_STAGING = "com.act21.hyperform3.entity.page.PageStaging";

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data   = err.response?.data;
    return `HTTP ${status ?? "?"}: ${JSON.stringify(data, null, 2)}`;
  }
  return err instanceof Error ? err.message : String(err);
}

function asRecord(v: unknown): Record<string, unknown> {
  return (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
}

// ── Schema ────────────────────────────────────────────────────────────────────

export const updatePageSchema = z.object({
  pageName: z.string().describe(
    "Name of the page to update, e.g. 'page_eSign'."
  ),
  config: z.record(z.unknown()).describe(
    "The updated config object. buildUiSchema, buildConfig, and buildSchema are called on this to derive the uiSchema and schema before saving."
  ),
  userId: z.number().optional().describe(
    "userId for the save payload. Defaults to the value stored during setup (usually 1)."
  ),
});

// ── Tool implementation ───────────────────────────────────────────────────────

export async function toolUpdatePage(args: z.infer<typeof updatePageSchema>) {

  // ── 1. Resolve page name → main ID ────────────────────────────────────────
  let pageRef: Record<string, unknown>;
  try {
    pageRef = await getPageByName(args.pageName);
  } catch (err) {
    return { content: [{ type: "text" as const, text: `Failed to resolve page name.\n${extractApiError(err)}` }] };
  }

  const mainId = pageRef["id"] as number | undefined;
  if (!mainId) {
    return {
      content: [{
        type: "text" as const,
        text: `Page "${args.pageName}" found but returned no id.\n${JSON.stringify(pageRef, null, 2)}`,
      }],
    };
  }

  // ── 2. Fetch main record (pageUrl, templateName, name) ────────────────────
  let record: Record<string, unknown>;
  try {
    record = await getDetailById(mainId, PAGE_MASTER);
  } catch (err) {
    return { content: [{ type: "text" as const, text: `Failed to fetch page record (ID ${mainId}).\n${extractApiError(err)}` }] };
  }

  // ── 3. Fetch staging record (if any) ─────────────────────────────────────
  let staging: Record<string, unknown> | null = null;
  try {
    const raw = await getStagingByMainId(mainId, PAGE_MASTER);
    if (raw && raw["id"]) staging = raw;
  } catch {
    // No staging record — proceed with null
  }

  // ── 4. Reject staging if it is not already rejected ───────────────────────
  if (staging && staging["promotionStatus"] !== "R") {
    try {
      await masterAction(PAGE_STAGING, "R", staging);
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Failed to reject existing staging record.\n${extractApiError(err)}` }] };
    }
  }

  // ── 5. Build uiSchema / config / schema from the provided config ──────────
  //       Mirrors the frontend's mergeWithBackendData / submitHandler flow.
  let artifacts;
  try {
    artifacts = buildPageArtifacts(args.config);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{
        type: "text" as const,
        text: `Config validation failed before save.\n\nbuilder: failed to derive uiSchema/schema/config from config: ${message}`,
      }],
      isError: true,
    };
  }

  const updatedUiSchema = artifacts.uiSchema;
  const updatedConfig   = artifacts.config;
  const updatedSchema   = artifacts.schema;

  // ── 6. Resolve userId ─────────────────────────────────────────────────────
  const cfg    = loadConfig();
  const userId = args.userId ?? cfg?.userId ?? 1;

  // ── 7. Build pageUrl the same way the frontend does ───────────────────────
  //       template/name — fall back to the value already on the main record.
  const name      = (args.config["name"] as string | undefined) ?? (record["name"] as string);
  const template  = args.config["template"] as string | undefined;
  const pageUrl   = template ? `${template}/${name}` : (record["pageUrl"] as string ?? name);

  // ── 8. Save via /master/save ───────────────────────────────────────────────
  //       id    = existing staging ID (or null for a fresh staging record)
  //       main  = mainId from the API — equivalent to localStorage "pageMainId"
  const entityValue: Record<string, unknown> = {
    id:               staging?.["id"] ?? null,
    config:           updatedConfig,
    uiSchema:         updatedUiSchema,
    schema:           updatedSchema,
    name,
    pageUrl,
    templateName:     record["templateName"] ?? 1,
    promotionStatus:  "N",
    isDeleted:        "N",
    main:             mainId,
  };

  const validation = validatePageStagingEntity(entityValue);
  if (validation.errors.length) {
    return {
      content: [{
        type: "text" as const,
        text: [
          "Config validation failed before save.",
          "",
          formatValidationResult({
            valid: false,
            errors: validation.errors,
            warnings: validation.warnings,
          }),
        ].join("\n"),
      }],
      isError: true,
    };
  }

  let saveResult: unknown;
  try {
    saveResult = await masterSave(PAGE_STAGING, entityValue, userId);
  } catch (err) {
    return { content: [{ type: "text" as const, text: `Save failed.\n${extractApiError(err)}` }] };
  }

  return {
    content: [{
      type: "text" as const,
      text: [
        `Page saved to staging successfully.`,
        `  Page     : ${args.pageName}`,
        `  Main ID  : ${mainId}`,
        `  Staging  : ${staging ? `updated (ID ${staging["id"]})` : "new record created"}`,
        `  pageUrl  : ${pageUrl}`,
        `  Result   : ${JSON.stringify(saveResult)}`,
      ].join("\n"),
    }],
  };
}
