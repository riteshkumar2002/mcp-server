---
name: impaktapps-jsonforms-page-builder
description: Build JSON page definitions for the impaktapps-jsonforms platform — an insurance distribution admin system (Pramerica Life). Use this skill whenever asked to create or modify list pages, form pages, tree report pages, or special action pages (promotion, termination) for this platform.
---

# impaktapps-jsonforms Page Builder Skill

This skill encodes all patterns, conventions, and locked rules for building JSON page definitions for the impaktapps-jsonforms platform (Pramerica Life insurance distribution admin system).

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## 1. PLATFORM OVERVIEW

Pages are JSON objects with this top-level shape:
```json
{
  "name": "page_entityName",
  "type": "page",
  "label": "Human Label",
  "template": "Template-1",
  "hasBackIcon": "NO",
  "elementsSelected": {"id": {}, "data": []},
  "events": [ /* page-level onLoad */ ],
  "elements": [ /* page content */ ]
}
```

**Two main page types per entity:**
- `page_entity` — list page (4-tab: Approved / Required Action / Queued / Rejected)
- `page_entityForm` — create/edit form page

---

## 2. JAVA CLASS → JSON FIELD NAME MAPPING

Field names in JSON must match Java property names exactly (camelCase from column_name):
- `role_id` → `roleId`
- `designation_id` → `designationId`
- `node_id` → `nodeId`
- `parent_position_id` → `parentPositionId`
- `is_dual_identity` → `isDualIdentity`
- `entity_channel` → `entityChannel`

Full staging class paths follow: `com.act21.hyperform3.entity.master.<package>.<ClassName>Staging`

### Known entity class paths:
| Entity | Staging Class |
|---|---|
| Entity (OrgEntity) | `com.act21.hyperform3.entity.master.org_entity.OrgEntityStaging` |
| Channel | `com.act21.hyperform3.entity.master.channel.ChannelStaging` |
| HierarchyRole | `com.act21.hyperform3.entity.master.hierarchy_role.HierarchyRoleStaging` |
| Designation | `com.act21.hyperform3.entity.master.designation.DesignationStaging` |
| HierarchyNode | `com.act21.hyperform3.entity.master.hierarchy_node.HierarchyNodeStaging` |
| HierarchyPosition | `com.act21.hyperform3.entity.master.hierarchy_position.HierarchyPositionStaging` |
| Person | `com.act21.hyperform3.entity.master.person.PersonStaging` |
| PositionAssignment | `com.act21.hyperform3.entity.master.position_assignment.PositionAssignmentStaging` |
| LeadGenerator | `com.act21.hyperform3.entity.master.lead_generator.LeadGeneratorStaging` |
| LgSpMapping | `com.act21.hyperform3.entity.master.lg_sp_mapping.LgSpMappingStaging` |
| EntityChannel | `com.act21.hyperform3.entity.master.entity_channel.EntityChannelStaging` |

---

## 3. LIST PAGE STRUCTURE

```
elements[]
  ├── filterWrapper (WrapperSection, isAccordion:"No")
  └── entityTabs (TabSection, sectionLabels:[Approved, Required Action, Queued, Rejected])
        ├── approvedTab (HorizontalLayout) → approvedTable
        ├── requiredActionTab (HorizontalLayout) → reqActionTable + remarks + approve/reject
        ├── queuedTab (HorizontalLayout) → queuedTable
        └── rejectedTab (HorizontalLayout) → rejectedTable
```

**Filter row layout** (always fills 12 cols):
- Filter fields `lg:3` each + `emt1` spacer + Search `lg:1.5` + Reset `lg:1.5` + `emt2` fill

**Page `onLoad`** for filter dropdowns:
```js
async (store) => {
  store.setSchema((pre) => {
    const p = { ...pre.properties };
    p.fieldName = { ...p.fieldName, oneOf: [ { const: 'VAL', title: 'Label' } ] };
    return { ...pre, properties: p };
  });
}
```
For LOV from API, add `service` param and use `service.get(...)`.

---

## 4. TABLE API CALLS (4 per entity)

| Tab | Path |
|---|---|
| Approved | `master/getApprovedDetailsPaginated` |
| Required Action | `master/getPendingActionDetailsPaginated` |
| Queued | `master/getPendingDetailsPaginated` |
| Rejected | `master/getRejectedDetailsPaginated` |

**Standard `body[]`:**
```json
[
  {"key": "size",       "value": "10"},
  {"key": "pageIndex",  "value": "0"},
  {"key": "entityName", "value": "EntityName"}
]
```
⚠️ `entityName` value is the **simple class name** (e.g. `"HierarchyNode"`) — NOT the full staging class.

**Standard `apiBody`:**
```js
(store, dynamicData, userValue, body) => {
  let filters = [];
  let sortingInfo = [];
  if (store.ctx.core.data?.filter_field) {
    filters.push({ key: 'javaField', value: [store.ctx.core.data.filter_field], operator: 'iLike' });
  }
  return { ...body, filters, sortingInfo };
}
```
Use `operator: 'iLike'` for text, `operator: 'equals'` for Select/chip fields.

---

## 5. DOWNLOAD BUTTON PATTERN

```json
{
  "name": "downloadApprovedBtn",
  "type": "Button",
  "iconName": "TableDownloadIcon",
  "buttonType": "IconButton",
  "elementType": "tableHeader",
  "events": [{
    "body": [
      {"key": "entityName", "value": "EntityName"},
      {"key": "fileName",   "value": "EntityName_Approved_Records"},
      {"key": "includeData","value": "true"},
      {"key": "pageIndex",  "value": "0"},
      {"key": "size",       "value": "100"}
    ],
    "path": "master/downloadApprovedDetails",
    "method": "post",
    "Handler": "api",
    "events": [
      {
        "Handler": "custom",
        "eventCode": "async (store, dynamicData, userValue, parentEventOutput, service) => { localStorage.setItem('downloadId', parentEventOutput.data); }",
        "eventType": "Success"
      },
      {
        "path": "externalData/getById",
        "method": "post",
        "Handler": "api",
        "apiBody": "(store, dynamicData) => { const body = { id: localStorage.getItem('downloadId'), withData: true }; localStorage.removeItem('downloadId'); return body; }",
        "events": [{ "Handler": "inBuiltFunction", "eventType": "Success", "funcParametersCode": "(store, dynamicData, userValue, response, service) => { return response?.data; }", "inBuiltFunctionType": "downloadFile" }],
        "eventType": "Success"
      }
    ],
    "eventType": "onClick"
  }]
}
```
Download paths: `downloadApprovedDetails`, `downloadPendingActionDetails`, `downloadPendingDetails`, `downloadRejectedDetails`.

---

## 6. DELETE BUTTON (Approved Table)

```json
{
  "name": "deleteBtn",
  "type": "Button",
  "label": "",
  "iconName": "DeleteIcon",
  "buttonType": "IconButton",
  "elementType": "tableAction",
  "enableFilter": "No",
  "tooltipMessage": "Delete",
  "events": [{
    "body": [],
    "path": "master/delete",
    "method": "post",
    "Handler": "api",
    "apiBody": "(store, dynamicData, userValue, body) => { return { id: dynamicData?.rowData?.id, entityName: 'com.act21.hyperform3.entity.master.PACKAGE.StagingClass' }; }",
    "events": [
      { "Handler": "custom", "eventCode": "async (store, dynamicData, userValue, body, service) => { const rowId = dynamicData?.rowData?.id; if (!rowId) { store.setNotify({ FailMessage: 'No record selected.', Fail: true }); return false; } return true; }", "eventType": "onStart" },
      { "Handler": "refresh", "eventType": "Success", "refreshElements": [{"value": "reqActionTable"}, {"value": "approvedTable"}, {"value": "queuedTable"}] },
      { "Handler": "custom", "eventCode": "async (store) => { store.setNotify({ SuccessMessage: 'Record sent for approval.', Success: true }); }", "eventType": "Success" }
    ],
    "eventType": "onClick"
  }]
}
```
⚠️ `entityName` in `apiBody` = **full staging class path** (unlike table `body[]` which uses simple name).

---

## 7. REQUIRED ACTION TABLE — LOCKED PROPERTIES

```json
{
  "selectKey": "selectRow",
  "SelectionAvailable": "YES",
  "enableRowSelection": "YES",
  "rowSelectionKey": "id",
  "selectedRowsStorageKey": "reqActionEntityTable_selectedRows"
}
```

**First column — CheckBox:**
```json
{"name": "selectRow", "type": "CheckBox", "events": [], "elementType": "tableAction", "enableFilter": "No", "enableSorting": "No"}
```

**ColumnGroup pattern** (old/new pairs):
```json
{
  "name": "fieldName",
  "type": "ColumnGroup",
  "label": "Field Label",
  "events": [],
  "elements": [
    {"name": "oldfieldName", "label": "Old", "events": [], "enableFilter": "No", "enableSorting": "No"},
    {"name": "newfieldName", "label": "New", "events": [], "enableFilter": "No", "enableSorting": "No"}
  ]
}
```

**`reasonForInactiveMarking`** — bare column before buttons:
```json
{"name": "reasonForInactiveMarking", "events": []}
```

**`onCellRenderer`** — red for old changed, teal for new changed:
```json
{
  "events": [],
  "isSync": "Yes",
  "Handler": "custom",
  "eventCode": "(store) => {\n  const params = store?.functionParameters;\n  const cellkey = params.cellkey;\n  if (cellkey === 'id' || cellkey === '_selectRow') return {};\n  const row = params.rowValue;\n  const normalizedCellKey = cellkey.replaceAll('_', '');\n  const redCell  = { cellStyle: { color: '#C70036', fontWeight: 700 } };\n  const tealCell = { cellStyle: { color: '#00897B', fontWeight: 700 } };\n  if (normalizedCellKey.startsWith('old')) {\n    const baseKey = normalizedCellKey.replace('old', '');\n    if (row[normalizedCellKey] !== row['new' + baseKey]) return redCell;\n  }\n  if (normalizedCellKey.startsWith('new')) {\n    const baseKey = normalizedCellKey.replace('new', '');\n    if (row[normalizedCellKey] !== row['old' + baseKey]) return tealCell;\n  }\n  return {};\n}",
  "eventType": "onCellRenderer"
}
```

---

## 8. APPROVE / REJECT BUTTONS

```js
// Approve onClick apiBody
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
      action: 'Approve',  // or 'Reject'
      remarks: store.ctx.core.data?.req_remarks || '',
      actionBy: userValue.userId
    }
  }));
}
```

**Refresh on Approve:** `reqAction` + `approved` + `queued`
**Refresh on Reject:** `reqAction` + `rejected` + `queued`

**`onStart` guard** (always comes AFTER Success refresh in events array):
```js
async (store) => {
  const selected = store?.ctx?.core?.data?.reqActionTable?.filter(e => e.selectRow) || [];
  if (!selected.length) {
    store.setNotify({ FailMessage: 'Please select at least one record to approve.', Fail: true });
    return false;
  }
  return true;
}
```
Use `processBusinessKey` (not `workflowBusinessKey`).

---

## 9. FORM PAGE STRUCTURE

```
elements[]
  ├── topSpacer (EmptyBox lg:12)
  └── formWrapper (WrapperSection, label:" ", isAccordion:"No")
        ├── basicInfoSection (WrapperSection, isAccordion:"YES", accordionLabel:"...", divider:"YES") ← adds visual divider line above
        ├── section2 (WrapperSection, isAccordion:"YES", accordionLabel:"...")
        └── formActionBar (WrapperSection, label:" ", isAccordion:"No")
              ├── cancelBtn lg:2
              ├── saveBtn lg:2
              └── emptyFormSpace lg:8
```

**Field layout:** `lg:3` each. Fill rows to 12 with EmptyBox spacers.

---

## 10. FORM onLoad — CRITICAL ORDER

```js
async (store, dynamicData, userValue, body, service) => {
  const masterName = 'com.act21.hyperform3.entity.master.PACKAGE.EntityStaging';
  const id = store.searchParams?.get('id');
  const disabled = store.searchParams?.get('disabled') === 'true';

  // STEP 1: Hardcoded setSchema oneOf (status, type enums)
  store.setSchema((pre) => { ... });

  // STEP 2: LOV APIs → setSchema oneOf (BEFORE setFormdata!)
  try {
    const res = await service.get(`master/getDetailsByStatus?masterName=...&status=A`);
    const options = (res?.data || []).map(r => ({ const: r.id, title: r.fieldName }));
    if (options.length) store.setSchema((pre) => { const p = {...pre.properties}; p.fieldId = {...p.fieldId, oneOf: options}; return {...pre, properties: p}; });
  } catch (e) { console.error(e); }

  // STEP 3: Load form data (edit/view)
  if (id) {
    const res = await service.get(`master/getDetailById?masterName=${masterName}&id=${id}`);
    const d = res.data;
    store.setFormdata({ editEntityId: d.id, field1: d.field1, ... });
    if (disabled) {
      store.setSchema((pre) => ({
        ...pre,
        properties: Object.fromEntries(Object.entries(pre.properties || {}).map(([k, v]) => [k, { ...v, disabled: true }]))
      }));
    }
  }
}
```

⚠️ **LOVs MUST load before `setFormdata`** — otherwise Select values get cleared.
⚠️ **Guard all LOV setSchema**: `if (options.length) store.setSchema(...)` — prevents empty `oneOf` crash.

---

## 11. FORM SAVE apiBody

```js
(store, dynamicData, userValue, body) => {
  const data = store?.ctx?.core?.data || {};
  return {
    entityName: 'com.act21.hyperform3.entity.master.PACKAGE.EntityStaging',
    entityValue: {
      id:         data?.editEntityId || null,
      field1:     data?.field1,
      field2:     data?.field2,
      // all fields matching Java property names exactly
    },
    userId: userValue?.userId
  };
}
```

---

## 12. onStart VALIDATION PATTERN

```js
async (store, dynamicData, user, body, service) => {
  const data = store?.ctx?.core?.data || {};
  let isValid = true;
  const requiredFields = [
    { key: 'field1', label: 'Field 1' },
    { key: 'field2', label: 'Field 2' }
  ];
  requiredFields.forEach(({ key }) => {
    if (!data?.[key] || data[key].toString().trim() === '') isValid = false;
  });
  if (!isValid) {
    store.setValidation('ValidateAndShow');
    store.setNotify({ FailMessage: 'Please fill valid details', Fail: true });
    return false;
  }
  store.setValidation('ClearAll');
  return true;
}
```

---

## 13. onChange PATTERN (dependent dropdowns)

```js
async (store, dynamicData, userValue, body, service) => {
  const parentId = store?.newData?.parentField;  // use newData, NOT ctx.core.data
  store.ctx.core.data.dependentField = [];        // reset with []
  if (!parentId) return;
  const res = await service.get(`api/getByParent?parentId=${parentId}`);
  const options = (res?.data || []).map(r => ({ const: r.id, title: r.name }));
  if (options.length) store.setSchema((pre) => {
    const p = {...pre.properties};
    p.dependentField = {...p.dependentField, oneOf: options};
    return {...pre, properties: p};
  });
}
```

### Store Data Access — Quick Reference

| Path | Use when |
|---|---|
| `store.newData.field` | Read the value that just changed (use in `onChange` and `apiBody`) |
| `'field' in store.newData` | Check if a specific field was part of the latest change event (use in `onStart`) |
| `store.formData.field` | Read any current form value (use in `onLoad`, `apiBody`) |
| `store.ctx.core.data.field` | Same as formData; more reliable in nested handlers; required to reset: `store.ctx.core.data.field = []` |
| `store.searchParams?.get('param')` | Read URL query parameter (use in `onStart`, `onLoad`) |

### userValue fields

| Field | Value |
|---|---|
| `userValue.username` | Login username |
| `userValue.userId` | Numeric user ID |
| `userValue.userType` | Role string — `"agent"`, `"manager"`, `"admin"` |
| `userValue.positionName` | User's position |

---

## 14. TREE TABLE PAGE PATTERN

For hierarchy report pages (`page_businessHierarchy`, `page_organizationHierarchy`):

**Table required properties:**
```json
{
  "treeTable": "YES",
  "treeStructure": "YES",
  "lazyLoading": "YES",
  "treeTableKey": "id",
  "treeTableParentKey": "parentFieldName",
  "enableExpanding": "YES",
  "enableRowMovement": "NO",
  "filterFromLeafRows": "YES",
  "paginateExpandedRows": "YES",
  "defaultColumnSize": "100"
}
```

**onLoad event** — single `Handler: "custom"` (NO apiBody/api Handler):
```js
async (store, dynamicData, userValue, body, service) => {
  const data = store?.ctx?.core?.data || {};
  if (!data?.entityChannelId) return;

  const localBody = {};
  if (data?.entityChannelId) localBody.entityChannelId = data.entityChannelId;
  if (data?.effectiveAt)     localBody.effectiveAt     = data.effectiveAt;

  try {
    const res = await service.post(`hierarchyNode/getByFilter`, localBody);
    const rows = res?.data || [];
    store.setFormdata((pre) => ({
      ...pre,
      hierarchyTreeTable: rows,
      hierarchyTreeTable_RowCount: rows.length   // REQUIRED
    }));
  } catch (e) { console.error(e); }
}
```

**`onStart` guard:**
```js
async (store) => {
  const data = store?.ctx?.core?.data || {};
  if (!data?.entityChannelId || data?.entityChannelId == []) return false;
  return true;
}
```

⚠️ Tree table reads data from `formData[tableName]` + `formData[tableName_RowCount]` — NOT from API response directly.
⚠️ Never mix `Handler:"api"` + `eventCode` on same event — causes double API call.

---

## 15. COMPONENT REFERENCE

| Type | Notes |
|---|---|
| `Text` | Use `maxLength`, `validation` with pattern for PAN/mobile/email/pincode. Can include `elements: []` and `elementsSelected: {"id": {}, "data": []}` — add these when present in the original page. |
| `Array` | Repeatable row group — lets users add/remove multiple rows of child fields. `validation: []` always empty on Array itself; validate on child fields. Access data as `store.ctx.core.data.fieldName` (array of objects). Reference in event body as `"$fieldName"`. See `add-icon-button.md` for full pattern. |
| `Select` | Always needs `elements:[]`, `lazyLoading:"NO"`, `elementsSelected:{"id":{},"data":{}}` |
| `Date` | No extra props needed |
| `Radio` | Use `sectionLabels:[{label:"YES"},{label:"NO"}]` for boolean fields |
| `CheckBox` | `elementType:"tableAction"` when used as row selector in tables |
| `TextArea` | For remarks fields below req action table |
| `EmptyBox` | Used as spacers to fill 12-col grid rows |
| `WrapperSection` | Container. `isAccordion:"YES"` needs `accordionLabel` + `label` = same value. `divider:"YES"` adds a visual divider above the section (first section only). `elementsSelected:{"id":{},"data":[]}` can be added when the section tracks selected rows. |
| `TabSection` | Needs `sectionLabels:[{label:"..."}]` array |
| `HorizontalLayout` | Direct child of TabSection, `layout:[]` (empty) |
| `Table` | Standard props: `lazyLoading:"YES"`, `disableSorting:"NO"`, `disableEditColumn:"YES"`, `disableColumnFilter:"YES"`, `disableDownloadFile:"YES"`, `disableGlobalSearch:"YES"`. Optional `label` field sets a visible heading on the table. For full Table flags reference (DragAvailable, SelectionAvailable, ColumnResizingAvailable, sizeHolder, columnFormat on columns) see `add-icon-button.md` skill. |
| `Button` | `buttonType:"Button"` for primary, `"IconButton"` for table actions. `elementType:"tableAction"` or `"tableHeader"` |

**No Number component** — use `Text` with pattern validation `^[0-9]+$`.

---

## 16. LOV API PATTERN

Always use approved records for LOV:
```
master/getDetailsByStatus?masterName=com.act21.hyperform3.entity.master.PACKAGE.ClassName&status=A
```

Common display field names by entity:
- OrgEntity: `entityCode - entityName`
- Channel: `channelCode - channelName`
- HierarchyRole: `roleName`
- Designation: `designationName`
- HierarchyNode: `nodeCode - nodeName`
- HierarchyPosition: `positionCode`
- EntityChannel: `entityChannelName`
- Person: `employeeCode - name`

---

## 17. STATE LOV (Address forms)

```json
{
  "name": "state",
  "type": "Select",
  "events": [{
    "body": [{"key": "type", "value": "state"}, {"key": "userId", "value": "$userValue.userId"}],
    "path": "/page/getLOV",
    "method": "post",
    "Handler": "api",
    "eventType": "onLoad"
  }],
  "elements": [],
  "elementsSelected": {"id": {}, "data": {}}
}
```

---

## 18. NAVIGATION PATTERNS

```js
// Navigate to list page
store.navigate('/page_entityName');

// Navigate to form (edit)
store.navigate(`/page_entityForm?id=${rowId}`);

// Navigate to form (view only)
store.navigate(`/page_entityForm?id=${rowId}&disabled=true`);

// Navigate back
store.navigate(-1);
```

---

## 19. NOTIFY (TOAST) PATTERNS

```js
store.setNotify({ SuccessMessage: 'Record sent for approval.', Success: true });
store.setNotify({ FailMessage: 'Please fill valid details', Fail: true });
```

---

## 20. REFRESH PATTERN

```json
{
  "Handler": "refresh",
  "eventType": "Success",
  "refreshElements": [{"value": "tableName1"}, {"value": "tableName2"}]
}
```

---

## 21. RESET BUTTON PATTERN

```js
async (store) => {
  store.ctx.core.data.filter_field1 = null;
  store.ctx.core.data.filter_field2 = null;
  return true;
}
```
Reset button always has TWO events: custom (clear data) + refresh (reload tables).

---

## 22. SPECIAL FIELD PATTERNS

**isDualIdentity (Radio):**
```json
{
  "name": "isDualIdentity",
  "type": "Radio",
  "sectionLabels": [{"label": "YES"}, {"label": "NO"}],
  "elements": [],
  "elementsSelected": {"id": {}, "data": {}}
}
```
Default value on add mode: `store.setFormdata((pre) => ({ ...pre, isDualIdentity: 'NO' }))`

**PAN validation:**
```json
{"validationType": "pattern", "validationValue": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", "validationMessage": "PAN must be in format: AAAAA9999A"}
```

**Mobile validation:**
```json
{"validationType": "pattern", "validationValue": "^[6-9][0-9]{9}$", "validationMessage": "Mobile must be a valid 10-digit Indian number"}
```

---

## 23. COMMON MISTAKES TO AVOID

1. **Never** use simple entity name in delete `apiBody` — always full staging class
2. **Never** call `setSchema` with empty `oneOf` — always guard with `if (options.length)`
3. **Never** load `setFormdata` before LOVs are ready — dropdowns will clear
4. **Never** mix `Handler:"api"` + `eventCode` on the same event — double API call
5. **Never** use `workflowBusinessKey` — always `processBusinessKey`
6. **Never** add spaces to `entityName` values in table `body[]` (`"HierarchyRole"` not `"Hierarchy Role"`)
7. **Always** use `normalizedCellKey.startsWith('old'/'new')` in `onCellRenderer` — not `cellkey.startsWith`
8. **Always** add `isSync: "Yes"` to `onCellRenderer` event
9. Tree table: **always** set both `tableName` AND `tableName_RowCount` in `setFormdata`
10. Delete button `Success` events order: refresh first, then toast

---

## 24. WORKFLOW API

Path: `workflow/completeTasks/2.0`  
Method: `post`  
Body: array of task completion objects (see section 8).

---

## 25. COMPLETE COMPONENT CONFIG PROPERTY REFERENCE

This section is sourced directly from the `impaktapps-ui-builder` build functions. These are the **exact** config properties each component accepts. All string boolean values use **ALL CAPS** (`"YES"` / `"NO"`) unless noted otherwise.

### Text

| Property | Type | Notes |
|---|---|---|
| `name` | string | field name (required) |
| `type` | `"Text"` | |
| `label` | string | display label |
| `placeholder` | string | hint text |
| `multiline` | `"YES"`/`"NO"` | multiline input |
| `keyName` | string | alternative key name |
| `InputFormatingAndMasking` | `[{formatElement}]` | format mask array |
| `variant` | string | MUI variant |
| `toolTip` | string | tooltip text |
| `toolTipPosition` | string | tooltip position |
| `style` | JSON string | custom style |
| `layout` | `[{key,value}]` | responsive grid |

### TextArea

| Property | Type | Notes |
|---|---|---|
| `type` | `"TextArea"` | |
| `label` | string | heading |
| `placeholder` | string | |
| `enableCodeEditor` | `"YES"`/`"NO"` | switch to code editor mode |
| `codeEditorLanguage` | string | e.g. `"javascript"`, `"json"` |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default full-width |

### Select (Dropdown)

| Property | Type | Notes |
|---|---|---|
| `type` | `"Select"` | |
| `label` | string | |
| `placeholder` | string | |
| `searchable` | boolean | |
| `value` | `[{label,value}]` | static options (no API) |
| `freeSolo` | `"YES"`/`"NO"` | allow custom entries |
| `lazyLoading` | `"YES"`/`"NO"` | |
| `variant` | string | |
| `toolTip` | string | |
| `toolTipPosition` | string | |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default `lg:4 md:4 sm:4 xs:11` |
| `validation` | `[{validationType,validationValue}]` | |

### MultipleSelect

| Property | Type | Notes |
|---|---|---|
| `type` | `"MultipleSelect"` | |
| `label` | string | |
| `value` | `[{label,value}]` | static options |
| `lazyLoading` | `"YES"`/`"NO"` | |
| `variant` | string | |
| `toolTip` | string | |
| `toolTipPosition` | string | |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | |

### CheckBox

| Property | Type | Notes |
|---|---|---|
| `type` | `"CheckBox"` | |
| `label` | string | |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default `lg:3 md:4 sm:6 xs:6` |

### Radio

| Property | Type | Notes |
|---|---|---|
| `type` | `"Radio"` | |
| `label` | string | |
| `sectionLabels` | `[{label}]` or `[{Options}]` | radio options array |
| `errorMessage` | string | |
| `toolTip` | string | |
| `toolTipPosition` | string | |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default `lg:3 md:4 sm:6 xs:12` |

### Date / DateTime

| Property | Type | Notes |
|---|---|---|
| `type` | `"Date"` or `"DateTime"` | |
| `label` | string | |
| `variant` | string | |
| `toolTip` | string | |
| `toolTipPosition` | string | |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | |

### Button

| Property | Type | Notes |
|---|---|---|
| `type` | `"Button"` | |
| `label` | string | button text |
| `buttonType` | `"Button"` / `"IconButton"` / `"ButtonWithIconAndText"` | |
| `iconName` | string | icon (used as `icon` for IconButton, `startIcon` for ButtonWithIconAndText) |
| `color` | string | `"primary"`, `"success"`, `"error"`, `"warning"`, `"info"`, `"secondary"` |
| `size` | string | `"small"`, `"medium"`, `"large"` |
| `defaultStyle` | `"true"`/`"false"` | use theme default style |
| `tooltipMessage` | string | hover tooltip |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default `lg:1.5 md:2 sm:2.5 xs:4` |

### Table

| Property | Type | Notes |
|---|---|---|
| `type` | `"Table"` | |
| `label` | string | visible heading on table |
| `elements` | array | column/button definitions |
| `lazyLoading` | `"YES"`/`"NO"` | server-side pagination |
| `defaultColumnSize` | string | default column width px |
| `SelectionAvailable` | `"YES"`/`"NO"` | row checkboxes |
| `ColumnResizingAvailable` | `"YES"`/`"NO"` | drag to resize columns |
| `DragAvailable` | `"YES"`/`"NO"` | drag to reorder rows |
| `downloadAllData` | `"YES"`/`"NO"` | download button visible |
| `disableGlobalSearch` | `"YES"`/`"NO"` | hide search box |
| `disableColumnFilter` | `"YES"`/`"NO"` | hide column filter |
| `disableSorting` | `"YES"`/`"NO"` | disable sorting |
| `disableEditColumn` | `"YES"`/`"NO"` | hide column edit |
| `disableFullScreenToggle` | `"YES"`/`"NO"` | hide fullscreen button |
| `disableDensityToggle` | `"YES"`/`"NO"` | hide density toggle |
| `disableDownloadFile` | `"YES"`/`"NO"` | hide download file |
| `disablePagination` | `"YES"`/`"NO"` | hide pagination |
| `enableExpanding` | `"YES"`/`"NO"` | row expanding (tree) |
| `enableExpandAll` | `"YES"`/`"NO"` | expand-all button |
| `enableRowMovement` | `"YES"`/`"NO"` | row drag-to-reorder |
| `treeStructure` | `"YES"`/`"NO"` | flat tree map display |
| `filterFromLeafRows` | `"YES"`/`"NO"` | filter from leaf rows |
| `paginateExpandedRows` | `"YES"`/`"NO"` | paginate expanded rows |
| `selectKey` | string | field key for row selection |
| `maxPageSize` | number | maximum rows per page |
| `initialDensity` | string | `"compact"`, `"normal"`, `"comfortable"` |
| `Table_Download_Keys_Name` | `[{KeyName}]` | columns included in download |
| `sizeHolder` | `[{keyName,value}]` | per-column width map |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default full-width |

**Table Column properties (inside `elements`):**

| Property | Notes |
|---|---|
| `name` | accessor key (matches data key) |
| `label` | column header text |
| `type` | widget type for that cell (Button, CheckBox, etc.) — omit for plain text |
| `columnFormat` | `"date"` / `"dateTime"` / `"amount"` |
| `elementType` | `"action"` (row action col) / `"tableHeader"` (header icon) / omit (data col) |
| `enableFilter` | `"Yes"`/`"No"` ← NOTE: uses `"No"` not `"NO"` |
| `enableSorting` | `"Yes"`/`"No"` ← NOTE: uses `"No"` not `"NO"` |
| `filteringOptions` | array of filter mode strings |
| `columnKey` | key alias for column |
| `dateFormat` | date display format string |

### WrapperSection

| Property | Type | Notes |
|---|---|---|
| `type` | `"WrapperSection"` | |
| `label` | string | section title |
| `elements` | array | child components |
| `divider` | `"YES"`/`"NO"` | show divider line above section |
| `isAccordion` | `"No"` to disable, default true | `"No"` = always open, default = collapsible accordion |
| `defaultClosed` | `"YES"`/`"NO"` | start collapsed |
| `iconUrl` | string | icon URL shown in header |
| `rowSpacing` | number | spacing between rows |
| `columnSpacing` | number | spacing between columns |
| `spacing` | number | general spacing |
| `defaultStyle` | `"YES"`/`"NO"` | apply theme card background |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default full-width |

### HorizontalLayout

| Property | Type | Notes |
|---|---|---|
| `type` | `"HorizontalLayout"` | |
| `elements` | array | child components arranged side-by-side |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default full-width |

### TabSection

| Property | Type | Notes |
|---|---|---|
| `type` | `"TabSection"` | |
| `elements` | array | one child component per tab |
| `sectionLabels` | `[{label, icon?}]` | tab labels and icons |
| `orientation` | `"YES"` = vertical, anything else = horizontal | |
| `lazyLoad` | `"YES"`/`"NO"` | load tabs on demand |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default full-width |

### Array (repeatable rows)

| Property | Type | Notes |
|---|---|---|
| `type` | `"Array"` | |
| `label` | string | section label |
| `elements` | array | child field definitions |
| `allExpanded` | `"YES"`/`"NO"` | start all rows expanded |
| `disableAddButton` | `"YES"`/`"NO"` | hide add row button |
| `disableExpandAllButton` | `"YES"`/`"NO"` | hide expand-all button |
| `disableRowActions` | `"YES"`/`"NO"` | hide per-row action buttons |
| `childElementLabel` | string | label for each row |
| `showKeyAsLabel` | boolean/string | show field key as label |
| `rowSpacing` | number | |
| `columnSpacing` | number | |
| `spacing` | number | |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default full-width |

### card (KPI metric card)

| Property | Type | Notes |
|---|---|---|
| `type` | `"card"` | ← **ALWAYS LOWERCASE** |
| `label` | string | initial placeholder value (`"0"`, `"0.0"`) |
| `description` | string | subtitle text |
| `url` | string | SVG icon URL |
| `columnFormat` | `"amount"` or omit | currency formatting |
| `titleIcon` | string | MUI icon name |
| `style` | `""` | always empty string when present |
| `layout` | `[{key,value}]` | |
| `events` | array | `onLoad` to load data |

### Graph

| Property | Type | Notes |
|---|---|---|
| `type` | `"Graph"` | capital G |
| `graphType` | string | `"BarGraph"` / `"StackBarGraph"` / `"LineGraph"` / `"PieGraph"` / `"HorizontalBarGraph"` / `"HorizontalStackBarGraph"` / `"AreaGraph"` / `"StackBarLineGraph"` |
| `heading` | string | chart title |
| `height` | string | px as string, e.g. `"400"` |
| `leftMargin` | string | Y-axis margin, e.g. `"120"` |
| `leftLabel` | string | Y-axis label |
| `bottomLabel` | string | X-axis label |
| `xAxisValue` | string | data key for X axis |
| `yAxisValue` | string | data key for Y axis (LineGraph only) |
| `legendHide` | `"YES"`/`"NO"` | `"YES"` = hide, `"NO"` = show. **Case-sensitive — `"Yes"` does NOT hide!** |
| `legendDirection` | `"Row"` / anything | `"Row"` = horizontal legend, else vertical |
| `legendLabels` | `[{key,value}]` | display name overrides per series |
| `pieArcColors` | `[{key,value}]` | color per series; `[]` for single-series |
| `bottomAxisAngle` | `"YES"`/`"NO"` | `"YES"` = angle labels. **Case-sensitive — `"Yes"` does NOT angle!** |
| `disableLeftLabel` | `"YES"`/`"NO"` | hide Y-axis label |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default `lg:6 md:12 sm:12 xs:12` |

### ProgressBar

| Property | Type | Notes |
|---|---|---|
| `type` | `"ProgressBar"` | |
| `label` | string | heading above bar |
| `variant` | string | `"determinate"`, `"indeterminate"`, `"buffer"`, `"query"` |
| `size` | number | bar thickness |
| `bottomLabel_1` | string | label at left below bar |
| `bottomLabel_2` | string | label in middle below bar |
| `bottomLabel_3` | string | label at right below bar (remaining) |
| `pieArcColors` | `[{key,value}]` | color stops array |
| `layout` | `[{key,value}]` | default full-width |
| `events` | array | `onLoad` to populate `{total, achieved}` |

### LeaderBoard

| Property | Type | Notes |
|---|---|---|
| `type` | `"LeaderBoard"` | |
| `label` | string | heading |
| `elements` | array | column definitions |
| `nameKey` | string | data key for participant name |
| `imageKey` | string | data key for participant avatar |
| `scoreKey` | string | data key for score |
| `isScoreAmount` | `"YES"`/`"NO"` | format score as currency |
| `firstImage` | string | gold medal image URL |
| `secondImage` | string | silver medal image URL |
| `thirdImage` | string | bronze medal image URL |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default full-width |

### RankCard

| Property | Type | Notes |
|---|---|---|
| `type` | `"RankCard"` | |
| `rank` | string / number | rank value to display |
| `height` | string / number | component height in px |
| `layout` | `[{key,value}]` | |

### ProgressBarCard

Similar to ProgressBar with card wrapper. Same `type: "ProgressBarCard"`.

### InputSlider

| Property | Type | Notes |
|---|---|---|
| `type` | `"InputSlider"` | |
| `label` | string | |
| `min` | number | minimum value |
| `max` | number | maximum value |
| `step` | number | step increment |
| `limitToMax` | `"YES"`/`"NO"` | clamp value at max |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default `lg:6 md:6 sm:12 xs:12` |

### Box (static label/text)

| Property | Type | Notes |
|---|---|---|
| `type` | `"Box"` | |
| `label` | string | text content / heading |
| `iconName` | string | MUI icon shown alongside label |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | |

### EmptyBox (spacer)

| Property | Type | Notes |
|---|---|---|
| `type` | `"EmptyBox"` | |
| `layout` | `[{key,value}]` | set to fill remaining columns |

### Image

| Property | Type | Notes |
|---|---|---|
| `type` | `"Image"` | |
| `imageUrl` | string | image source URL |
| `height` | string / number | image height |
| `toolTip` | string | |
| `toolTipPosition` | string | |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default `lg:3` |

### UploadFile (standalone upload button)

| Property | Type | Notes |
|---|---|---|
| `type` | `"UploadFile"` | |
| `label` | string | button label |
| `required` | boolean | |
| `toolTip` | string | |
| `toolTipPosition` | string | |
| `errorMessage` | string | |
| `style` | string/JSON | |
| `layout` | `[{key,value}]` | |

### DownloadFile (standalone download button)

| Property | Type | Notes |
|---|---|---|
| `type` | `"DownloadFile"` | |
| `label` | string | button label |
| `required` | boolean | |
| `errorMessage` | string | |
| `toolTip` | string | |
| `toolTipPosition` | string | |
| `style` | string/JSON | |
| `layout` | `[{key,value}]` | |

### FileInput (upload + download + delete combo)

| Property | Type | Notes |
|---|---|---|
| `type` | `"FileInput"` | |
| `label` | string | |
| `variant` | string | |
| `disableUpload` | `"YES"`/`"NO"` | |
| `disableDownload` | `"YES"`/`"NO"` | |
| `disableDelete` | `"YES"`/`"NO"` | |
| `useLabel` | `"YES"`/`"NO"` | show label next to button |
| `description` | string | helper text |
| `toolTip` | string | |
| `chooseButtonLabel` | string | custom choose button label |
| `noFileAvailableMessage` | string | message when no file exists |
| `externalUpload` | `"YES"`/`"NO"` | use external upload handler |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | |

### Thought (motivational banner)

| Property | Type | Notes |
|---|---|---|
| `type` | `"Thought"` | |
| `thought` | string | the quote/thought text |
| `label` | string | title or author attribution |
| `style` | JSON string | |
| `layout` | `[{key,value}]` | default full-width |

### Timer (countdown)

| Property | Type | Notes |
|---|---|---|
| `type` | `"Timer"` | |
| `label` | string | display label |
| `layout` | `[{key,value}]` | |

### RunnerBoyProgressBar (animated gamified progress)

| Property | Type | Notes |
|---|---|---|
| `type` | `"RunnerBoyProgressBar"` | |
| `layout` | `[{key,value}]` | |

### Default Layouts by Type (when `layout` is omitted)

| Type | Default layout |
|---|---|
| `WrapperSection`, `HorizontalLayout`, `Table`, `TextArea`, `LeaderBoard`, `Thought` | `lg:12 md:12 sm:12 xs:12` (full width) |
| `Graph` | `lg:6 md:12 sm:12 xs:12` (half-width) |
| `Button` | `lg:1.5 md:2 sm:2.5 xs:4` (compact) |
| `Select`, `Text`, `Date`, etc. | `lg:3 md:4 sm:6 xs:6` (quarter) |
