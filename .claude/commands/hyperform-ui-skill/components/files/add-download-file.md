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

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/downloadFile",
  "config": {
    "main": {
      "label": "Download File",
      "onClick": "onClick",
      "required": false
    },
    "style": {
      "backgroundColor": "none"
    },
    "layout": {
      "lg": 3,
      "md": 3,
      "xs": 12
    }
  },
  "options": {
    "widget": "DownloadFile"
  }
}
```

---

## Step 3: schema.properties

DownloadFile doesn't need a schema entry — it reads `uploadFileId` from formdata (set during upload).

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type (config) | Must be "DownloadFile" | "DownloadFile" |
| widget (uiSchema) | Must be "DownloadFile" | "DownloadFile" |
| label | Button label | "Download File" |
| apiBody | Builds request with fileId | reads `uploadFileId` from store |
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

### uiSchema.elements

```json
[
  {
    "type": "Control",
    "scope": "#/properties/uploadFile",
    "config": {
      "main": {"label": "Invoice File", "onClick": "onClick", "required": true},
      "style": {"backgroundColor": "none"},
      "layout": {"lg": 3, "md": 3, "xs": 12}
    },
    "options": {"widget": "UploadFile"}
  },
  {
    "type": "Control",
    "scope": "#/properties/downloadFile",
    "config": {
      "main": {"label": "Download File", "onClick": "onClick", "required": false},
      "style": {"backgroundColor": "none"},
      "layout": {"lg": 3, "md": 3, "xs": 12}
    },
    "options": {"widget": "DownloadFile"}
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

## Common Mistakes to Avoid

**Mistake 1:** Wrong widget name
```json
// WRONG
"widget": "Download"

// CORRECT
"widget": "DownloadFile"
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
