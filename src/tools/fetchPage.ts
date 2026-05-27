import { z } from "zod";
import {
  getPageByName,
  getDetailById,
  getStagingByMainId,
  getDetailsByStatus,
  getDetailsById,
  getApprovedDetails,
  getApprovedDetailsPaginated,
  getDraftDetails,
  getDraftDetailsPaginated,
  getPendingDetails,
  getPendingDetailsPaginated,
  getRejectedDetails,
  getRejectedDetailsPaginated,
  getPendingActionDetails,
  getPendingActionDetailsPaginated,
} from "../apiClient.js";
import type { EntityReportRequest } from "../types.js";

// ── Shared param schemas ──────────────────────────────────────────────────────

const entityReportSchema = z.object({
  entityName: z.string().describe("Master name, e.g. 'com.act21.hyperform3.entity.page.PageStaging'"),
  pageIndex: z.number().int().nonnegative().optional().describe("0-based page index (required for paginated variants)"),
  size: z.number().int().positive().optional().describe("Page size (required for paginated variants)"),
  filters: z.record(z.unknown()).optional().describe("Optional filter map"),
});

// ── get_page_record ───────────────────────────────────────────────────────────
// Resolves page name → id via /page/getByName, then fetches the master record.

export const getPageRecordSchema = z.object({
  pageName: z.string().describe("Page name as stored in the backend, e.g. 'page_eSign'"),
  masterName: z.string().describe("Master entity name to fetch from, e.g. 'com.act21.hyperform3.entity.page.PageStaging'"),
  fetchStaging: z.boolean().optional().describe("If true, also fetch the staging (pending/draft) record for this page"),
});

export async function toolGetPageRecord(args: z.infer<typeof getPageRecordSchema>) {
  const page = await getPageByName(args.pageName);
  const id = page["id"] as number | undefined;

  if (!id) {
    return {
      content: [{
        type: "text" as const,
        text: `Page '${args.pageName}' was found but has no id.\nRaw response:\n${JSON.stringify(page, null, 2)}`,
      }],
    };
  }

  const record = await getDetailById(id, args.masterName);
  const lines: string[] = [
    `Page name : ${args.pageName}`,
    `Page id   : ${id}`,
    `Master    : ${args.masterName}`,
    "",
    "--- Record ---",
    JSON.stringify(record, null, 2),
  ];

  if (args.fetchStaging) {
    try {
      const staging = await getStagingByMainId(id, args.masterName);
      lines.push("", "--- Staging record ---", JSON.stringify(staging, null, 2));
    } catch {
      lines.push("", "--- Staging record ---", "(none / not found)");
    }
  }

  return { content: [{ type: "text" as const, text: lines.join("\n") }] };
}

// ── get_record_by_id ──────────────────────────────────────────────────────────

export const getRecordByIdSchema = z.object({
  id: z.number().int().positive().describe("Record ID"),
  masterName: z.string().describe("Master name, e.g. 'com.act21.hyperform3.entity.page.PageStaging'"),
});

export async function toolGetRecordById(args: z.infer<typeof getRecordByIdSchema>) {
  const data = await getDetailById(args.id, args.masterName);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_staging_by_main_id ────────────────────────────────────────────────────

export const getStagingByMainIdSchema = z.object({
  id: z.number().int().positive().describe("Main record ID"),
  masterName: z.string().describe("Master name, e.g. 'com.act21.hyperform3.entity.page.PageStaging'"),
});

export async function toolGetStagingByMainId(args: z.infer<typeof getStagingByMainIdSchema>) {
  const data = await getStagingByMainId(args.id, args.masterName);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_records_by_status ─────────────────────────────────────────────────────

export const getRecordsByStatusSchema = z.object({
  status: z.string().describe("Status filter: 'A'=Approved, 'P'=Pending, 'R'=Rejected, 'D'=Draft"),
  masterName: z.string().describe("Master name, e.g. 'com.act21.hyperform3.entity.page.PageStaging'"),
});

export async function toolGetRecordsByStatus(args: z.infer<typeof getRecordsByStatusSchema>) {
  const data = await getDetailsByStatus(args.status, args.masterName);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_records_by_ids ────────────────────────────────────────────────────────

export const getRecordsByIdsSchema = z.object({
  entityName: z.string().describe("Fully-qualified entity class name"),
  ids: z.array(z.number().int().positive()).describe("List of record IDs to fetch"),
});

export async function toolGetRecordsByIds(args: z.infer<typeof getRecordsByIdsSchema>) {
  const data = await getDetailsById(args.entityName, args.ids);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_approved_details ──────────────────────────────────────────────────────

export const getApprovedDetailsSchema = entityReportSchema;

export async function toolGetApprovedDetails(args: z.infer<typeof getApprovedDetailsSchema>) {
  const data = await getApprovedDetails(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_approved_details_paginated ────────────────────────────────────────────

export const getApprovedDetailsPaginatedSchema = entityReportSchema;

export async function toolGetApprovedDetailsPaginated(args: z.infer<typeof getApprovedDetailsPaginatedSchema>) {
  const data = await getApprovedDetailsPaginated(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_pending_details ───────────────────────────────────────────────────────

export const getPendingDetailsSchema = entityReportSchema;

export async function toolGetPendingDetails(args: z.infer<typeof getPendingDetailsSchema>) {
  const data = await getPendingDetails(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_pending_details_paginated ─────────────────────────────────────────────

export const getPendingDetailsPaginatedSchema = entityReportSchema;

export async function toolGetPendingDetailsPaginated(args: z.infer<typeof getPendingDetailsPaginatedSchema>) {
  const data = await getPendingDetailsPaginated(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_rejected_details ──────────────────────────────────────────────────────

export const getRejectedDetailsSchema = entityReportSchema;

export async function toolGetRejectedDetails(args: z.infer<typeof getRejectedDetailsSchema>) {
  const data = await getRejectedDetails(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_rejected_details_paginated ────────────────────────────────────────────

export const getRejectedDetailsPaginatedSchema = entityReportSchema;

export async function toolGetRejectedDetailsPaginated(args: z.infer<typeof getRejectedDetailsPaginatedSchema>) {
  const data = await getRejectedDetailsPaginated(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_draft_details ─────────────────────────────────────────────────────────

export const getDraftDetailsSchema = entityReportSchema;

export async function toolGetDraftDetails(args: z.infer<typeof getDraftDetailsSchema>) {
  const data = await getDraftDetails(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_draft_details_paginated ───────────────────────────────────────────────

export const getDraftDetailsPaginatedSchema = entityReportSchema;

export async function toolGetDraftDetailsPaginated(args: z.infer<typeof getDraftDetailsPaginatedSchema>) {
  const data = await getDraftDetailsPaginated(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_pending_action_details ────────────────────────────────────────────────

export const getPendingActionDetailsSchema = entityReportSchema;

export async function toolGetPendingActionDetails(args: z.infer<typeof getPendingActionDetailsSchema>) {
  const data = await getPendingActionDetails(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

// ── get_pending_action_details_paginated ──────────────────────────────────────

export const getPendingActionDetailsPaginatedSchema = entityReportSchema;

export async function toolGetPendingActionDetailsPaginated(args: z.infer<typeof getPendingActionDetailsPaginatedSchema>) {
  const data = await getPendingActionDetailsPaginated(args as EntityReportRequest);
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
