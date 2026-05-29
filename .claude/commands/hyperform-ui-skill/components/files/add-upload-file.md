---
name: add-upload-file
description: Add UploadFile (standalone upload button) to Hyperform pages. Use this skill whenever you need a dedicated file upload button — invoice uploads, certificate uploads, bulk CSV import, or any single-file submission. Covers config type "UploadFile", uiSchema widget "UploadFile", onClick handler with service.post FormData to /externalData/save, storing fileId in formdata, file type/size validation, and success/error notifications.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add UploadFile Component

**Pattern Reference:** page_paymentDetailsManagement  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add UploadFile to Your Page

UploadFile Component provides a dedicated file upload button for single file uploads. Perfect for:
- Invoice/document uploads
- Certificate uploads
- Report file uploads
- Template uploads
- Bulk data file uploads (CSV/Excel)
- Standalone file submission

---

## Step 1: Add to config.elements

```json
{
  "name": "uploadFile",
  "type": "UploadFile",
  "label": "Invoice File",
  "events": [
    {
      "Handler": "custom",
      "eventType": "onClick",
      "eventCode": "async (store, dynamicData, userValue, parentEventOutput, service) => {\n  const file = dynamicData?.changeEvent?.target?.files?.[0];\n\n  if (!file) {\n    store.setNotify({ FailMessage: 'Please select a file', Fail: true });\n    return;\n  }\n\n  const formData = new FormData();\n  formData.append('metadata', JSON.stringify({\n    name: file.name,\n    type: file.name.split('.').pop()\n  }));\n  formData.append('file', file);\n  formData.append('fileType', 'externalData');\n\n  try {\n    const response = await service.post('/externalData/save', formData);\n\n    store.setFormdata((prev) => ({\n      ...prev,\n      uploadFileId: response.data,\n      uploadFileName: file.name\n    }));\n\n    store.setNotify({ SuccessMessage: 'File Uploaded Successfully', Success: true });\n  } catch (error) {\n    store.setNotify({ FailMessage: 'File Upload Failed', Fail: true });\n  }\n}"
    }
  ],
  "layout": [
    {"key": "lg", "value": "3"},
    {"key": "md", "value": "3"},
    {"key": "xs", "value": "12"}
  ]
}
```

---

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type | Must be "UploadFile" | "UploadFile" |
| label | Button label | "Upload Invoice" |
| required | Mark field as required | `true` or `false` |
| toolTip | Tooltip text on hover | "Upload your invoice PDF" |
| layout | Responsive grid columns | `[{"key": "lg", "value": "3"}, ...]` |
| events | onClick handler for upload logic | see Upload Flow below |

---

## Upload Flow

1. User clicks button → file dialog opens
2. User selects file → `onClick` event fires
3. Access file via `dynamicData?.changeEvent?.target?.files?.[0]`
4. Build `FormData` with `metadata`, `file`, `fileType`
5. `service.post('/externalData/save', formData)` → returns `fileId`
6. Store `fileId` + `fileName` in formdata for later download

---

## Complete Invoice Upload Example

### config.elements

```json
{
  "name": "uploadFile",
  "type": "UploadFile",
  "label": "Invoice File",
  "events": [
    {
      "Handler": "custom",
      "eventType": "onClick",
      "eventCode": "async (store, dynamicData, userValue, parentEventOutput, service) => {\n  const programData = JSON.parse(\n    window.sessionStorage.getItem('selectedProgram') || '{}'\n  )?.id;\n\n  if (!programData) {\n    store.setNotify({ FailMessage: 'Please select Program', Fail: true });\n    return;\n  }\n\n  const file = dynamicData?.changeEvent?.target?.files?.[0];\n\n  if (!file) {\n    store.setNotify({ FailMessage: 'Please select a file', Fail: true });\n    return;\n  }\n\n  const formData = new FormData();\n  formData.append('metadata', JSON.stringify({\n    name: file.name,\n    type: file.name.split('.').pop(),\n    program: programData\n  }));\n  formData.append('file', file);\n  formData.append('fileType', 'externalData');\n\n  try {\n    const response = await service.post('/externalData/save', formData);\n\n    store.setFormdata((prev) => ({\n      ...prev,\n      uploadFileId: response.data,\n      uploadFileName: file.name,\n      downloadFile: file.name\n    }));\n\n    store.setNotify({ SuccessMessage: 'File Uploaded Successfully', Success: true });\n  } catch (error) {\n    store.setNotify({ FailMessage: 'File Upload Failed', Fail: true });\n  }\n}"
    }
  ],
  "layout": [
    {"key": "lg", "value": "3"},
    {"key": "md", "value": "3"},
    {"key": "xs", "value": "12"}
  ]
}
```

---

## API: POST /externalData/save

**Request (multipart/form-data):**
```
metadata: JSON string {name, type, program}
file:     File binary
fileType: "externalData"
```

**Response:**
```json
{"data": "fileId_12345"}
```

Store this `fileId` — it is required for download.

---

## File Validation

### Type Validation
```javascript
const extension = file.name.split('.').pop().toLowerCase();
const validExtensions = ['pdf', 'xlsx', 'xls', 'csv'];
if (!validExtensions.includes(extension)) {
  store.setNotify({ FailMessage: 'Only PDF and Excel files allowed', Fail: true });
  return;
}
```

### Size Validation (5MB)
```javascript
if (file.size > 5 * 1024 * 1024) {
  store.setNotify({ FailMessage: 'File size must be less than 5MB', Fail: true });
  return;
}
```

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong type name in config
```json
// WRONG
{"name": "upload", "type": "Upload"}

// CORRECT
{"name": "upload", "type": "UploadFile"}
```

**Mistake 2:** Not using `service` parameter — upload requires `service.post(...)`, not a regular API event handler. The `service` is the 5th parameter of the `onClick` eventCode function.

**Mistake 3:** Not storing `fileId` after upload — the returned `response.data` is the fileId needed for the paired DownloadFile button.

**Mistake 4:** Using `eventType: "onUpload"` instead of `eventType: "onClick"` — UploadFile uses `onClick`, not `onUpload`.

---

## Testing Checklist

- [ ] Upload button displays with label
- [ ] File dialog opens on click
- [ ] File type validation works
- [ ] File size limit enforced
- [ ] Upload API called with correct FormData
- [ ] fileId stored in formdata after upload
- [ ] Success notification shows
- [ ] Error handling works

---

## Reference

**Based on:** page_paymentDetailsManagement  
**Widget:** UploadFile  
**Version:** 1.0  
**Status:** Production Ready
