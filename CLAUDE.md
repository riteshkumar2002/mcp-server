# Hyperform MCP Server — Claude Instructions

## MANDATORY: Always Use Skills for Page Work

**Never build or modify Hyperform page JSON from memory or guesswork.**
Always invoke the appropriate skill before generating any page config, uiSchema, schema, or elements.

### Which skill to use

All skills live under `.claude/commands/hyperform-ui-skill/`. Use the full namespaced path to invoke them.

| Task | Skill to invoke |
|---|---|
| **Full end-to-end page edit/create with visual validation** | `/hyperform-ui-skill:core:hyperform-page-editor` |
| **Browse all skills + folder map** | `/hyperform-ui-skill` (README) |
| Create or modify any page (list, form, tree, action) | `/hyperform-ui-skill:core:impaktapps-jsonforms-page-builder` |
| Add a file/document upload control to a page | `/hyperform-ui-skill:components:buttons:hyperform-upload-button` |
| Add a radio button that shows/hides fields conditionally | `/hyperform-ui-skill:components:inputs:add-radiobutton-conditional` |
| Add a slider (amount, percentage, quantity, calculator) | `/hyperform-ui-skill:components:inputs:add-input-slider` |
| Add tabs to organize content (TabSection / TabLayout) | `/hyperform-ui-skill:components:layout:add-tab-section` |
| Add icon-only action buttons (table row or header) | `/hyperform-ui-skill:components:buttons:add-icon-button` |
| Add charts / graphs (Bar, Pie, Line, StackBar, HorizontalBar) to a page | `/hyperform-ui-skill:components:data-display:add-graph` |
| Add KPI metric cards to a dashboard | `/hyperform-ui-skill:components:data-display:add-card` |
| Add multi-line text input (comments, notes, message body) | `/hyperform-ui-skill:components:inputs:add-textarea` |
| Add file upload/download/delete (attachments, documents) | `/hyperform-ui-skill:components:files:add-file-input` |
| Add multi-value selection (recipients, tags, permissions) | `/hyperform-ui-skill:components:inputs:add-multiple-select` |
| Add button with both icon and text label | `/hyperform-ui-skill:components:buttons:add-button-with-icon-and-text` |
| Add progress bar (target vs achievement tracking) | `/hyperform-ui-skill:components:data-display:add-progress-bar` |
| Add checkbox (boolean toggle, row selection, agreement) | `/hyperform-ui-skill:components:inputs:add-checkbox` |
| Add standalone upload button (invoice, certificate, CSV) | `/hyperform-ui-skill:components:files:add-upload-file` |
| Add standalone download button for previously uploaded files | `/hyperform-ui-skill:components:files:add-download-file` |
| Add leaderboard (ranked list with medals, scores, images) | `/hyperform-ui-skill:components:data-display:add-leaderboard` |
| Add motivational/inspirational thought banner to a page | `/hyperform-ui-skill:components:gamification:add-thought` |
| Add animated runner progress bar (gamified goal tracking) | `/hyperform-ui-skill:components:gamification:add-runner-boy-progress-bar` |
| Add countdown timer (contest/campaign deadline display) | `/hyperform-ui-skill:components:gamification:add-timer` |
| Add invisible spacer to fill grid columns and align elements | `/hyperform-ui-skill:components:layout:add-empty-box` |
| Add side-by-side multi-column container (2-col, 3-col layouts) | `/hyperform-ui-skill:components:layout:add-horizontal-layout` |
| Add static text label, section title, or caption display | `/hyperform-ui-skill:components:layout:add-box` |
| Add rank card (user's personal position/rank display) | `/hyperform-ui-skill:components:data-display:add-rank-card` |
| Add date picker / date range control | `/hyperform-ui-skill:components:inputs:add-datepicker` |
| Add searchable dropdown / LOV select | `/hyperform-ui-skill:components:inputs:add-dropdown` |
| Look up widget types, layout rules, uiSchema structure | `/hyperform-ui-skill:core:json-ui` |
| Validate a rendered page with Playwright after building/modifying it | `/hyperform-ui-skill:core:playwright-validation` |

### Rules

1. **Before writing any page JSON** — invoke the matching skill first, then follow its patterns exactly.
2. **Never invent widget types** — only use types defined in the skills.
3. **Build `config` only — never build uiSchema or schema manually.** Both `update_page` and `preview_session_from_config` call `buildUiSchema` / `buildSchema` internally. You only ever construct and pass the `config` object.
4. **Never skip the staging save flow** — always use `update_page(pageName, config, userId)` which auto-derives uiSchema/schema and handles reject-staging → save.
5. **Never auto-approve** — leave all saved pages for manual approval in the workflow dashboard.
6. **userId** defaults to `1` unless explicitly provided.
7. **masterName for page operations is always** `com.act21.hyperform3.entity.page.PageStaging` — never `PageMaster` or any other value when working with pages.
8. **After building or modifying any page** — use `preview_session_from_config(config, pageName)` to render and take screenshots. Never assume the page renders correctly without running Playwright.
9. **For full-cycle work** (edit + visual confirm + iterate) — invoke `/hyperform-ui-skill:core:hyperform-page-editor` which orchestrates: parse request (including image analysis) → fetch page → edit config in memory → `preview_session_from_config` → screenshot → compare → fix config and re-render up to 3 times → `update_page(config)` once at the end.

## Project Layout

- `src/tools/updatePage.ts` — main page save tool (full staging flow)
- `src/uiBuilder.ts` — shim for `buildUiSchema`, `buildConfig`, `buildSchema` from impaktapps-ui-builder UMD
- `src/apiClient.ts` — all backend API calls
- `.claude/commands/` — project skills

## Stack

- Node.js / TypeScript, CommonJS output (`dist/`)
- MCP server over HTTP (Express) and stdio
- Backend: Hyperform3 Spring Boot at configured `baseUrl`
