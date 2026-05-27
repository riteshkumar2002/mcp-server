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

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/attachments",
  "config": {
    "main": {
      "label": "Attachments"
    }
  },
  "layout": 12,
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/file",
      "config": {
        "main": {
          "onUpload": "onFileUpload",
          "required": false,
          "onDownload": "onFileDownload"
        },
        "style": {
          "backgroundColor": "none"
        },
        "layout": {
          "xs": 6
        }
      },
      "options": {
        "widget": "FileInputField"
      }
    },
    {
      "type": "Control",
      "scope": "#/properties/emptyBox",
      "config": {
        "main": {},
        "layout": {
          "lg": 3,
          "md": 4,
          "sm": 6,
          "xs": 6
        }
      },
      "options": {
        "widget": "EmptyBox"
      }
    }
  ]
}
```

---

## Step 3: Add to schema.properties

```json
"attachments": {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "file": {},
      "fileId": {},
      "eb": {}
    }
  }
}
```

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type (config) | Must be "FileInput" | "FileInput" |
| widget (uiSchema) | Must be "FileInputField" | "FileInputField" |
| Array wrapper | Required for multi-file support | type: "Array" |
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

**Mistake 2:** Wrong widget name
```json
// WRONG
"widget": "FileInput"

// CORRECT
"widget": "FileInputField"
```

**Mistake 3:** Not returning `FormData` from `apiBody` — must return a `FormData` object, not a plain JSON object, for multipart upload.

**Mistake 4:** Missing `fileId` in schema items — the `fileId` property must exist in `schema.properties.attachments.items.properties` so it persists in formdata.

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
