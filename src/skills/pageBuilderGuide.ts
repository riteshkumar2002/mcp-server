/**
 * Embedded skill guide for building and modifying impaktapps-jsonforms pages.
 * Content is sourced from impaktapps-jsonforms-page-builder.skill.md and the
 * HyPerform platform training documentation (chapter 8.3).
 *
 * Registered in server.ts as:
 *   - MCP Resource  → skill://page-builder-guide
 *   - MCP Prompt    → page_builder_guide
 *   - MCP Tool      → get_page_builder_guide
 */

export const PAGE_BUILDER_GUIDE = `
# impaktapps-jsonforms Page Builder Guide
# HyPerform Page Master — Complete Reference

This guide covers everything needed to build and modify pages in the HyPerform /
impaktapps-jsonforms platform. Read this before creating or editing any page JSON.

---

## PART 1 — PLATFORM CONCEPTS (HyPerform Chapter 8.3)

### What is a Page?
Pages are the visual/UI layer of HyPerform where users interact with components,
perform actions, and view analytical data. Pages are dynamic — they respond to user
interactions and system triggers through event handlers connected to ImpaktApps rules.

**Page URL pattern:**  https://hyperform3-demo.act21.io/Page_{page_name}
**Menu visibility:**   Add an entry to the Menu_Item table in the database.

### Page Master — 5 Sub-Sections
1. Page       — base structure: name, heading
2. Component  — UI building blocks arranged on a 12-column grid
3. Event      — actions/triggers at page or component level
4. Validation — data integrity rules (Required, Min/Max Length, Pattern)
5. Verify     — review all config, save, and test via the page URL

### Component Configuration Sections (each component has 5)
| Section     | Purpose |
|-------------|---------|
| Core        | type, name, label, layout (grid column span) |
| Components  | nested/child components within a container/parent |
| Properties  | behavior and interaction settings |
| Style       | JSON-based visual styling |
| Validation  | Required, min/max length, format patterns |

### HyPerform Event Handler Types
1. **Custom**        — user-defined JS/script logic
2. **Internal API**  — calls /HyperformMessage/process with body: { artifactId, version, messageType, groupId }
3. **External API**  — any third-party URL endpoint
4. **Inbuilt Function** — predefined platform operations
5. **Refresh**       — re-triggers data loading for a component or the whole page

Internal API body params:
  - artifactId  : project artifact ID (e.g. "Hl_training_dsa")
  - version     : deployed version (e.g. 1)
  - messageType : maps to the specific rule/logic to execute
  - groupId     : group associated with the rule configuration

---

## PART 2 — JSON PAGE STRUCTURE

### Top-Level Page Shape
\`\`\`json
{
  "name": "page_entityName",
  "type": "page",
  "label": "Human Label",
  "template": "Template-1",
  "hasBackIcon": "NO",
  "elementsSelected": {"id": {}, "data": []},
  "events": [],
  "elements": []
}
\`\`\`

**Two main page types per entity:**
- \`page_entity\`      — list page (4-tab: Approved / Required Action / Queued / Rejected)
- \`page_entityForm\`  — create/edit form page

### Field Name Rule
JSON field names MUST match Java property names exactly (camelCase from column_name):
- role_id → roleId,  parent_position_id → parentPositionId,  is_dual_identity → isDualIdentity

---

## PART 3 — LIST PAGE STRUCTURE

\`\`\`
elements[]
  ├── filterWrapper  (WrapperSection, isAccordion:"No")
  └── entityTabs     (TabSection, sectionLabels: [Approved, Required Action, Queued, Rejected])
        ├── approvedTab       (HorizontalLayout) → approvedTable
        ├── requiredActionTab (HorizontalLayout) → reqActionTable + remarks + approve/reject buttons
        ├── queuedTab         (HorizontalLayout) → queuedTable
        └── rejectedTab       (HorizontalLayout) → rejectedTable
\`\`\`

Filter row always fills 12 cols: fields lg:3 each + emt1 spacer + Search lg:1.5 + Reset lg:1.5 + emt2 fill.

### 4 Table API Paths
| Tab             | API Path                               |
|-----------------|----------------------------------------|
| Approved        | master/getApprovedDetailsPaginated     |
| Required Action | master/getPendingActionDetailsPaginated|
| Queued          | master/getPendingDetailsPaginated      |
| Rejected        | master/getRejectedDetailsPaginated     |

Standard table body[]:
\`\`\`json
[{"key":"size","value":"10"},{"key":"pageIndex","value":"0"},{"key":"entityName","value":"SimpleClassName"}]
\`\`\`
entityName here = simple class name (e.g. "HierarchyNode") — NOT the full staging path.

Standard apiBody function:
\`\`\`js
(store, dynamicData, userValue, body) => {
  let filters = [];
  if (store.ctx.core.data?.filter_field) {
    filters.push({ key: 'javaField', value: [store.ctx.core.data.filter_field], operator: 'iLike' });
  }
  return { ...body, filters, sortingInfo: [] };
}
\`\`\`
Use operator:'iLike' for text fields, operator:'equals' for Select/chip fields.

### Page onLoad for filter dropdowns
\`\`\`js
async (store) => {
  store.setSchema((pre) => {
    const p = { ...pre.properties };
    p.fieldName = { ...p.fieldName, oneOf: [{ const: 'VAL', title: 'Label' }] };
    return { ...pre, properties: p };
  });
}
\`\`\`

---

## PART 4 — FORM PAGE STRUCTURE

\`\`\`
elements[]
  ├── topSpacer    (EmptyBox lg:12)
  └── formWrapper  (WrapperSection, label:" ", isAccordion:"No")
        ├── basicInfoSection (WrapperSection, isAccordion:"YES", accordionLabel:"...", divider:"YES")  ← FIRST only
        ├── section2         (WrapperSection, isAccordion:"YES", accordionLabel:"...")
        └── formActionBar    (WrapperSection, label:" ", isAccordion:"No")
              ├── cancelBtn lg:2
              ├── saveBtn   lg:2
              └── emptyFormSpace lg:8
\`\`\`

Fields: lg:3 each. Fill rows to 12 with EmptyBox spacers.

### Form onLoad — CRITICAL ORDER
1. store.setSchema(...)            — hardcoded enums (status, type)
2. LOV API calls + store.setSchema — dropdown options  ← MUST come BEFORE setFormdata
3. If id param: fetch record → store.setFormdata(...)
4. If disabled=true: disable all fields via setSchema

GUARD ALL LOV setSchema: \`if (options.length) store.setSchema(...)\` — empty oneOf crashes.

\`\`\`js
async (store, dynamicData, userValue, body, service) => {
  const masterName = 'com.act21.hyperform3.entity.master.PACKAGE.EntityStaging';
  const id = store.searchParams?.get('id');
  const disabled = store.searchParams?.get('disabled') === 'true';

  // 1. Hardcoded enums
  store.setSchema((pre) => { ... });

  // 2. LOV from API
  try {
    const res = await service.get('master/getDetailsByStatus?masterName=...&status=A');
    const options = (res?.data || []).map(r => ({ const: r.id, title: r.fieldName }));
    if (options.length) store.setSchema((pre) => {
      const p = {...pre.properties};
      p.fieldId = {...p.fieldId, oneOf: options};
      return {...pre, properties: p};
    });
  } catch (e) { console.error(e); }

  // 3. Load form data
  if (id) {
    const res = await service.get(\`master/getDetailById?masterName=\${masterName}&id=\${id}\`);
    store.setFormdata({ editEntityId: res.data.id, ...res.data });
    if (disabled) {
      store.setSchema((pre) => ({
        ...pre,
        properties: Object.fromEntries(
          Object.entries(pre.properties || {}).map(([k, v]) => [k, { ...v, disabled: true }])
        )
      }));
    }
  }
}
\`\`\`

### Form Save apiBody
\`\`\`js
(store, dynamicData, userValue, body) => {
  const data = store?.ctx?.core?.data || {};
  return {
    entityName: 'com.act21.hyperform3.entity.master.PACKAGE.EntityStaging',
    entityValue: { id: data?.editEntityId || null, field1: data?.field1, ... },
    userId: userValue?.userId
  };
}
\`\`\`

---

## PART 5 — COMPONENT REFERENCE

| Type           | Key Notes |
|----------------|-----------|
| Text           | Use maxLength, validation with pattern for PAN/mobile/email/pincode |
| Select         | Always needs elements:[], lazyLoading:"NO", elementsSelected:{"id":{},"data":{}} |
| Date           | No extra props needed |
| Radio          | Use sectionLabels:[{label:"YES"},{label:"NO"}] for boolean fields |
| CheckBox       | elementType:"tableAction" when used as row selector in tables |
| TextArea       | For remarks fields below req action table |
| EmptyBox       | Spacers to fill 12-col grid rows |
| WrapperSection | Container. isAccordion:"YES" needs matching accordionLabel + label |
| TabSection     | Needs sectionLabels:[{label:"..."}] array |
| HorizontalLayout | Direct child of TabSection, layout:[] (empty) |
| Table          | Standard: lazyLoading:"YES", disableSorting:"NO", disableEditColumn:"YES", disableColumnFilter:"YES", disableDownloadFile:"YES", disableGlobalSearch:"YES" |
| Button         | buttonType:"Button" primary; "IconButton" table actions. elementType:"tableAction" or "tableHeader" |
| ColumnGroup    | old/new column pair in Required Action table |

NO Number component — use Text with pattern ^[0-9]+$

HyPerform component types (chapter 8.3): Array, Button, Card, Checkbox, Container, Date,
Download File, Empty Box, File, Graph, Input Slider, Label, Leader Board, Multipleselect,
Pancard Details, Progress Bar, Progress Bar Card, Slider, Select, Speedometer, Radio,
Rank Card, Rank, Runner Boy, Table, Text, Tabs, Text Area, Timer, Upload File

---

## PART 6 — EVENT PATTERNS

### Refresh
\`\`\`json
{"Handler": "refresh", "eventType": "Success", "refreshElements": [{"value": "tableName"}]}
\`\`\`

### Navigate
\`\`\`js
store.navigate('/page_entityName');
store.navigate(\`/page_entityForm?id=\${id}\`);
store.navigate(\`/page_entityForm?id=\${id}&disabled=true\`);
store.navigate(-1);
\`\`\`

### Notify (toast)
\`\`\`js
store.setNotify({ SuccessMessage: 'Record sent for approval.', Success: true });
store.setNotify({ FailMessage: 'Please fill valid details', Fail: true });
\`\`\`

### Reset button
Always TWO events: custom (clear store.ctx.core.data.field = null) + refresh.

### onStart validation
\`\`\`js
async (store, dynamicData, user, body, service) => {
  const data = store?.ctx?.core?.data || {};
  if (!data?.field) {
    store.setValidation('ValidateAndShow');
    store.setNotify({ FailMessage: 'Please fill valid details', Fail: true });
    return false;
  }
  store.setValidation('ClearAll');
  return true;
}
\`\`\`

### onChange (dependent dropdowns)
\`\`\`js
async (store, dynamicData, userValue, body, service) => {
  const parentId = store?.newData?.parentField;   // use newData, NOT ctx.core.data
  store.ctx.core.data.dependentField = [];         // reset with []
  if (!parentId) return;
  const res = await service.get(\`api/getByParent?parentId=\${parentId}\`);
  const options = (res?.data || []).map(r => ({ const: r.id, title: r.name }));
  if (options.length) store.setSchema((pre) => {
    const p = {...pre.properties};
    p.dependentField = {...p.dependentField, oneOf: options};
    return {...pre, properties: p};
  });
}
\`\`\`

### Delete button
- apiBody uses FULL staging class path for entityName (unlike table body[] which uses simple name)
- Success events order: REFRESH FIRST, then toast

### Approve/Reject
- Path: workflow/completeTasks/2.0, method: post
- Use processBusinessKey (NOT workflowBusinessKey)
- Refresh on Approve: reqAction + approved + queued
- Refresh on Reject: reqAction + rejected + queued

\`\`\`js
// apiBody
(store, dynamicData, userValue, body) => {
  const selected = store?.ctx?.core?.data?.reqActionTable?.filter(e => e.selectRow) || [];
  if (!selected.length) return body;
  return selected.map(row => ({
    taskQueryInfo: {
      entityName: 'com.act21.hyperform3.entity.master.PACKAGE.StagingClass',
      userId: userValue.userId,
      candidateGroup: 'ADMIN',
      candidateUser: userValue.userName,
      processBusinessKeys: [row.processBusinessKey],
      userName: userValue.userName
    },
    completionMap: {
      isAsync: false,
      action: 'Approve',   // or 'Reject'
      remarks: store.ctx.core.data?.req_remarks || '',
      actionBy: userValue.userId
    }
  }));
}
\`\`\`

---

## PART 7 — REQUIRED ACTION TABLE

Locked properties:
\`\`\`json
{
  "selectKey": "selectRow",
  "SelectionAvailable": "YES",
  "enableRowSelection": "YES",
  "rowSelectionKey": "id",
  "selectedRowsStorageKey": "reqActionEntityTable_selectedRows"
}
\`\`\`

First column must be CheckBox with elementType:"tableAction".
onCellRenderer (isSync:"Yes"): colors old-changed cells red (#C70036), new-changed cells teal (#00897B).
normalizedCellKey = cellkey.replaceAll('_','') — use normalizedCellKey.startsWith('old'/'new'), not raw cellkey.

---

## PART 8 — TREE TABLE PAGE PATTERN

\`\`\`json
{
  "treeTable": "YES", "treeStructure": "YES", "lazyLoading": "YES",
  "treeTableKey": "id", "treeTableParentKey": "parentFieldName",
  "enableExpanding": "YES", "enableRowMovement": "NO",
  "filterFromLeafRows": "YES", "paginateExpandedRows": "YES", "defaultColumnSize": "100"
}
\`\`\`

Data loaded via: store.setFormdata({ tableName: rows, tableName_RowCount: rows.length }) — NOT from API directly.
onLoad uses Handler:"custom" ONLY — never mix Handler:"api" with eventCode (causes double API call).

---

## PART 9 — LOV API PATTERN

\`\`\`
master/getDetailsByStatus?masterName=com.act21.hyperform3.entity.master.PACKAGE.ClassName&status=A
\`\`\`

Display field conventions per entity:
- OrgEntity       → entityCode - entityName
- Channel         → channelCode - channelName
- HierarchyRole   → roleName
- Designation     → designationName
- HierarchyNode   → nodeCode - nodeName
- HierarchyPosition → positionCode
- EntityChannel   → entityChannelName
- Person          → employeeCode - name

State LOV: POST /page/getLOV with body [{"key":"type","value":"state"},{"key":"userId","value":"$userValue.userId"}]

---

## PART 10 — KNOWN ENTITY STAGING CLASS PATHS

| Entity             | Staging Class |
|--------------------|---------------|
| OrgEntity          | com.act21.hyperform3.entity.master.org_entity.OrgEntityStaging |
| Channel            | com.act21.hyperform3.entity.master.channel.ChannelStaging |
| HierarchyRole      | com.act21.hyperform3.entity.master.hierarchy_role.HierarchyRoleStaging |
| Designation        | com.act21.hyperform3.entity.master.designation.DesignationStaging |
| HierarchyNode      | com.act21.hyperform3.entity.master.hierarchy_node.HierarchyNodeStaging |
| HierarchyPosition  | com.act21.hyperform3.entity.master.hierarchy_position.HierarchyPositionStaging |
| Person             | com.act21.hyperform3.entity.master.person.PersonStaging |
| PositionAssignment | com.act21.hyperform3.entity.master.position_assignment.PositionAssignmentStaging |
| LeadGenerator      | com.act21.hyperform3.entity.master.lead_generator.LeadGeneratorStaging |
| LgSpMapping        | com.act21.hyperform3.entity.master.lg_sp_mapping.LgSpMappingStaging |
| EntityChannel      | com.act21.hyperform3.entity.master.entity_channel.EntityChannelStaging |

---

## PART 11 — SPECIAL FIELD PATTERNS

PAN validation:
  validationType:"pattern", validationValue:"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"

Mobile validation:
  validationType:"pattern", validationValue:"^[6-9][0-9]{9}$"

isDualIdentity Radio default: store.setFormdata((pre) => ({ ...pre, isDualIdentity: 'NO' }))

Download button: path master/downloadApprovedDetails (or Pending/Rejected/PendingAction variants)
  → Success: localStorage.setItem('downloadId', parentEventOutput.data)
  → then POST externalData/getById + inBuiltFunction downloadFile

---

## PART 12 — 10 CRITICAL RULES (NEVER VIOLATE)

1.  Delete apiBody → always FULL staging class (not simple name)
2.  Never call setSchema with empty oneOf — guard with: if (options.length)
3.  LOVs MUST load BEFORE setFormdata — dropdowns clear otherwise
4.  Never mix Handler:"api" + eventCode on same event — double API call
5.  Always use processBusinessKey — never workflowBusinessKey
6.  No spaces in entityName in table body[] ("HierarchyRole" not "Hierarchy Role")
7.  onCellRenderer: use normalizedCellKey.startsWith('old'/'new') — not raw cellkey
8.  Always add isSync:"Yes" to onCellRenderer event
9.  Tree table: always set both tableName AND tableName_RowCount in setFormdata
10. Delete Success events order: REFRESH FIRST, then toast notification
`.trim();
