---
name: hyperform-upload-button
description: Add UploadFile buttons to Hyperform pages quickly and correctly. Use this skill whenever you need to add document upload, file attachment, or file submission controls to a Hyperform page. This skill ensures the correct widget type (UploadFile), proper layout grid configuration, and schema updates are applied consistently. Perfect for KYC documents, invoices, signatures, images, certificates, and any file submission feature in Hyperform.
compatibility: Hyperform MCP server, hyperform-ui tools
---

# Hyperform Upload Button Skill

This skill provides the correct configuration for adding UploadFile buttons to Hyperform pages. It eliminates guesswork and ensures consistency across all upload controls.

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## When to Use This Skill

Use this skill when you need to:
- Add document upload fields (KYC, invoices, images, PDFs)
- Create file attachment controls on Hyperform pages
- Add signature or certificate uploads
- Create multi-file upload sections
- Update existing pages with new upload functionality

## Key Configuration

### Widget Type
Always use `UploadFile` widget, NOT `FileUpload`. The UploadFile widget is the standard Hyperform upload control that matches the platform's design system.

### Correct Layout Configuration
All upload controls should use this responsive grid layout:
```
lg: 4    (large screens: 4 of 12 columns)
md: 4    (medium screens: 4 of 12 columns)
sm: 5    (small screens: 5 of 12 columns)
xs: 12   (extra small screens: full width)
```

### Minimal Configuration Pattern
The simplest upload control requires minimal configuration:

**In config.elements:**
```json
{
  "name": "controlName",
  "type": "UploadFile",
  "label": "Display Label",
  "events": [],
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "5"},
    {"key": "xs", "value": "12"}
  ]
}
```

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

## Common Upload Scenarios

### 1. Single Document Upload (KYC, Invoice, etc.)
```json
{
  "name": "kycDocumentUpload",
  "type": "UploadFile",
  "label": "KYC Document Upload",
  "events": [],
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "5"},
    {"key": "xs", "value": "12"}
  ]
}
```

### 2. Multiple Upload Controls in a Section
Place multiple uploads in the same WrapperSection, each taking lg:4 width:
```
Row 1: Upload 1 (lg:4) | Upload 2 (lg:4) | Upload 3 (lg:4)
Row 2: Empty Box (lg:4) | | (fills remaining space)
```

### 3. Required Upload Field
```json
{
  "name": "documentUpload",
  "type": "UploadFile",
  "label": "Document",
  "required": true,
  "events": [],
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "5"},
    {"key": "xs", "value": "12"}
  ]
}
```

### 4. Optional Upload Field
```json
{
  "name": "optionalUpload",
  "type": "UploadFile",
  "label": "Additional Document (Optional)",
  "required": false,
  "events": [],
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "5"},
    {"key": "xs", "value": "12"}
  ]
}
```

## Complete Page Example

Here's a complete section with upload controls (from page_manualSign):

```json
{
  "name": "signContainer",
  "type": "WrapperSection",
  "label": "Upload Signed Invoice",
  "events": [],
  "divider": "YES",
  "elements": [
    {
      "name": "signedInvoiceUpload",
      "type": "UploadFile",
      "events": [],
      "layout": [
        {"key": "lg", "value": "4"},
        {"key": "md", "value": "4"},
        {"key": "sm", "value": "5"},
        {"key": "xs", "value": "12"}
      ]
    },
    {
      "name": "imageUpload",
      "type": "UploadFile",
      "label": "Image Upload",
      "events": [],
      "layout": [
        {"key": "lg", "value": "4"},
        {"key": "md", "value": "4"},
        {"key": "sm", "value": "5"},
        {"key": "xs", "value": "12"}
      ]
    },
    {
      "name": "panCardUpload",
      "type": "UploadFile",
      "label": "PAN Card Upload",
      "events": [],
      "layout": [
        {"key": "lg", "value": "4"},
        {"key": "md", "value": "4"},
        {"key": "sm", "value": "5"},
        {"key": "xs", "value": "12"}
      ]
    },
    {
      "name": "emptyBox",
      "type": "EmptyBox",
      "events": [],
      "layout": [
        {"key": "lg", "value": "8"},
        {"key": "md", "value": "8"},
        {"key": "sm", "value": "5"},
        {"key": "xs", "value": "12"}
      ]
    }
  ]
}
```

## Adding Upload to an Existing Page

When updating an existing Hyperform page (e.g., page_eSign):

1. **Fetch the current page** using `get_page_record` with the page name
2. **Locate where to insert** the upload control in `config.elements`
3. **Add the upload element** to the appropriate WrapperSection in config
4. **Save the page** using `update_page(pageName, config, userId)` — uiSchema and schema are auto-derived
5. **DO NOT auto-approve** - let manual approval handle it

## Best Practices

✓ **DO:**
- Use `UploadFile` widget type (not FileUpload)
- Always include the responsive layout (lg:4, md:4, sm:5, xs:12)
- Place uploads in logical WrapperSection groupings
- Use empty boxes to fill incomplete rows
- Keep label text short and descriptive
- Leave events array empty unless custom behavior is needed
- Let required/optional status be determined by business logic

✗ **DON'T:**
- Use FileUpload widget (only use UploadFile)
- Use custom file size limits or accept filters in the base upload
- Over-complicate the configuration with unnecessary properties
- Add event handlers unless specifically required
- Auto-approve changes - always leave for manual review

## Quick Reference: Control Name Patterns

Use clear, descriptive names:
- `kycDocumentUpload` - for KYC documents
- `signedInvoiceUpload` - for signed invoices
- `panCardUpload` - for PAN cards
- `imageUpload` - for image documents
- `certificateUpload` - for certificates
- `attachmentUpload` - for general attachments

## Integration with Page Builder

This skill works with the Hyperform page builder. For complete page structure guidance, refer to the page builder guide via `get_page_builder_guide`.

### Example Usage:
```
User: "Add KYC document upload to page_eSign"
Claude: Fetches page → Adds UploadFile control to config → Saves with update_page(pageName, config, 1)
Result: UploadFile control appears on the page with correct configuration
```

---

**Last Updated:** 2026-05-18
**Compatible with:** Hyperform3, HyPerform Page Builder
