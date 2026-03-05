---
name: 'step-04-insert'
description: 'Insert approved template into email-templates.ts codebase'
emailTemplatesFile: '{project-root}/lib/services/email-templates.ts'
---

# Step 4: Code Insertion

## STEP GOAL:

Insert the approved email template into the codebase by modifying email-templates.ts with the new DEFAULT_TEMPLATES entry, updating TemplateSlug type, and adding SAMPLE_DATA.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 📖 CRITICAL: Read the complete step file before taking any action
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in Hungarian (communication_language)

### Role Reinforcement:

- ✅ You are an email template architect performing code insertion
- ✅ Make precise, targeted modifications only
- ✅ Do not change existing templates or code

### Step-Specific Rules:

- 🎯 Focus ONLY on inserting the new template into the codebase
- 🚫 FORBIDDEN to modify any existing templates
- 🚫 FORBIDDEN to change existing code structure
- 💬 Report what was modified when done

## EXECUTION PROTOCOLS:

- 🎯 Read current file state before modifying
- 💾 Make targeted insertions only
- 📖 Verify insertion was successful
- 🚫 This is the final step - no next step file

## CONTEXT BOUNDARIES:

- Approved template from step-03 is in memory (HTML, text, slug, subject, variables)
- Target file: {emailTemplatesFile}
- TypeScript code block was generated in step-02
- This is the FINAL step

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Read Current State

Read {emailTemplatesFile} to identify:
- The last entry in DEFAULT_TEMPLATES (to insert after it)
- The TemplateSlug type definition location
- The SAMPLE_DATA object location (if it exists)
- The `renderTemplate` and `getTemplateWithFallback` functions to verify they work with the new slug automatically (they use `keyof typeof DEFAULT_TEMPLATES`)

### 2. Insert New Template Entry

Add the new template entry to DEFAULT_TEMPLATES object in {emailTemplatesFile}:

**Insert BEFORE the closing `}` of DEFAULT_TEMPLATES:**

```typescript
  [slug]: {
    slug: '[slug]',
    name: '[Human Readable Name]',
    subject: '[Subject Line]',
    variables: [variable array],
    html_body: `[approved HTML]`,
    text_body: `[approved plain text]`
  },
```

**Note:** TemplateSlug type updates automatically since it's defined as `keyof typeof DEFAULT_TEMPLATES`.

### 3. Update SAMPLE_DATA (If Exists)

Search for SAMPLE_DATA or similar preview data object in {emailTemplatesFile}.

If found, add a new entry with sample values for the template's variables:

```typescript
  [slug]: {
    var1: 'Sample Value',
    var2: 'Sample Value',
  },
```

### 4. Verify Insertion

After modification:

1. Read the modified sections of {emailTemplatesFile} to confirm:
   - New template entry exists in DEFAULT_TEMPLATES
   - Slug is correct
   - HTML body is properly escaped in template literal
   - Variables array matches
   - No syntax errors in the TypeScript

2. If possible, run `npx tsc --noEmit` to verify TypeScript compilation.

### 5. Final Summary

"**Sablon sikeresen beszúrva!**

**Összefoglaló:**
- **Slug:** `[slug_name]`
- **Név:** [human readable name]
- **Tárgy:** [subject line]
- **Változók:** [variable list]
- **Módosított fájl:** `lib/services/email-templates.ts`

**Elérhető:**
- ✅ Bulk email küldő (`/admin/scheduled-emails`) - válaszd ki a `[slug]` sablont
- ✅ API: `POST /api/admin/scheduled-emails/bulk` - `template_slug: '[slug]'`
- ✅ Preview: `POST /api/admin/email-templates/[slug]/preview`

**Workflow befejezve.**"

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- New template entry correctly inserted into DEFAULT_TEMPLATES
- TemplateSlug type automatically includes new slug
- SAMPLE_DATA updated (if applicable)
- No existing templates or code modified
- TypeScript compiles without errors
- Template accessible via bulk email system and API
- Clear summary provided

### ❌ SYSTEM FAILURE:

- Modifying existing templates
- Breaking TypeScript compilation
- Incorrect template literal escaping
- Missing variables in the entry
- Not verifying the insertion

**Master Rule:** Insert precisely, verify thoroughly, modify nothing else.
