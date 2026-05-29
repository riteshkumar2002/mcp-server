---
name: add-download-file
description: Add DownloadFile (standalone download button) to Hyperform pages. Use this skill whenever you need a dedicated file download button — retrieve a previously uploaded invoice, certificate, report, or any file stored via /externalData/save. Covers config type "DownloadFile", uiSchema widget "DownloadFile", onClick API call to /externalData/getById, inBuiltFunction "downloadFile" Success handler, conditional disable when no fileId, and error handling.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add DownloadFile Component

**Pattern Reference:** page_paymentDetailsManagement  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add DownloadFile to Your Page

DownloadFile Component provides a dedicated file download button for retrieving previously uploaded files. Perfect for:
- Invoice downloads
- Certificate downloads
- Report downloads
- Template downloads
- Receipt downloads
- Any file stored via UploadFile

---

## Step 1: Add to config.elements

```json
{
  "name": "downloadFile",
  "type": "DownloadFile",
  "label": "Download File",
  "events": [
    {
      "path": "/externalData/getById",
      "method": "post",
      "Handler": "api",
      "apiBody": "(store) => ({\n  withData: true,\n  id: store.ctx.core.data.uploadFileId\n})",
      "eventType": "onClick",
      "events": [
        {
          "Handler": "inBuiltFunction",
          "inBuiltFunctionType": "downloadFile",
          "eventType": "Success",
          "funcParametersCode": "(store, dynamicData, userValue, parentEventOutput) => parentEventOutput.data"
        }
      ]
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
| type | Must be "DownloadFile" | "DownloadFile" |
| label | Button label | "Download File" |
| required | Mark field as required | `true` or `false` |
| toolTip | Tooltip text on hover | "Download your invoice" |
| layout | Responsive grid columns | `[{"key": "lg", "value": "3"}, ...]` |
| apiBody (in events) | Builds request with fileId | reads `uploadFileId` from store |
| inBuiltFunctionType | Auto-triggers browser download | "downloadFile" |
| funcParametersCode | Extracts binary from response | `parentEventOutput.data` |

---

## Download Flow

1. User clicks button → `onClick` event fires
2. `apiBody` reads `uploadFileId` from formdata and sends `{id, withData: true}`
3. POST to `/externalData/getById` returns file binary
4. `inBuiltFunction "downloadFile"` extracts `parentEventOutput.data` and triggers browser download automatically

---

## Complete Example: Upload + Download Pair

### config.elements

```json
[
  {
    "name": "uploadFile",
    "type": "UploadFile",
    "label": "Invoice File",
    "events": [
      {
        "Handler": "custom",
        "eventType": "onClick",
        "eventCode": "async (store, dynamicData, userValue, parentEventOutput, service) => {\n  const file = dynamicData?.changeEvent?.target?.files?.[0];\n  if (!file) return;\n  const formData = new FormData();\n  formData.append('metadata', JSON.stringify({ name: file.name, type: file.name.split('.').pop() }));\n  formData.append('file', file);\n  formData.append('fileType', 'externalData');\n  const response = await service.post('/externalData/save', formData);\n  store.setFormdata((prev) => ({ ...prev, uploadFileId: response.data, uploadFileName: file.name }));\n  store.setNotify({ SuccessMessage: 'File Uploaded Successfully', Success: true });\n}"
      }
    ],
    "layout": [
      {"key": "lg", "value": "3"},
      {"key": "md", "value": "3"},
      {"key": "xs", "value": "12"}
    ]
  },
  {
    "name": "downloadFile",
    "type": "DownloadFile",
    "label": "Download File",
    "events": [
      {
        "path": "/externalData/getById",
        "events": [
          {
            "Handler": "inBuiltFunction",
            "eventType": "Success",
            "funcParametersCode": "(store, dynamicData, userValue, parentEventOutput, service) => {\n  return parentEventOutput.data;\n}",
            "inBuiltFunctionType": "downloadFile"
          }
        ],
        "method": "post",
        "Handler": "api",
        "apiBody": "(store) => {\n  return {\n    withData: true,\n    id: store.ctx.core.data.uploadFileId\n  };\n}",
        "eventType": "onClick"
      }
    ],
    "layout": [
      {"key": "lg", "value": "3"},
      {"key": "md", "value": "3"},
      {"key": "xs", "value": "12"}
    ]
  }
]
```

---

## API: POST /externalData/getById

**Request:**
```json
{"id": "fileId_12345", "withData": true}
```

**Response:** file binary content → passed to `downloadFile` inbuilt function → browser download triggered automatically.

---

## Conditional Disable (no file uploaded yet)

```json
{
  "Handler": "custom",
  "eventType": "onLoad",
  "eventCode": "async (store) => {\n  if (!store.ctx.core.data.uploadFileId) {\n    store.setSchema((pre) => ({\n      ...pre,\n      properties: { ...pre.properties, downloadFile: { disabled: true } }\n    }));\n  }\n}"
}
```

## Guard in apiBody (no fileId)

```javascript
"apiBody": "(store) => {\n  const fileId = store.ctx.core.data.uploadFileId;\n  if (!fileId) {\n    store.setNotify({ FailMessage: 'No file to download', Fail: true });\n    return null;\n  }\n  return { id: fileId, withData: true };\n}"
```

## Error Handling

```json
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData, userValue, parentEventOutput) => {\n  store.setNotify({ FailMessage: 'Download failed', Fail: true });\n}",
  "eventType": "Error"
}
```

---

## Passing Original Filename

Store filename during upload, pass it during download for correct browser filename:

```javascript
// During upload — store filename
store.setFormdata(prev => ({
  ...prev,
  uploadFileId: response.data,
  uploadFileName: file.name
}));

// During download — include fileName in request
"apiBody": "(store) => ({\n  id: store.ctx.core.data.uploadFileId,\n  fileName: store.ctx.core.data.uploadFileName,\n  withData: true\n})"
```

---

## Variant: Download from Table Row (IconButton in Table Column)

Use this when the download button is inside a table row and uses the row's data to get the file ID.

```json
{
  "name": "downloadAttachment",
  "type": "Button",
  "label": "Download",
  "iconName": "DownloadIcon",
  "buttonType": "IconButton",
  "defaultStyle": "true",
  "elements": [],
  "events": [
    {
      "path": "/externalData/getById",
      "events": [
        {
          "events": [],
          "Handler": "inBuiltFunction",
          "eventType": "Success",
          "funcParametersCode": "(store, dynamicData, userValue, parentEventOutput, service) => {\n  return parentEventOutput.data;\n}",
          "inBuiltFunctionType": "downloadFile"
        }
      ],
      "method": "post",
      "Handler": "api",
      "apiBody": "(store, dynamicData, userValue, body, service) => {\n  if (!dynamicData?.rowData?.attachmentField) {\n    throw new Error('No attachment on this row');\n  }\n  return {\n    id: dynamicData.rowData.attachmentField,\n    withData: true,\n    toBeDeleted: false\n  };\n}",
      "eventType": "onClick"
    }
  ]
}
```

**Replace `attachmentField`** with the actual column name in your table data that holds the file ID.

The key difference from a standalone DownloadFile button:
- File ID comes from `dynamicData.rowData.yourField` (row data) instead of `store.ctx.core.data.uploadFileId` (formdata)
- Uses `IconButton` type, not `DownloadFile` type
- Throws an error inside `apiBody` to prevent the API call when no attachment exists

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong type name in config
```json
// WRONG
{"name": "download", "type": "Download"}

// CORRECT
{"name": "download", "type": "DownloadFile"}
```

**Mistake 2:** Missing `inBuiltFunctionType: "downloadFile"` in the Success event — without it the file binary is received but the browser download is never triggered.

**Mistake 3:** Wrong `funcParametersCode` — must return `parentEventOutput.data` (the binary), not the whole `parentEventOutput` object.

**Mistake 4:** `uploadFileId` not in formdata — DownloadFile depends on a prior UploadFile having stored the fileId. Always pair with an UploadFile or pre-populate `uploadFileId` from the API response.

---

## Testing Checklist

- [ ] Download button displays with label
- [ ] Button disabled when no fileId (if guard added)
- [ ] Click triggers POST to /externalData/getById
- [ ] File downloads to device
- [ ] Correct filename shown in browser download
- [ ] File content is correct
- [ ] Error notification shows on failure
- [ ] Multiple downloads work

---

## Reference

**Based on:** page_paymentDetailsManagement  
**Widget:** DownloadFile  
**Version:** 1.0  
**Status:** Production Ready
