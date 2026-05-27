import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PAGE_BUILDER_GUIDE } from "./skills/pageBuilderGuide.js";
import { MCP_REQUEST_FLOW_GUIDE } from "./skills/requestFlowGuide.js";
import {
  configureSchema,
  checkAuthStatusSchema,
  logoutSchema,
  toolConfigure,
  toolCheckAuthStatus,
  toolLogout,
} from "./tools/authTools.js";

import {
  getPageRecordSchema,
  toolGetPageRecord,
  getRecordByIdSchema,
  getStagingByMainIdSchema,
  getRecordsByStatusSchema,
  getRecordsByIdsSchema,
  getApprovedDetailsSchema,
  getApprovedDetailsPaginatedSchema,
  getPendingDetailsSchema,
  getPendingDetailsPaginatedSchema,
  getRejectedDetailsSchema,
  getRejectedDetailsPaginatedSchema,
  getDraftDetailsSchema,
  getDraftDetailsPaginatedSchema,
  getPendingActionDetailsSchema,
  getPendingActionDetailsPaginatedSchema,
  toolGetRecordById,
  toolGetStagingByMainId,
  toolGetRecordsByStatus,
  toolGetRecordsByIds,
  toolGetApprovedDetails,
  toolGetApprovedDetailsPaginated,
  toolGetPendingDetails,
  toolGetPendingDetailsPaginated,
  toolGetRejectedDetails,
  toolGetRejectedDetailsPaginated,
  toolGetDraftDetails,
  toolGetDraftDetailsPaginated,
  toolGetPendingActionDetails,
  toolGetPendingActionDetailsPaginated,
} from "./tools/fetchPage.js";

import {
  saveRecordSchema,
  masterActionSchema,
  deleteRecordSchema,
  toolSaveRecord,
  toolMasterAction,
  toolDeleteRecord,
} from "./tools/writePage.js";

import {
  updatePageSchema,
  toolUpdatePage,
} from "./tools/updatePage.js";

import {
  createPageSchema,
  toolCreatePage,
} from "./tools/createPage.js";

import {
  validatePageStagingConfigSchema,
  toolValidatePageStagingConfig,
} from "./tools/validatePageStagingConfig.js";

import {
  renderPageSchema,
  toolRenderPage,
} from "./tools/renderPage.js";

import {
  launchPreviewSchema,
  closePreviewSchema,
  previewFromConfigSchema,
  toolLaunchPreview,
  toolClosePreview,
  toolPreviewFromConfig,
} from "./tools/launchPreview.js";

import {
  previewLaunchSessionSchema,
  previewScreenshotSchema,
  previewCloseSessionSchema,
  previewSessionFromConfigSchema,
  htmlPreviewSchema,
  toolPreviewLaunchSession,
  toolPreviewScreenshot,
  toolPreviewCloseSession,
  toolPreviewSessionFromConfig,
  toolHtmlPreview,
} from "./tools/playwrightSession.js";

import {
  validatePageSchema,
  toolValidatePage,
} from "./tools/validatePage.js";

import {
  listComponentSkillsSchema,
  toolListComponentSkills,
  getComponentSkillSchema,
  toolGetComponentSkill,
} from "./tools/skillTools.js";

import {
  readFileSchema,
  toolReadFile,
  writeFileSchema,
  toolWriteFile,
  listFilesSchema,
  toolListFiles,
} from "./tools/fileTools.js";

import {
  getUiSchemaStructureSchema,
  updateControlConfigSchema,
  changeWidgetSchema,
  updateLayoutSchema,
  addControlSchema,
  removeControlSchema,
  addSectionSchema,
  reorderControlsSchema,
  toolGetUiSchemaStructure,
  toolUpdateControlConfig,
  toolChangeWidget,
  toolUpdateLayout,
  toolAddControl,
  toolRemoveControl,
  toolAddSection,
  toolReorderControls,
} from "./tools/modifyUiSchema.js";

/**
 * Creates a fresh McpServer instance with all tools registered.
 * Called once per client session so each connection gets its own server.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "hyperform-ui-mcp",
    version: "1.0.0",
  });

  // ── Auth tools ──────────────────────────────────────────────────────────────

  server.tool(
    "configure",
    [
      "SETUP REQUIRED FIRST: Configure this MCP server with your Hyperform3 credentials.",
      "Provide backendUrl (e.g. 'http://192.168.1.10:8081'), username, and password.",
      "Logs in, stores JWT locally, and auto-refreshes it when it expires.",
      "Run once — credentials persist in ~/.hyperform-mcp/config.json.",
    ].join(" "),
    configureSchema.shape,
    toolConfigure
  );

  server.tool(
    "check_auth_status",
    "Check whether this MCP server is configured and authenticated. Shows backend URL and current user.",
    checkAuthStatusSchema.shape,
    (args) => Promise.resolve(toolCheckAuthStatus(args))
  );

  server.tool(
    "logout",
    "Clear stored credentials and JWT. You will need to run 'configure' again before using other tools.",
    logoutSchema.shape,
    (args) => Promise.resolve(toolLogout(args))
  );

  // ── Fetch tools ─────────────────────────────────────────────────────────────

  server.tool(
    "get_page_record",
    [
      "Fetch a page record by PAGE NAME (not ID).",
      "Calls POST /page/getByName to resolve the name to an ID, then fetches the full master record via /master/getDetailById.",
      "Set fetchStaging=true to also retrieve the staging (pending/draft) record.",
      "Use this as the first step before modifying any page — it gives you the current uiSchema and schema.",
    ].join(" "),
    getPageRecordSchema.shape,
    toolGetPageRecord
  );

  server.tool(
    "get_record_by_id",
    "Fetch a single MDM record by ID and master name (e.g. 'com.act21.hyperform3.entity.page.PageStaging'). Returns full record including uiSchema and schema.",
    getRecordByIdSchema.shape,
    toolGetRecordById
  );

  // server.tool(
  //   "get_staging_by_main_id",
  //   "Fetch the staging (draft/pending) record for a given main record ID and master name.",
  //   getStagingByMainIdSchema.shape,
  //   toolGetStagingByMainId
  // );

  // server.tool(
  //   "get_records_by_status",
  //   "Fetch all MDM records of a given master filtered by status: 'A'=Approved, 'P'=Pending, 'R'=Rejected, 'D'=Draft.",
  //   getRecordsByStatusSchema.shape,
  //   toolGetRecordsByStatus
  // );

  // server.tool(
  //   "get_records_by_ids",
  //   "Fetch multiple MDM records by a list of IDs for a given entity class name.",
  //   getRecordsByIdsSchema.shape,
  //   toolGetRecordsByIds
  // );

  // server.tool(
  //   "get_approved_details",
  //   "Fetch all approved records for a given master (/master/getApprovedDetails).",
  //   getApprovedDetailsSchema.shape,
  //   toolGetApprovedDetails
  // );

  // server.tool(
  //   "get_approved_details_paginated",
  //   "Fetch approved records with pagination (requires pageIndex and size).",
  //   getApprovedDetailsPaginatedSchema.shape,
  //   toolGetApprovedDetailsPaginated
  // );

  // server.tool(
  //   "get_pending_details",
  //   "Fetch all pending-approval records for a given master.",
  //   getPendingDetailsSchema.shape,
  //   toolGetPendingDetails
  // );

  // server.tool(
  //   "get_pending_details_paginated",
  //   "Fetch pending records with pagination (requires pageIndex and size).",
  //   getPendingDetailsPaginatedSchema.shape,
  //   toolGetPendingDetailsPaginated
  // );

  // server.tool(
  //   "get_rejected_details",
  //   "Fetch all rejected records for a given master.",
  //   getRejectedDetailsSchema.shape,
  //   toolGetRejectedDetails
  // );

  // server.tool(
  //   "get_rejected_details_paginated",
  //   "Fetch rejected records with pagination (requires pageIndex and size).",
  //   getRejectedDetailsPaginatedSchema.shape,
  //   toolGetRejectedDetailsPaginated
  // );

  // server.tool(
  //   "get_draft_details",
  //   "Fetch all draft records for a given master.",
  //   getDraftDetailsSchema.shape,
  //   toolGetDraftDetails
  // );

  // server.tool(
  //   "get_draft_details_paginated",
  //   "Fetch draft records with pagination (requires pageIndex and size).",
  //   getDraftDetailsPaginatedSchema.shape,
  //   toolGetDraftDetailsPaginated
  // );

  // server.tool(
  //   "get_pending_action_details",
  //   "Fetch records awaiting action for a given master.",
  //   getPendingActionDetailsSchema.shape,
  //   toolGetPendingActionDetails
  // );

  // server.tool(
  //   "get_pending_action_details_paginated",
  //   "Fetch pending-action records with pagination (requires pageIndex and size).",
  //   getPendingActionDetailsPaginatedSchema.shape,
  //   toolGetPendingActionDetailsPaginated
  // );

  // ── Write tools ─────────────────────────────────────────────────────────────

  server.tool(
    "save_record",
    "Save (create or update) an MDM record via /master/save. For page records, include uiSchema and schema in entityValue.",
    saveRecordSchema.shape,
    toolSaveRecord
  );

  // server.tool(
  //   "approve_or_reject_record",
  //   "Approve ('A') or reject ('R') a staged MDM record via /master/action.",
  //   masterActionSchema.shape,
  //   toolMasterAction
  // );

  // server.tool(
  //   "delete_record",
  //   "Delete an MDM record by entity class name and ID via /master/delete.",
  //   deleteRecordSchema.shape,
  //   toolDeleteRecord
  // );

  server.tool(
    "create_page",
    [
      "Create a new HyPerform page in PageStaging.",
      "Accepts name, label, hasBackIcon, and optional page-level events.",
      "The tool always creates config.type='page', derives config/uiSchema/schema with impaktapps-ui-builder,",
      "sets id=null and main=null, validates the PageStaging payload, then calls /master/save with",
      "entityName='com.act21.hyperform3.entity.page.PageStaging'.",
      "Use this for new pages; use update_page for existing page edits.",
    ].join(" "),
    createPageSchema.shape,
    toolCreatePage
  );

  server.tool(
    "update_page",
    [
      "MANDATORY WORKFLOW — follow these steps in order:",
      "(1) Call list_component_skills to see all available component guides.",
      "(2) For EVERY component you need to add or modify, call get_component_skill(skillName)",
      "    to load the authoritative config/uiSchema/schema patterns before writing any JSON.",
      "    Never invent widget types or event structures — always get them from the skill guide first.",
      "(3) Fetch the current page with get_page_record(pageName) to see what already exists.",
      "(4) Build the updated config object following the skill guide patterns exactly.",
      "(5) Call validate_page_staging_config and fix/retry until validation passes.",
      "(6) Preview with preview_from_config or preview_session_from_config when visual verification is needed.",
      "(7) Call update_page with the pageName and the full validated config.",
      "",
      "What this tool does: fetches the page by name, calls buildUiSchema/buildConfig/buildSchema",
      "on your config, validates the derived PageStaging payload, rejects any existing staging record, and saves a new staging record",
      "to the backend via /master/save. The page is left in staging for manual approval.",
      "Fields you omit are preserved from the current server state.",
      "userId defaults to the value stored during setup (usually 1).",
    ].join(" "),
    updatePageSchema.shape,
    toolUpdatePage
  );

  server.tool(
    "validate_page_staging_config",
    [
      "Validate a HyPerform page config before saving it as PageStaging.",
      "Builds derived config, uiSchema, and schema with impaktapps-ui-builder,",
      "then checks the same PageStaging payload fields update_page will send to /master/save.",
      "Use this in a retry loop: validate config, fix any errors, validate again, preview if needed, then call update_page.",
    ].join(" "),
    validatePageStagingConfigSchema.shape,
    (args) => Promise.resolve(toolValidatePageStagingConfig(args))
  );

  // ── File system tools ────────────────────────────────────────────────────────

  server.tool(
    "read_file",
    [
      "Read a local text file and return its contents.",
      "Use this for HTML-to-page conversion before html_preview so the AI can inspect DOM/source structure.",
      "Large files are truncated by maxBytes to keep MCP responses manageable.",
    ].join(" "),
    readFileSchema.shape,
    toolReadFile
  );

  server.tool(
    "write_file",
    [
      "Write text content to a file at the given path on the local filesystem.",
      "Creates any missing parent directories automatically.",
      "Set overwrite=false to prevent clobbering an existing file.",
      "Encoding defaults to utf8; supports ascii, base64, hex, latin1.",
    ].join(" "),
    writeFileSchema.shape,
    toolWriteFile
  );

  server.tool(
    "list_files",
    [
      "List all files inside a directory on the local filesystem.",
      "Set recursive=true to walk subdirectories.",
      "Set includeHidden=true to include dot-files and dot-folders.",
      "Use pattern to filter by file extension (e.g. '.ts', '.json').",
      "Returns absolute paths, a file count, and the resolved directory.",
    ].join(" "),
    listFilesSchema.shape,
    toolListFiles
  );

  // ── uiSchema modification tools (pure, no HTTP) ───────────────────────────

  server.tool(
    "get_uischema_structure",
    "Print a human-readable tree of a uiSchema — shows all sections, widgets, scopes, and grid sizes. Use this before modifying a page.",
    getUiSchemaStructureSchema.shape,
    (args) => Promise.resolve(toolGetUiSchemaStructure(args))
  );

  server.tool(
    "update_control_config",
    "Merge new props into config.main of a control (e.g. change label, placeholder, disabled, items). Returns the modified uiSchema.",
    updateControlConfigSchema.shape,
    (args) => Promise.resolve(toolUpdateControlConfig(args))
  );

  server.tool(
    "change_widget",
    "Change the widget type of a control (e.g. InputField → SelectInputField). Returns the modified uiSchema.",
    changeWidgetSchema.shape,
    (args) => Promise.resolve(toolChangeWidget(args))
  );

  server.tool(
    "update_control_layout",
    "Resize a control's grid column span (MUI 12-column: lg, md, sm, xs). Returns the modified uiSchema.",
    updateLayoutSchema.shape,
    (args) => Promise.resolve(toolUpdateLayout(args))
  );

  server.tool(
    "add_control",
    "Add a new Control element into a section or the root. Optionally insert after a specific scope.",
    addControlSchema.shape,
    (args) => Promise.resolve(toolAddControl(args))
  );

  server.tool(
    "remove_control",
    "Remove a control by its scope from the uiSchema. Returns the modified uiSchema.",
    removeControlSchema.shape,
    (args) => Promise.resolve(toolRemoveControl(args))
  );

  server.tool(
    "add_section",
    "Add a new WrapperLayout section to the page root. Optionally insert after a specific section scope.",
    addSectionSchema.shape,
    (args) => Promise.resolve(toolAddSection(args))
  );

  server.tool(
    "reorder_controls",
    "Reorder controls within a section by providing scopes in the desired order. Returns the modified uiSchema.",
    reorderControlsSchema.shape,
    (args) => Promise.resolve(toolReorderControls(args))
  );

  // ── Component skill tools ─────────────────────────────────────────────────────
  // These expose the .claude/commands/*.md skill files to any MCP client.
  // Clients (Claude Desktop, Cursor, etc.) should call list_component_skills first,
  // then get_component_skill before adding any component to a page.

  server.tool(
    "list_component_skills",
    [
      "List all available HyPerform component skill guides.",
      "Returns a table of skill names and descriptions.",
      "ALWAYS call this before adding any new component to a page so you know which",
      "get_component_skill name to use for the component you need.",
    ].join(" "),
    listComponentSkillsSchema.shape,
    (args) => Promise.resolve(toolListComponentSkills(args))
  );

  server.tool(
    "get_component_skill",
    [
      "Load the complete skill guide for a specific HyPerform component.",
      "Returns the full config.elements / uiSchema.elements / schema.properties patterns,",
      "critical rules, common mistakes, and a real working example.",
      "REQUIRED: call this for EVERY component type before generating its JSON.",
      "Use list_component_skills to get the correct skillName for the component you need.",
      "Examples: add-box, add-graph, add-leaderboard, add-timer, add-rank-card,",
      "add-download-file, add-upload-file, add-checkbox, add-tab-section,",
      "add-horizontal-layout, add-progress-bar, add-runner-boy-progress-bar.",
    ].join(" "),
    getComponentSkillSchema.shape,
    (args) => Promise.resolve(toolGetComponentSkill(args))
  );

  // ── Skill: Page Builder Guide ─────────────────────────────────────────────────
  // Registered as Resource + Prompt + Tool so every MCP client can access it.

  server.resource(
    "page-builder-guide",
    "skill://page-builder-guide",
    {
      mimeType: "text/markdown",
      description:
        "Complete reference for building and modifying HyPerform / impaktapps-jsonforms pages: " +
        "page structure, component catalog, event patterns, API paths, LOV conventions, " +
        "tree table pattern, entity staging class paths, and 10 critical rules.",
    },
    (_uri) => ({
      contents: [
        {
          uri: "skill://page-builder-guide",
          mimeType: "text/markdown",
          text: PAGE_BUILDER_GUIDE,
        },
      ],
    })
  );

  server.prompt(
    "page_builder_guide",
    "Load the complete HyPerform page-builder skill into the conversation context. " +
    "Use this before creating or modifying any page JSON to get full knowledge of " +
    "page structure, components, event patterns, API paths, and critical rules.",
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              "Please study the following HyPerform page-builder guide and use it " +
              "as your authoritative reference for all page creation and modification tasks:\n\n" +
              PAGE_BUILDER_GUIDE,
          },
        },
      ],
    })
  );

  // ── render_page — open a page in the browser via json_to_ui ─────────────────

  server.resource(
    "mcp-request-flow-guide",
    "skill://mcp-request-flow-guide",
    {
      mimeType: "text/markdown",
      description:
        "Operational workflow for handling user requests: request classification, HTML-to-page conversion, " +
        "Hyperform config generation, validation, preview, Playwright verification, user review, and save.",
    },
    (_uri) => ({
      contents: [
        {
          uri: "skill://mcp-request-flow-guide",
          mimeType: "text/markdown",
          text: MCP_REQUEST_FLOW_GUIDE,
        },
      ],
    })
  );

  server.prompt(
    "mcp_request_flow",
    "Load the required end-to-end Hyperform MCP request workflow. Use this before complex page creation, HTML-to-page conversion, validation, preview, or save tasks.",
    () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              "Please follow this Hyperform MCP request processing flow for the current task:\n\n" +
              MCP_REQUEST_FLOW_GUIDE,
          },
        },
      ],
    })
  );

  server.tool(
    "render_page",
    [
      "Render a Hyperform page in the browser.",
      "Pass the absolute path to a JSON file containing { schema, uiSchema }.",
      "The backend server reads that file and the frontend at http://localhost:5173 renders it.",
      "Both servers must be running: 'node backend/server.js' and 'npm run dev' in D:\\Act21files\\frontend.",
    ].join(" "),
    renderPageSchema.shape,
    (args) => Promise.resolve(toolRenderPage(args))
  );

  // ── launch_preview / close_preview ───────────────────────────────────────────

  server.tool(
    "launch_preview",
    [
      "Launch the UI renderer to preview a JSON schema file in the browser.",
      "Pass the absolute path to a JSON file containing { schema, uiSchema }.",
      "Starts 'node start.js <path>' in the frontend directory, waits until",
      "http://localhost:5173 is accessible, then returns the preview URL.",
      "The renderer keeps running until close_preview is called.",
    ].join(" "),
    launchPreviewSchema.shape,
    (args) => toolLaunchPreview(args)
  );

  server.tool(
    "close_preview",
    "Stop the running UI preview renderer. Kills the start.js process and frees ports 4000 and 5173.",
    closePreviewSchema.shape,
    (args) => Promise.resolve(toolClosePreview(args))
  );

  server.tool(
    "preview_from_config",
    [
      "Build uiSchema and schema from a page config object, write them to a preview file,",
      "and launch the UI renderer at http://localhost:5173.",
      "Pass the raw config object (same as you would pass to update_page) and a pageName.",
      "buildUiSchema and buildSchema are called automatically — you never need to build them manually.",
      "The renderer keeps running until close_preview is called.",
    ].join(" "),
    previewFromConfigSchema.shape,
    (args) => toolPreviewFromConfig(args)
  );

  // ── Playwright session tools ──────────────────────────────────────────────────

  server.tool(
    "preview_launch_session",
    [
      "Launch the UI renderer and open a persistent Playwright browser session.",
      "Pass the absolute path to a JSON file containing { schema, uiSchema }.",
      "Starts 'node start.js <path>', waits for http://localhost:5173, then opens a Chromium",
      "browser, navigates to the rendered UI, and returns an initial screenshot.",
      "The session stays open — use preview_screenshot to take more screenshots,",
      "and preview_close_session when done.",
    ].join(" "),
    previewLaunchSessionSchema.shape,
    (args) => toolPreviewLaunchSession(args)
  );

  server.tool(
    "preview_screenshot",
    [
      "Take a screenshot of the currently open Playwright preview session.",
      "Optionally pass a CSS selector to capture only a specific element.",
      "Pass a label to identify the screenshot filename.",
      "Returns the screenshot as an inline image and saves it to playwright-results/screenshots/.",
      "Requires preview_launch_session to have been called first.",
    ].join(" "),
    previewScreenshotSchema.shape,
    (args) => toolPreviewScreenshot(args)
  );

  server.tool(
    "preview_close_session",
    "Close the active Playwright browser session and stop the renderer. Frees ports 4000 and 5173.",
    previewCloseSessionSchema.shape,
    (args) => toolPreviewCloseSession(args)
  );

  server.tool(
    "preview_session_from_config",
    [
      "Build uiSchema and schema from a page config object, write them to a preview file,",
      "launch the UI renderer, then open a persistent Playwright browser session at http://localhost:5173.",
      "Pass the raw config object (same as you would pass to update_page) and a pageName.",
      "buildUiSchema and buildSchema are called automatically — you never need to build them manually.",
      "Returns an initial screenshot inline. Use preview_screenshot for more, preview_close_session when done.",
    ].join(" "),
    previewSessionFromConfigSchema.shape,
    (args) => toolPreviewSessionFromConfig(args)
  );

  server.tool(
    "html_preview",
    [
      "Open a local HTML file in a Playwright browser and return a full-page screenshot.",
      "For HTML-to-page conversion, call read_file first to inspect source structure, then call html_preview for visual reference.",
      "Pass the absolute path to any .html file — no server or renderer process is required;",
      "the file is loaded directly via a file:// URL.",
      "The session stays open so you can call preview_screenshot for more shots",
      "and preview_close_session when finished.",
      "Set headless=false to watch the browser on screen.",
      "Use waitUntil='networkidle' for pages that load content asynchronously.",
    ].join(" "),
    htmlPreviewSchema.shape,
    (args) => toolHtmlPreview(args)
  );

  // ── validate_page — save JSON → start renderer → Playwright → return results ──

  server.tool(
    "validate_page",
    [
      "Save page JSON (uiSchema + schema) to frontend/generated/generated-schema.json,",
      "start the frontend renderer via 'node start.js', wait until http://localhost:5173 is accessible,",
      "run Playwright tests to verify the expected elements are visible in the rendered page,",
      "then stop the renderer and return pass/fail results with screenshots.",
      "If validation fails, analyze the failure, fix the uiSchema/schema, and call this tool again",
      "with attemptNumber incremented (max 3 attempts before giving up).",
    ].join(" "),
    validatePageSchema.shape,
    (args) => toolValidatePage(args)
  );

  server.tool(
    "get_page_builder_guide",
    [
      "Return the complete HyPerform / impaktapps-jsonforms page-builder skill guide.",
      "Covers: page JSON structure, list vs form page layout, all component types,",
      "event patterns (API/custom/refresh/navigate/notify/onChange/approve/reject),",
      "LOV API conventions, tree table pattern, entity staging class paths,",
      "and 10 critical rules you must never violate.",
      "Call this before generating or modifying any page JSON.",
    ].join(" "),
    {},
    () =>
      Promise.resolve({
        content: [{ type: "text" as const, text: PAGE_BUILDER_GUIDE }],
      })
  );

  server.tool(
    "get_mcp_request_flow",
    [
      "Return the end-to-end Hyperform MCP request processing flow.",
      "Covers request classification, HTML reference analysis, skill discovery, config generation,",
      "validation/autofix loops, Hyperform preview, HTML preview, Playwright verification, user review, and save.",
    ].join(" "),
    {},
    () =>
      Promise.resolve({
        content: [{ type: "text" as const, text: MCP_REQUEST_FLOW_GUIDE }],
      })
  );

  return server;
}
