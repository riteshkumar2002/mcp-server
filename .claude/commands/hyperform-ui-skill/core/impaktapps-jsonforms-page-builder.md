---
name: impaktapps-jsonforms-page-builder
description: Build JSON page definitions for the impaktapps-jsonforms platform — an insurance distribution admin system (Pramerica Life). Use this skill whenever asked to create or modify list pages, form pages, tree report pages, or special action pages (promotion, termination) for this platform.
---

# impaktapps-jsonforms Page Builder Skill

This skill encodes all patterns, conventions, and locked rules for building JSON page definitions for the impaktapps-jsonforms platform (Pramerica Life insurance distribution admin system).

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
        ├── basicInfoSection (WrapperSection, isAccordion:"YES", accordionLabel:"...", divider:"YES") ← FIRST section only gets divider
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
| `Text` | Use `maxLength`, `validation` with pattern for PAN/mobile/email/pincode |
| `Select` | Always needs `elements:[]`, `lazyLoading:"NO"`, `elementsSelected:{"id":{},"data":{}}` |
| `Date` | No extra props needed |
| `Radio` | Use `sectionLabels:[{label:"YES"},{label:"NO"}]` for boolean fields |
| `CheckBox` | `elementType:"tableAction"` when used as row selector in tables |
| `TextArea` | For remarks fields below req action table |
| `EmptyBox` | Used as spacers to fill 12-col grid rows |
| `WrapperSection` | Container. `isAccordion:"YES"` needs `accordionLabel` + `label` = same value |
| `TabSection` | Needs `sectionLabels:[{label:"..."}]` array |
| `HorizontalLayout` | Direct child of TabSection, `layout:[]` (empty) |
| `Table` | Standard props: `lazyLoading:"YES"`, `disableSorting:"NO"`, `disableEditColumn:"YES"`, `disableColumnFilter:"YES"`, `disableDownloadFile:"YES"`, `disableGlobalSearch:"YES"` |
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
