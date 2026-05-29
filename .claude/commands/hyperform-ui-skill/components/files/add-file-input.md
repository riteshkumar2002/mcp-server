---
name: add-file-input
description: Add FileInput components to Hyperform pages for file upload/download/delete. Use this skill whenever you need file attachment handling — document uploads, invoice attachments, proof/evidence files, or email attachments. Covers Array wrapper pattern, onUpload/onDownload/onFileDelete events, FormData apiBody, fileId storage in formdata, downloadFile inbuilt function, and file validation (type/size).
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add FileInput Component

**Pattern Reference:** page_notificationLogView  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add FileInput to Your Page

FileInput Component enables file upload/download/delete operations. Perfect for:
- Document attachments
- Invoice uploads
- Proof/evidence uploads
- Email attachments
- File management in forms

---

## Step 1: Add to config.elements (with Array wrapper)

FileInput must be wrapped inside an `Array` element to support multiple files.

```json
{
  "name": "attachments",
  "type": "Array",
  "label": "Attachments",
  "events": [],
  "elements": [
    {
      "name": "file",
      "type": "FileInput",
      "events": [
        {
          "path": "/externalData/save",
          "method": "post",
          "Handler": "api",
          "apiBody": "(store, dynamicData, user, formData) => {\n  const event = dynamicData.changeEvent;\n  const formDataObj = new FormData();\n  \n  formDataObj.append('metadata', JSON.stringify({\n    name: event.target.files[0].name,\n    type: 'attachment'\n  }));\n  formDataObj.append('file', event?.target.files[0]);\n  formDataObj.append('fileType', 'attachment');\n  \n  return formDataObj;\n}",
          "eventType": "onUpload",
          "events": [
            {
              "Handler": "custom",
              "eventCode": "async(store, dynamicData, userValue, response) => {\n  const fileUploadResponse = response?.data;\n  const name = dynamicData?.changeEvent?.target?.files[0]?.name;\n  let pathIndex = +dynamicData.path.split('.')[1];\n  let currentTable = store?.ctx?.core?.data?.attachments;\n  \n  currentTable[pathIndex] = {\n    file: name,\n    fileId: fileUploadResponse\n  };\n  \n  store.setFormdata((pre) => ({\n    ...pre,\n    attachments: currentTable\n  }));\n}",
              "eventType": "Success"
            }
          ]
        },
        {
          "path": "/externalData/getById",
          "method": "post",
          "Handler": "api",
          "apiBody": "(store, dynamicData, user, formData) => {\n  let pathIndex = +dynamicData.path.split('.')[1];\n  let currentTable = store?.ctx?.core?.data?.attachments;\n  let fileId = currentTable[pathIndex].fileId;\n  \n  return {\"id\": fileId, \"withData\": true};\n}",
          "eventType": "onDownload",
          "events": [
            {
              "Handler": "inBuiltFunction",
              "inBuiltFunctionType": "downloadFile",
              "funcParametersCode": "(store, dynamicData, userValue, response, service) => response?.data",
              "eventType": "Success"
            }
          ]
        },
        {
          "Handler": "custom",
          "eventCode": "async (store, dynamicData) => {\n  store.setNotify({\n    FailMessage: 'Delete disabled in view mode',\n    Fail: true\n  });\n}",
          "eventType": "onFileDelete"
        }
      ],
      "layout": [
        {"key": "xs", "value": "6"}
      ]
    },
    {
      "name": "eb",
      "type": "EmptyBox",
      "events": []
    }
  ]
}
```

---

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type | Must be "FileInput" | "FileInput" |
| Array wrapper | Required for multi-file support | type: "Array" |
| disableUpload | Disable upload capability | "YES" / "NO" |
| disableDownload | Disable download capability | "YES" / "NO" |
| disableDelete | Disable delete capability | "YES" / "NO" |
| useLabel | Show file name as label | "YES" / "NO" |
| apiBody (onUpload) | Build FormData for upload | `new FormData()` |
| onUpload event | Sends file to backend | POST /externalData/save |
| onDownload event | Fetches file from backend | POST /externalData/getById |
| onFileDelete event | Handles delete action | custom handler |
| fileId | Stored in formdata after upload | response?.data |

---

## Upload Flow

1. User selects file → `onUpload` event triggers
2. `apiBody` builds `FormData` with file + metadata
3. POST to `/externalData/save`
4. `Success` handler stores `fileId` in formdata array at correct index

```javascript
// Get row index from path
let pathIndex = +dynamicData.path.split('.')[1];
// Update that row with file name + returned fileId
currentTable[pathIndex] = { file: name, fileId: fileUploadResponse };
store.setFormdata(pre => ({ ...pre, attachments: currentTable }));
```

## Download Flow

1. User clicks download → `onDownload` event triggers
2. `apiBody` looks up `fileId` from formdata at current row index
3. POST to `/externalData/getById` with `{id, withData: true}`
4. `downloadFile` inbuilt function auto-triggers browser download

## Delete Flow

```javascript
// Option 1: Disable in view mode
store.setNotify({ FailMessage: "Delete disabled in view mode", Fail: true });

// Option 2: Allow delete
let pathIndex = +dynamicData.path.split('.')[1];
let attachments = store?.ctx?.core?.data?.attachments;
attachments.splice(pathIndex, 1);
store.setFormdata(pre => ({ ...pre, attachments }));
```

---

## API Endpoints

### Upload
```
POST /externalData/save  (multipart/form-data)
  metadata: JSON string {name, type}
  file: binary
  fileType: "attachment" | "emailData" | custom

Response: data: "fileId_12345"
```

### Download
```
POST /externalData/getById  (application/json)
  {id: "fileId_12345", withData: true}

Response: data: [binary file content]
```

---

## File Validation (onStart event)

### Type Validation
```javascript
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData) => {\n  const file = dynamicData?.changeEvent?.target?.files[0];\n  const allowedTypes = ['application/pdf', 'application/vnd.ms-excel'];\n  \n  if (!allowedTypes.includes(file.type)) {\n    store.setNotify({ FailMessage: 'Only PDF and Excel files allowed', Fail: true });\n    return false;\n  }\n  return true;\n}",
  "eventType": "onStart"
}
```

### Size Validation (5MB limit)
```javascript
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData) => {\n  const file = dynamicData?.changeEvent?.target?.files[0];\n  const maxSize = 5 * 1024 * 1024;\n  \n  if (file.size > maxSize) {\n    store.setNotify({ FailMessage: 'File size exceeds 5MB', Fail: true });\n    return false;\n  }\n  return true;\n}",
  "eventType": "onStart"
}
```

---

## Guard Against Missing fileId (onStart before download)

```javascript
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData) => {\n  let pathIndex = +dynamicData.path.split('.')[1];\n  let files = store?.ctx?.core?.data?.attachments;\n  let fileId = files[pathIndex].fileId;\n  \n  if (!fileId) {\n    store.setNotify({ FailMessage: 'No File Present', Fail: true });\n    return false;\n  }\n  return true;\n}",
  "eventType": "onStart"
}
```

---

## Common Patterns

### Single File Upload
```json
{
  "name": "invoiceFile",
  "type": "FileInput",
  "events": [...]
}
```

### Multiple Files (Array wrapper)
```json
{
  "name": "attachments",
  "type": "Array",
  "elements": [
    {"name": "file", "type": "FileInput", "events": [...]}
  ]
}
```

### Conditional Visibility
```javascript
store.setSchema(pre => ({
  ...pre,
  properties: {
    ...pre.properties,
    file: { ...pre.properties.file, hidden: formdata.type !== 'Invoice' }
  }
}));
```

---

## Common Mistakes to Avoid

**Mistake 1:** Missing Array wrapper — `FileInput` must be inside an `Array` element for upload/download path indexing to work.

**Mistake 2:** Wrong type name in config — the config type is `"FileInput"` (not `"FileInputField"`).
```json
// WRONG
{"name": "file", "type": "FileInputField"}

// CORRECT
{"name": "file", "type": "FileInput"}
```

**Mistake 3:** Not returning `FormData` from `apiBody` — must return a `FormData` object, not a plain JSON object, for multipart upload.

**Mistake 4:** Not naming the `fileId` child element in config — include a `fileId` field inside the Array's elements so the auto-derived schema includes it and it persists in formdata after upload.

---

## Testing Checklist

- [ ] File input displays
- [ ] Browse button works
- [ ] Upload API called with correct FormData
- [ ] Success event fires and stores fileId
- [ ] Download retrieves correct file
- [ ] File downloads to browser
- [ ] Delete handler works (or is disabled in view mode)
- [ ] Error messages show on failure
- [ ] File type/size validation works
- [ ] Multiple files supported via Array

---

## Reference

**Based on:** page_notificationLogView  
**Widget:** FileInputField  
**Version:** 1.0  
**Status:** Production Ready
