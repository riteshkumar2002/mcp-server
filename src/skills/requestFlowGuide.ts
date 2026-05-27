export const MCP_REQUEST_FLOW_GUIDE = `
# Hyperform MCP Request Processing Flow

Use this flow for every user request unless the user explicitly asks for a narrower action.

## 1. Request Entry

Requests arrive through an MCP client such as Claude Desktop, Cursor, or another MCP-compatible client.
The transport is either:

- HTTPS /mcp from src/index.ts
- stdio from src/stdio.ts

The server creates a session with createMcpServer() from src/server.ts and exposes all registered tools.

## 2. Understand And Plan

Classify the user request:

- page creation
- page modification
- HTML-to-page conversion
- validation
- preview generation
- screenshot verification
- save or approval action

Choose tools and run them in a deliberate sequence. Keep retry loops internal until the output is valid or a real blocker appears.

## 3. Backend Access

For backend work, use the configured apiClient.ts flow. It loads saved backend credentials and token from ~/.hyperform-mcp/config.json and retries once after re-authentication on token expiry.

Use backend tools for:

- fetching pages
- fetching staging records
- saving PageStaging
- approving or rejecting records
- loading metadata/report data

## 4. HTML-To-Page Flow

When the user provides an HTML reference:

1. Use read_file to inspect the HTML source.
2. Use html_preview to render the HTML through Playwright via file://.
3. Capture screenshots.
4. Analyze structure, spacing, visual hierarchy, forms, tables, cards, responsive behavior, and styling.
5. Convert the intent into Hyperform-compatible config, not raw HTML.

HTML preview is separate from the Hyperform renderer. It does not use AppWithoutRouter, schema, uiSchema, or the React renderer.

## 5. Hyperform Page Config Flow

For page creation or modification:

1. For a brand-new empty page, use create_page with name, label, hasBackIcon, and optional events.
2. For existing pages, use get_page_record when a pageName exists.
3. Use list_component_skills and get_component_skill for every component type being created or changed.
4. Build or update the full config.
5. Preserve existing structure unless the user asked to remove or replace it.
6. Follow Hyperform theme, layout, spacing, component, and event conventions.

Generated output must be Hyperform-compliant even when visually matching an HTML reference.

## 6. Validation And Auto-Correction

Before saving, always run validate_page_staging_config.

If validation fails:

1. Read the errors.
2. Fix the config.
3. Run validate_page_staging_config again.
4. Repeat until validation passes or a true blocker exists.

update_page also runs the PageStaging pre-save validation gate, but the standalone validator should be used before save attempts.

## 7. Preview And Visual Verification

For Hyperform page preview:

1. Use preview_from_config or preview_session_from_config.
2. The server writes JSON containing schema and uiSchema.
3. frontend/start.js starts:
   - frontend/backend/server.js on port 4000
   - Vite React renderer on port 5173
4. The React app renders AppWithoutRouter from impaktapps-jsonforms.

For HTML reference preview:

- Use html_preview only. It opens the HTML file directly in Playwright through file://.

When comparing generated output to an HTML reference, capture screenshots for both paths and refine config until the result is acceptable.

## 8. User Review And Save

Before saving meaningful page changes, present:

- validation status
- preview result or screenshot summary
- concise config/change summary

If the user approves or requested save directly, use update_page for page config saves. Use save_record only for lower-level direct MDM saves.
Use create_page for new empty page creation.

## Short Flow

User request
  -> MCP transport
  -> server.ts tool registry
  -> AI workflow planning
  -> HTML analysis / page fetch / skill discovery
  -> generate Hyperform-compliant config
  -> validate_page_staging_config
  -> auto-fix and revalidate
  -> preview / screenshot verification
  -> refine
  -> user review
  -> update_page or save_record
  -> result returned
`;
