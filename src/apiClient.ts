import axios, { type AxiosInstance, type AxiosError } from "axios";
import type { EntityReportRequest, HyperformApiResponse } from "./types.js";
import { loadConfig } from "./config.js";
import { login } from "./auth.js";

let client: AxiosInstance | null = null;
let isRefreshing = false;

// ── NOT_CONFIGURED error ──────────────────────────────────────────────────────

export class NotConfiguredError extends Error {
  constructor() {
    super(
      "MCP server is not configured. Use the 'configure' tool first and provide your " +
      "backendUrl, username, and password."
    );
    this.name = "NotConfiguredError";
  }
}

// ── Client bootstrap ──────────────────────────────────────────────────────────

export function initClient(baseUrl: string, token: string): void {
  client = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    timeout: 30000,
  });

  // Response interceptor: on 401, re-login with stored credentials and retry once
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as typeof error.config & { _retry?: boolean };
      if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const config = loadConfig();
          if (!config?.password) {
            process.stderr.write("[auth] 401 received but no stored credentials — run npm run setup\n");
            return Promise.reject(error);
          }

          process.stderr.write(`[auth] Token expired — re-logging in as ${config.username}...\n`);
          const fresh = await login(config.baseUrl, config.username, config.password);
          process.stderr.write(`[auth] Re-login successful, new tokenId=${fresh.tokenId}\n`);

          // Update default headers on the shared client instance
          client!.defaults.headers.common["Authorization"] = `Bearer ${fresh.token}`;
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${fresh.token}`;
          }
          return client!(originalRequest);
        } catch (reLoginErr) {
          const msg = reLoginErr instanceof Error ? reLoginErr.message : String(reLoginErr);
          process.stderr.write(`[auth] Re-login failed: ${msg}\n`);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
}

function getClient(): AxiosInstance {
  if (!client) {
    const config = loadConfig();
    if (!config) throw new NotConfiguredError();
    initClient(config.baseUrl, config.token);
  }
  return client!;
}

// ── /page/getByName ───────────────────────────────────────────────────────────
export async function getPageByName(pageName: string): Promise<Record<string, unknown>> {
  const res = await getClient().post<Record<string, unknown>>("/page/getByName", { pageName });
  return res.data;
}

// ── /master/save ──────────────────────────────────────────────────────────────
export async function masterSave(
  entityName: string,
  entityValue: Record<string, unknown>,
  userId?: number
): Promise<HyperformApiResponse> {
  const body: Record<string, unknown> = { entityName, entityValue };
  if (userId !== undefined) body["userId"] = userId;
  const res = await getClient().post<HyperformApiResponse>("/master/save", body);
  return res.data;
}

// ── /master/action ────────────────────────────────────────────────────────────
export async function masterAction(
  entityName: string,
  action: "A" | "R",
  entityValue: Record<string, unknown>
): Promise<void> {
  await getClient().post("/master/action", { entityName, action, entityValue });
}

// ── /master/getDetailById ─────────────────────────────────────────────────────
export async function getDetailById(
  id: number,
  masterName: string
): Promise<Record<string, unknown>> {
  const res = await getClient().get<Record<string, unknown>>("/master/getDetailById", {
    params: { id, masterName },
  });
  return res.data;
}

// ── /master/getStagingByMainId ────────────────────────────────────────────────
export async function getStagingByMainId(
  id: number,
  masterName: string
): Promise<Record<string, unknown>> {
  const res = await getClient().get<Record<string, unknown>>("/master/getStagingByMainId", {
    params: { id, masterName },
  });
  return res.data;
}

// ── /master/getDetailsByStatus ────────────────────────────────────────────────
export async function getDetailsByStatus(
  status: string,
  masterName: string
): Promise<unknown[]> {
  const res = await getClient().get<unknown[]>("/master/getDetailsByStatus", {
    params: { status, masterName },
  });
  return res.data;
}

// ── /master/getDetailsById ────────────────────────────────────────────────────
export async function getDetailsById(
  entityName: string,
  ids: number[]
): Promise<unknown[]> {
  const res = await getClient().post<unknown[]>("/master/getDetailsById", {
    entityName,
    entityValue: ids,
  });
  return res.data;
}

// ── /master/getApprovedDetails ────────────────────────────────────────────────
export async function getApprovedDetails(
  req: EntityReportRequest
): Promise<Record<string, unknown>[]> {
  const res = await getClient().post<Record<string, unknown>[]>("/master/getApprovedDetails", req);
  return res.data;
}

// ── /master/getApprovedDetailsPaginated ──────────────────────────────────────
export async function getApprovedDetailsPaginated(
  req: EntityReportRequest
): Promise<Record<string, unknown>> {
  const res = await getClient().post<Record<string, unknown>>("/master/getApprovedDetailsPaginated", req);
  return res.data;
}

// ── /master/getPendingDetails ─────────────────────────────────────────────────
export async function getPendingDetails(
  req: EntityReportRequest
): Promise<Record<string, unknown>[]> {
  const res = await getClient().post<Record<string, unknown>[]>("/master/getPendingDetails", req);
  return res.data;
}

// ── /master/getPendingDetailsPaginated ───────────────────────────────────────
export async function getPendingDetailsPaginated(
  req: EntityReportRequest
): Promise<Record<string, unknown>> {
  const res = await getClient().post<Record<string, unknown>>("/master/getPendingDetailsPaginated", req);
  return res.data;
}

// ── /master/getRejectedDetails ────────────────────────────────────────────────
export async function getRejectedDetails(
  req: EntityReportRequest
): Promise<Record<string, unknown>[]> {
  const res = await getClient().post<Record<string, unknown>[]>("/master/getRejectedDetails", req);
  return res.data;
}

// ── /master/getRejectedDetailsPaginated ──────────────────────────────────────
export async function getRejectedDetailsPaginated(
  req: EntityReportRequest
): Promise<Record<string, unknown>> {
  const res = await getClient().post<Record<string, unknown>>("/master/getRejectedDetailsPaginated", req);
  return res.data;
}

// ── /master/getPendingActionDetails ──────────────────────────────────────────
export async function getPendingActionDetails(
  req: EntityReportRequest
): Promise<Record<string, unknown>[]> {
  const res = await getClient().post<Record<string, unknown>[]>("/master/getPendingActionDetails", req);
  return res.data;
}

// ── /master/getPendingActionDetailsPaginated ──────────────────────────────────
export async function getPendingActionDetailsPaginated(
  req: EntityReportRequest
): Promise<Record<string, unknown>> {
  const res = await getClient().post<Record<string, unknown>>("/master/getPendingActionDetailsPaginated", req);
  return res.data;
}

// ── /master/getDraftDetails ───────────────────────────────────────────────────
export async function getDraftDetails(
  req: EntityReportRequest
): Promise<Record<string, unknown>[]> {
  const res = await getClient().post<Record<string, unknown>[]>("/master/getDraftDetails", req);
  return res.data;
}

// ── /master/getDraftDetailsPaginated ─────────────────────────────────────────
export async function getDraftDetailsPaginated(
  req: EntityReportRequest
): Promise<Record<string, unknown>> {
  const res = await getClient().post<Record<string, unknown>>("/master/getDraftDetailsPaginated", req);
  return res.data;
}

// ── /master/delete ────────────────────────────────────────────────────────────
export async function masterDelete(entityName: string, id: number): Promise<void> {
  await getClient().post("/master/delete", { entityName, id });
}
