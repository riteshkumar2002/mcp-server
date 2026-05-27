import { z } from "zod";
import { buildUiSchema, buildConfig, buildSchema } from "impaktapps-ui-builder";

export const PAGE_STAGING_ENTITY = "com.act21.hyperform3.entity.page.PageStaging";

export const pageBuilderStore = {
  theme: {
    palette: {
      mode: "light",
      common: {
        black: "#000000",
        white: "#ffffff",
      },
      primary: {
        main: "#0FAFAF",
        light: "#3fbfbf",
        dark: "#0F7B81",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#F0F3F6",
        light: "#D1D3D4",
        dark: "#EBEBEB",
        contrastText: "#A7A9AC",
      },
      error: {
        main: "#FF0000",
      },
      text: {
        primary: "#000000",
        secondary: "#58595B",
        disabled: "#AFAFAF",
      },
      background: {
        heading: "#ffffff",
        default: "#ffffff",
        paper: "#ffffff",
      },
      action: {
        hover: "#00747B",
        active: "#0D8B92",
      },
      typography: {},
      shape: {
        borderRadius: 4,
      },
    },
    typography: {
      fontFamily: "Calibri",
      fontSize: 14,
    },
    table: {
      header: {
        alignment: "center",
      },
      columns: {
        alignment: {
          integer: "right",
          string: "left",
          amount: "right",
          date: "right",
          dateTime: "right",
        },
      },
    },
  },
};

export const validatePageStagingConfigSchema = z.object({
  pageName: z.string().optional().describe(
    "Page name that will be used for PageStaging.name. If config.name is omitted, this value is required."
  ),
  config: z.record(z.unknown()).describe(
    "Raw page config object. The tool derives config, uiSchema, and schema with impaktapps-ui-builder, then validates the PageStaging payload before save."
  ),
  mainId: z.number().optional().describe(
    "Existing Page master ID when editing an existing page. Used only for PageStaging payload validation context."
  ),
  stagingId: z.number().nullable().optional().describe(
    "Existing PageStaging ID if this config will update an existing staging record."
  ),
});

type JsonRecord = Record<string, unknown>;

export interface PageArtifacts {
  config: unknown;
  uiSchema: unknown;
  schema: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  artifacts?: PageArtifacts;
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasKeys(value: unknown): boolean {
  return isRecord(value) && Object.keys(value).length > 0;
}

function pointerProperty(scope: string): string | null {
  const prefix = "#/properties/";
  if (!scope.startsWith(prefix)) return null;
  const rest = scope.slice(prefix.length);
  if (!rest || rest.includes("/")) return null;
  return rest.replace(/~1/g, "/").replace(/~0/g, "~");
}

function collectScopes(value: unknown, scopes: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectScopes(item, scopes));
    return scopes;
  }

  if (!isRecord(value)) return scopes;

  if (typeof value.scope === "string") scopes.push(value.scope);

  Object.values(value).forEach((child) => {
    if (isRecord(child) || Array.isArray(child)) collectScopes(child, scopes);
  });

  return scopes;
}

function collectConfigNames(value: unknown, names: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectConfigNames(item, names));
    return names;
  }

  if (!isRecord(value)) return names;

  if (typeof value.name === "string" && value.name.trim()) names.push(value.name);

  const elements = value.elements;
  if (Array.isArray(elements)) collectConfigNames(elements, names);

  return names;
}

function addViolation(errors: string[], message: string, property?: string): void {
  errors.push(property ? `${property}: ${message}` : message);
}

export function buildPageArtifacts(rawConfig: JsonRecord): PageArtifacts {
  return {
    uiSchema: buildUiSchema(rawConfig, pageBuilderStore),
    config: buildConfig(rawConfig),
    schema: buildSchema(rawConfig) ?? {},
  };
}

export function validatePageArtifacts(
  artifacts: PageArtifacts,
  pageName?: string
): Pick<ValidationResult, "errors" | "warnings"> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { config, uiSchema, schema } = artifacts;

  if (!hasKeys(config)) addViolation(errors, "config is mandatory and cannot be empty", "config");
  if (!hasKeys(uiSchema)) addViolation(errors, "uiSchema is mandatory and cannot be empty", "uiSchema");
  if (!hasKeys(schema)) addViolation(errors, "schema is mandatory and cannot be empty", "schema");

  if (isRecord(schema)) {
    if (schema.type !== "object") {
      addViolation(errors, 'schema.type must be "object"', "schema.type");
    }

    const properties = schema.properties;
    if (!isRecord(properties)) {
      addViolation(errors, "schema.properties must be an object", "schema.properties");
    } else {
      const scopes = collectScopes(uiSchema);
      const duplicates = scopes.filter((scope, index) => scopes.indexOf(scope) !== index);
      [...new Set(duplicates)].forEach((scope) => {
        addViolation(errors, `duplicate uiSchema scope "${scope}"`, "uiSchema.scope");
      });

      scopes.forEach((scope) => {
        const property = pointerProperty(scope);
        if (!property) {
          addViolation(errors, `invalid scope "${scope}". Expected "#/properties/<fieldName>"`, "uiSchema.scope");
          return;
        }
        if (!(property in properties)) {
          addViolation(errors, `scope "${scope}" has no matching schema.properties.${property}`, "uiSchema.scope");
        }
      });

      const required = schema.required;
      if (required !== undefined) {
        if (!Array.isArray(required)) {
          addViolation(errors, "schema.required must be an array when provided", "schema.required");
        } else {
          required.forEach((field) => {
            if (typeof field !== "string") {
              addViolation(errors, "schema.required can contain only strings", "schema.required");
            } else if (!(field in properties)) {
              addViolation(errors, `required field "${field}" is missing from schema.properties`, "schema.required");
            }
          });
        }
      }
    }
  }

  if (isRecord(config)) {
    const configNames = collectConfigNames(config);
    const duplicateNames = configNames.filter((name, index) => configNames.indexOf(name) !== index);
    [...new Set(duplicateNames)].forEach((name) => {
      warnings.push(`config contains duplicate element name "${name}". This may create duplicate schema/uiSchema output.`);
    });
  }

  if (!pageName && isRecord(config) && typeof config.name !== "string") {
    addViolation(errors, "PageStaging.name is mandatory. Provide pageName or config.name.", "name");
  }

  return { errors, warnings };
}

export function validatePageStagingEntity(entityValue: JsonRecord): Pick<ValidationResult, "errors" | "warnings"> {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const field of ["name", "config", "uiSchema", "schema", "promotionStatus", "isDeleted"]) {
    if (entityValue[field] === undefined || entityValue[field] === null || entityValue[field] === "") {
      addViolation(errors, "mandatory for PageStaging save", field);
    }
  }

  if (entityValue.promotionStatus !== undefined && entityValue.promotionStatus !== "N") {
    addViolation(errors, 'must be "N" before saving a new staging edit', "promotionStatus");
  }

  if (entityValue.isDeleted !== undefined && entityValue.isDeleted !== "N") {
    addViolation(errors, 'must be "N" for a normal page edit', "isDeleted");
  }

  const artifactValidation = validatePageArtifacts(
    {
      config: entityValue.config,
      uiSchema: entityValue.uiSchema,
      schema: entityValue.schema,
    },
    typeof entityValue.name === "string" ? entityValue.name : undefined
  );

  errors.push(...artifactValidation.errors);
  warnings.push(...artifactValidation.warnings);

  if (entityValue.id == null && entityValue.main == null) {
    warnings.push(
      "Both id and main are empty. Backend PageMstValidation treats this as a new page and may reject it if the name already exists."
    );
  }

  return { errors, warnings };
}

export function validatePageStagingConfig(args: z.infer<typeof validatePageStagingConfigSchema>): ValidationResult {
  const pageName = args.pageName ?? (typeof args.config.name === "string" ? args.config.name : undefined);
  let artifacts: PageArtifacts;

  try {
    artifacts = buildPageArtifacts(args.config);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      errors: [`builder: failed to derive uiSchema/schema/config from config: ${message}`],
      warnings: [],
    };
  }

  const artifactValidation = validatePageArtifacts(artifacts, pageName);
  const entityValidation = validatePageStagingEntity({
    id: args.stagingId ?? null,
    main: args.mainId ?? null,
    name: pageName,
    config: artifacts.config,
    uiSchema: artifacts.uiSchema,
    schema: artifacts.schema,
    promotionStatus: "N",
    isDeleted: "N",
  });

  const errors = [...artifactValidation.errors, ...entityValidation.errors];
  const warnings = [...artifactValidation.warnings, ...entityValidation.warnings];

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    artifacts,
  };
}

export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];
  lines.push(result.valid ? "PageStaging config validation passed." : "PageStaging config validation failed.");

  if (result.errors.length) {
    lines.push("", "Errors:");
    result.errors.forEach((error) => lines.push(`- ${error}`));
  }

  if (result.warnings.length) {
    lines.push("", "Warnings:");
    result.warnings.forEach((warning) => lines.push(`- ${warning}`));
  }

  if (!result.valid) {
    lines.push(
      "",
      "Create a corrected config and run validate_page_staging_config again before calling update_page."
    );
  }

  return lines.join("\n");
}

export function toolValidatePageStagingConfig(args: z.infer<typeof validatePageStagingConfigSchema>) {
  const result = validatePageStagingConfig(args);
  return {
    content: [
      {
        type: "text" as const,
        text: formatValidationResult(result),
      },
    ],
    isError: !result.valid,
  };
}
