import { z } from "zod";
import type { UiSchemaElement, GridLayout } from "../types.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toElement(v: Record<string, unknown>): UiSchemaElement {
  return v as unknown as UiSchemaElement;
}

function findElementByScope(
  elements: UiSchemaElement[],
  scope: string
): UiSchemaElement | null {
  for (const el of elements) {
    if (el.scope === scope) return el;
    if (el.elements) {
      const found = findElementByScope(el.elements, scope);
      if (found) return found;
    }
  }
  return null;
}

function findParentElements(
  elements: UiSchemaElement[],
  scope: string
): UiSchemaElement[] | null {
  for (const el of elements) {
    if (el.elements) {
      if (el.elements.some((c) => c.scope === scope)) return el.elements;
      const found = findParentElements(el.elements, scope);
      if (found) return found;
    }
  }
  return null;
}

function notFound(scope: string) {
  return {
    content: [{ type: "text" as const, text: `Error: no element found with scope "${scope}"` }],
    isError: true,
  };
}

// ── Tool: get uiSchema structure summary ──────────────────────────────────────

export const getUiSchemaStructureSchema = z.object({
  uiSchema: z.record(z.unknown()).describe("The uiSchema object to summarize"),
});

export function toolGetUiSchemaStructure(args: z.infer<typeof getUiSchemaStructureSchema>) {
  const root = toElement(args.uiSchema);

  function summarize(el: UiSchemaElement, depth = 0): string {
    const indent = "  ".repeat(depth);
    const widget = el.options?.widget ?? "";
    const label = (el.config?.main as Record<string, unknown> | undefined)?.["label"] ?? el.heading ?? "";
    const scope = el.scope ?? "";
    const lg = typeof el.config?.layout === "object" && el.config.layout !== null
      ? (el.config.layout as GridLayout).lg
      : el.config?.layout;

    let line = `${indent}[${el.type}]`;
    if (widget) line += ` widget="${widget}"`;
    if (scope) line += ` scope="${scope}"`;
    if (label) line += ` label="${String(label)}"`;
    if (lg !== undefined) line += ` (lg:${lg})`;

    const children = el.elements?.map((c) => summarize(c, depth + 1)).join("\n") ?? "";
    return children ? `${line}\n${children}` : line;
  }

  return {
    content: [{ type: "text" as const, text: summarize(root) }],
  };
}

// ── Tool: update a control's config.main props ────────────────────────────────

export const updateControlConfigSchema = z.object({
  uiSchema: z.record(z.unknown()).describe("The full uiSchema object"),
  scope: z.string().describe("Scope of the control, e.g. '#/properties/firstName'"),
  mainProps: z.record(z.unknown()).describe("Key-value pairs to merge into config.main"),
});

export function toolUpdateControlConfig(args: z.infer<typeof updateControlConfigSchema>) {
  const root = toElement(args.uiSchema);
  const target = findElementByScope(root.elements ?? [], args.scope);
  if (!target) return notFound(args.scope);

  target.config = target.config ?? {};
  target.config["main"] = { ...(target.config["main"] as Record<string, unknown> ?? {}), ...args.mainProps };

  return { content: [{ type: "text" as const, text: JSON.stringify(root, null, 2) }] };
}

// ── Tool: change widget type ──────────────────────────────────────────────────

export const changeWidgetSchema = z.object({
  uiSchema: z.record(z.unknown()).describe("The full uiSchema object"),
  scope: z.string().describe("Scope of the control to change"),
  widget: z.string().describe("New widget name, e.g. 'SelectInputField', 'TextArea', 'DateInputField'"),
  mainProps: z.record(z.unknown()).optional().describe("Optional config.main props to set for the new widget"),
});

export function toolChangeWidget(args: z.infer<typeof changeWidgetSchema>) {
  const root = toElement(args.uiSchema);
  const target = findElementByScope(root.elements ?? [], args.scope);
  if (!target) return notFound(args.scope);

  target.options = { ...(target.options ?? {}), widget: args.widget };
  if (args.mainProps) {
    target.config = target.config ?? {};
    target.config["main"] = { ...(target.config["main"] as Record<string, unknown> ?? {}), ...args.mainProps };
  }

  return { content: [{ type: "text" as const, text: JSON.stringify(root, null, 2) }] };
}

// ── Tool: update layout grid columns ──────────────────────────────────────────

export const updateLayoutSchema = z.object({
  uiSchema: z.record(z.unknown()).describe("The full uiSchema object"),
  scope: z.string().describe("Scope of the control to resize"),
  layout: z
    .object({
      lg: z.number().int().min(1).max(12).optional(),
      md: z.number().int().min(1).max(12).optional(),
      sm: z.number().int().min(1).max(12).optional(),
      xs: z.number().int().min(1).max(12).optional(),
    })
    .describe("Grid column spans (MUI 12-column system)"),
});

export function toolUpdateLayout(args: z.infer<typeof updateLayoutSchema>) {
  const root = toElement(args.uiSchema);
  const target = findElementByScope(root.elements ?? [], args.scope);
  if (!target) return notFound(args.scope);

  target.config = target.config ?? {};
  const existing: GridLayout =
    typeof target.config["layout"] === "object" && target.config["layout"] !== null
      ? (target.config["layout"] as GridLayout)
      : {};
  target.config["layout"] = { ...existing, ...args.layout };

  return { content: [{ type: "text" as const, text: JSON.stringify(root, null, 2) }] };
}

// ── Tool: add a new control to a section ─────────────────────────────────────

export const addControlSchema = z.object({
  uiSchema: z.record(z.unknown()).describe("The full uiSchema object"),
  parentScope: z.string().optional().describe("Scope of the parent WrapperLayout. Omit for root."),
  control: z
    .object({
      type: z.literal("Control"),
      scope: z.string().describe("e.g. '#/properties/newField'"),
      options: z.object({ widget: z.string() }),
      config: z.object({
        main: z.record(z.unknown()),
        style: z.record(z.unknown()).optional(),
        layout: z
          .object({
            lg: z.number().optional(),
            md: z.number().optional(),
            sm: z.number().optional(),
            xs: z.number().optional(),
          })
          .optional(),
      }),
    })
    .describe("The new Control element"),
  insertAfterScope: z.string().optional().describe("Insert after this scope. Omit to append."),
});

export function toolAddControl(args: z.infer<typeof addControlSchema>) {
  const root = toElement(args.uiSchema);

  let targetList: UiSchemaElement[];
  if (args.parentScope) {
    const parent = findElementByScope(root.elements ?? [], args.parentScope);
    if (!parent) {
      return { content: [{ type: "text" as const, text: `Error: parent scope "${args.parentScope}" not found` }], isError: true };
    }
    parent.elements = parent.elements ?? [];
    targetList = parent.elements;
  } else {
    root.elements = root.elements ?? [];
    targetList = root.elements;
  }

  const newControl = args.control as unknown as UiSchemaElement;

  if (args.insertAfterScope) {
    const idx = targetList.findIndex((el) => el.scope === args.insertAfterScope);
    if (idx === -1) {
      return { content: [{ type: "text" as const, text: `Error: insertAfterScope "${args.insertAfterScope}" not found` }], isError: true };
    }
    targetList.splice(idx + 1, 0, newControl);
  } else {
    targetList.push(newControl);
  }

  return { content: [{ type: "text" as const, text: JSON.stringify(root, null, 2) }] };
}

// ── Tool: remove a control ────────────────────────────────────────────────────

export const removeControlSchema = z.object({
  uiSchema: z.record(z.unknown()).describe("The full uiSchema object"),
  scope: z.string().describe("Scope of the control to remove"),
});

export function toolRemoveControl(args: z.infer<typeof removeControlSchema>) {
  const root = toElement(args.uiSchema);
  const parentList = findParentElements(root.elements ?? [], args.scope);

  if (!parentList) return notFound(args.scope);

  const idx = parentList.findIndex((el) => el.scope === args.scope);
  parentList.splice(idx, 1);

  return { content: [{ type: "text" as const, text: JSON.stringify(root, null, 2) }] };
}

// ── Tool: add a new WrapperLayout section ─────────────────────────────────────

export const addSectionSchema = z.object({
  uiSchema: z.record(z.unknown()).describe("The full uiSchema object"),
  section: z
    .object({
      scope: z.string().describe("Unique scope key, e.g. '#/properties/newSection'"),
      label: z.string().describe("Section title shown in the UI"),
      isAccordion: z.boolean().optional().describe("Make it collapsible (default false)"),
      defaultClosed: z.boolean().optional().describe("Start collapsed (default false)"),
      divider: z.boolean().optional().describe("Show divider line (default true)"),
      rowSpacing: z.number().optional().describe("Vertical spacing between rows (default 3)"),
    })
    .describe("Section configuration"),
  insertAfterScope: z.string().optional().describe("Insert after this scope. Omit to append."),
});

export function toolAddSection(args: z.infer<typeof addSectionSchema>) {
  const root = toElement(args.uiSchema);
  root.elements = root.elements ?? [];

  const newSection: UiSchemaElement = {
    type: "WrapperLayout",
    scope: args.section.scope,
    config: {
      main: {
        label: args.section.label,
        divider: args.section.divider ?? true,
        rowSpacing: args.section.rowSpacing ?? 3,
        isAccordion: args.section.isAccordion ?? false,
        defaultClosed: args.section.defaultClosed ?? false,
      },
      layout: 12,
      defaultStyle: true,
    },
    elements: [],
  };

  if (args.insertAfterScope) {
    const idx = root.elements.findIndex((el) => el.scope === args.insertAfterScope);
    if (idx === -1) {
      return { content: [{ type: "text" as const, text: `Error: insertAfterScope "${args.insertAfterScope}" not found` }], isError: true };
    }
    root.elements.splice(idx + 1, 0, newSection);
  } else {
    root.elements.push(newSection);
  }

  return { content: [{ type: "text" as const, text: JSON.stringify(root, null, 2) }] };
}

// ── Tool: reorder controls within a section ───────────────────────────────────

export const reorderControlsSchema = z.object({
  uiSchema: z.record(z.unknown()).describe("The full uiSchema object"),
  parentScope: z.string().optional().describe("Scope of the parent section. Omit for root-level."),
  orderedScopes: z.array(z.string()).describe("All scope values in the new desired order"),
});

export function toolReorderControls(args: z.infer<typeof reorderControlsSchema>) {
  const root = toElement(args.uiSchema);

  let targetList: UiSchemaElement[];
  if (args.parentScope) {
    const parent = findElementByScope(root.elements ?? [], args.parentScope);
    if (!parent?.elements) {
      return { content: [{ type: "text" as const, text: `Error: parent "${args.parentScope}" not found or has no elements` }], isError: true };
    }
    targetList = parent.elements;
  } else {
    targetList = root.elements ?? [];
  }

  const byScope = new Map(targetList.map((el) => [el.scope ?? "", el]));
  const reordered = args.orderedScopes
    .map((s) => byScope.get(s))
    .filter((el): el is UiSchemaElement => el !== undefined);

  if (args.parentScope) {
    const parent = findElementByScope(root.elements ?? [], args.parentScope)!;
    parent.elements = reordered;
  } else {
    root.elements = reordered;
  }

  return { content: [{ type: "text" as const, text: JSON.stringify(root, null, 2) }] };
}
