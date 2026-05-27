import { z } from "zod";
import axios from "axios";
import { masterSave } from "../apiClient.js";
import { loadConfig } from "../config.js";
import {
  buildPageArtifacts,
  formatValidationResult,
  PAGE_STAGING_ENTITY,
  validatePageStagingEntity,
} from "./validatePageStagingConfig.js";

function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    return `HTTP ${status ?? "?"}: ${JSON.stringify(data, null, 2)}`;
  }
  return err instanceof Error ? err.message : String(err);
}

export const createPageSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe(
      "New page name, e.g. 'newPage'. Used for config.name and PageStaging.name.",
    ),
  label: z
    .string()
    .min(1)
    .describe(
      "Page heading/label, e.g. 'newPageAdded'. Used for config.label and uiSchema.heading.",
    ),
  hasBackIcon: z
    .enum(["YES", "NO"])
    .optional()
    .default("YES")
    .describe("Whether the page has a back icon. Defaults to YES."),
  events: z
    .array(z.record(z.unknown()))
    .optional()
    .default([])
    .describe("Page-level event definitions. Defaults to an empty array."),
  templateName: z
    .number()
    .optional()
    .default(1)
    .describe(
      "Template ID/name value for PageStaging.templateName. Defaults to 1.",
    ),
  pageUrlPrefix: z
    .string()
    .optional()
    .default("undefined")
    .describe(
      "Prefix used to build pageUrl. Defaults to 'undefined', giving undefined/<name>.",
    ),
  userId: z
    .number()
    .optional()
    .describe(
      "userId for the save payload. Defaults to stored config userId, then 1.",
    ),
});

export async function toolCreatePage(args: z.infer<typeof createPageSchema>) {
  const rawConfig = {
    type: "page",
    name: args.name,
    label: args.label,
    hasBackIcon: args.hasBackIcon ?? "YES",
    events: args.events ?? [],
  };

  let artifacts;
  try {
    artifacts = buildPageArtifacts(rawConfig);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [
        {
          type: "text" as const,
          text: `Create page failed before save.\n\nbuilder: failed to derive uiSchema/schema/config from config: ${message}`,
        },
      ],
      isError: true,
    };
  }

  const entityValue: Record<string, unknown> = {
    config: artifacts.config,
    uiSchema: artifacts.uiSchema,
    schema: artifacts.schema,
    id: null,
    name: args.name,
    pageUrl: `${args.pageUrlPrefix ?? "undefined"}/${args.name}`,
    templateName: args.templateName ?? 1,
    promotionStatus: "N",
    isDeleted: "N",
    main: null,
  };

  const validation = validatePageStagingEntity(entityValue);
  if (validation.errors.length) {
    return {
      content: [
        {
          type: "text" as const,
          text: [
            "Create page validation failed before save.",
            "",
            formatValidationResult({
              valid: false,
              errors: validation.errors,
              warnings: validation.warnings,
            }),
          ].join("\n"),
        },
      ],
      isError: true,
    };
  }

  const cfg = loadConfig();
  const userId = args.userId ?? cfg?.userId ?? 1;

  let saveResult: unknown;
  try {
    saveResult = await masterSave(PAGE_STAGING_ENTITY, entityValue, userId);
  } catch (err) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Create page save failed.\n${extractApiError(err)}`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: [
          "Page created in staging successfully.",
          `  Page     : ${args.name}`,
          `  Label    : ${args.label}`,
          `  pageUrl  : ${entityValue.pageUrl}`,
          `  userId   : ${userId}`,
          `  Result   : ${JSON.stringify(saveResult)}`,
        ].join("\n"),
      },
    ],
  };
}
