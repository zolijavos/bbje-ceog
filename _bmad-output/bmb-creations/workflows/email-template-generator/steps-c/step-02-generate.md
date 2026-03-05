---
name: 'step-02-generate'
description: 'Generate new email template by combining master design with user content'
nextStepFile: './step-03-test-and-review.md'
masterDesignReference: '../data/master-design-reference.md'
emailTemplatesFile: '{project-root}/lib/services/email-templates.ts'
previewOutputFolder: '{output_folder}/email-previews'
---

# Step 2: Template Generation

## STEP GOAL:

Generate a new HTML email template by extracting the master design from the magic_link template and combining it with the user's content.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input (inputs gathered in step-01)
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in Hungarian (communication_language)

### Role Reinforcement:

- ✅ You are an email template architect
- ✅ Your expertise: HTML email design, table-based layouts, email client compatibility
- ✅ Work autonomously - the user already provided all inputs

### Step-Specific Rules:

- 🎯 Focus ONLY on generating the template - do not modify any source files yet
- 🚫 FORBIDDEN to insert code into email-templates.ts in this step
- 💬 Work autonomously, output the result when done
- 🎯 The generated HTML MUST follow the master design exactly (colors, fonts, layout, structure)

## EXECUTION PROTOCOLS:

- 🎯 Load master design reference and actual magic_link template
- 💾 Generate HTML and save preview file
- 📖 Generate TypeScript code block for insertion
- 🚫 Do not modify source files - only generate and preview

## CONTEXT BOUNDARIES:

- Inputs from step-01 are in memory: content, slug, subject, variables
- Master design reference available at {masterDesignReference}
- Actual template source at {emailTemplatesFile}
- Preview will be saved to {previewOutputFolder}

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Load Master Design

Load {masterDesignReference} for design system properties.

Then load the `magic_link` template's `html_body` from {emailTemplatesFile} (lines 14-148 approximately). This is the actual HTML that defines the design:

**Extract these design elements:**
- DOCTYPE and head section (MSO compatibility, meta tags)
- Outer table structure (background, centering)
- Container table (680px max-width)
- Header image row structure
- Content area padding and alignment
- Typography styles (Verdana, 15px, #333333, line-height 1.6)
- CTA button style (#c41e3a background, white text, uppercase, letter-spacing)
- Details section table pattern
- Signature section (two-column layout)
- BBJ logo section
- Divider style (1px solid #cccccc)
- Footer section (company info, legal text, links)

### 2. Build New Template HTML

Using the extracted design elements, construct the new template:

1. **Keep identical:** DOCTYPE, head, outer table, container table, header image row, signature section, BBJ logo, divider, footer
2. **Replace content area:** Insert the user's content from step-01 into the content section between header image and signature
3. **Adapt CTA:** If the user's content contains a call-to-action, use the master CTA button style. Update href and text accordingly.
4. **Apply variables:** Replace any dynamic values with `{{variableName}}` syntax matching the variables defined in step-01
5. **Maintain inline styles:** All styles must be inline (no CSS classes)
6. **Keep table-based layout:** No flexbox, no grid

### 3. Generate Plain Text Version

Create a `text_body` version:
- Strip all HTML tags
- Keep paragraph structure with blank lines
- Include URLs as plain text
- Include footer information

### 4. Generate TypeScript Code Block

Prepare the code that will be inserted into {emailTemplatesFile}:

```typescript
  [slug]: {
    slug: '[slug]',
    name: '[Human Readable Name]',
    subject: '[Subject Line]',
    variables: ['var1', 'var2', ...],
    html_body: `[generated HTML]`,
    text_body: `[generated plain text]`
  },
```

Also prepare the SAMPLE_DATA entry:

```typescript
  [slug]: {
    var1: 'Sample Value 1',
    var2: 'Sample Value 2',
    // ... for each variable
  },
```

### 5. Save Preview

Create preview HTML file at `{previewOutputFolder}/preview-[slug].html` with the generated HTML (with sample data interpolated for preview purposes).

### 6. Auto-Proceed to Review

Display brief summary:

"**Sablon generálva!**
- HTML sablon: kész (master design alapján)
- Plain text verzió: kész
- TypeScript kód: kész a beszúráshoz
- Preview fájl: mentve

**Továbblépés a teszteléshez...**"

#### Menu Handling Logic:

- After generation complete and preview saved, immediately load, read entire file, then execute {nextStepFile}

#### EXECUTION RULES:

- This is an auto-proceed step after generation
- Proceed directly to review step
- Always halt if user wants to modify the generation

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Generated HTML matches master design exactly (colors, fonts, layout, structure)
- User's content correctly integrated into the design frame
- {{variable}} placeholders properly placed
- Plain text version generated
- TypeScript code block ready for insertion
- Preview file saved and viewable
- All inline styles, table-based layout, MSO compatibility preserved

### ❌ SYSTEM FAILURE:

- Design elements differ from magic_link master (wrong colors, fonts, layout)
- Using CSS classes instead of inline styles
- Using flexbox/grid instead of tables
- Missing MSO compatibility comments
- Not generating plain text version
- Modifying email-templates.ts in this step (too early!)

**Master Rule:** The generated template MUST be visually identical to the magic_link template in design. Only the content changes.
