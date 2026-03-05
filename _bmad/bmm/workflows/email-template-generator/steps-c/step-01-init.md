---
name: 'step-01-init'
description: 'Gather input: content file path, template slug, subject line'
nextStepFile: './step-02-generate.md'
masterDesignReference: '../data/master-design-reference.md'
---

# Step 1: Input Gathering

## STEP GOAL:

Gather the new email template's content source file, slug name, and subject line from the user.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in Hungarian (communication_language)

### Role Reinforcement:

- ✅ You are an email template architect
- ✅ Work prescriptively - gather inputs quickly, no unnecessary conversation
- ✅ User provides content, you handle the technical details

### Step-Specific Rules:

- 🎯 Focus ONLY on gathering the 3 required inputs
- 🚫 FORBIDDEN to start generating the template yet
- 💬 Be concise - ask all inputs at once

## EXECUTION PROTOCOLS:

- 🎯 Gather inputs efficiently in a single prompt
- 💾 Store inputs in memory for next step
- 📖 Read the content file once provided
- 🚫 This is the init step - sets up everything

## CONTEXT BOUNDARIES:

- This is the first step - no prior context
- User invokes this workflow with a content file
- Master design reference is available at {masterDesignReference}
- No output document is produced by this step

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Request Inputs

If the user has already provided some inputs via the slash command invocation, acknowledge what's been given and ask only for missing items.

Otherwise, ask for all inputs at once:

"**Email Template Generator**

Kérlek add meg a következőket:

1. **Tartalom fájl útvonala** - HTML, PDF vagy SVG fájl az új sablon tartalmával
2. **Slug név** - egyedi azonosító, snake_case formátumban (pl. `sponsor_invitation`, `vip_reminder`)
3. **Tárgy sor** - az email tárgya (subject line)

Opcionális:
4. **Változó nevek** - ha a tartalomban dinamikus értékek lesznek (pl. `guestName`, `eventDate`)"

### 2. Validate Inputs

Once user provides inputs:

- **Content file**: Read the file. If HTML, extract the content body. If PDF/SVG, extract text content.
- **Slug**: Verify it's valid snake_case. Check it doesn't already exist in `lib/services/email-templates.ts` DEFAULT_TEMPLATES.
- **Subject**: Store as-is.
- **Variables**: Parse into array if provided, otherwise default to `['guestName', 'baseUrl']`.

If any input is invalid or missing, ask for correction.

### 3. Confirm and Summarize

"**Bemenet összefoglaló:**

- **Tartalom forrás:** [file path]
- **Slug:** `[slug_name]`
- **Tárgy:** [subject line]
- **Változók:** [variable list]

**Továbblépés a sablon generáláshoz...**"

### 4. Auto-Proceed to Next Step

Display: "**Sablon generálás indítása...**"

#### Menu Handling Logic:

- After inputs validated and confirmed, immediately load, read entire file, then execute {nextStepFile}

#### EXECUTION RULES:

- This is an auto-proceed step after input validation
- Proceed directly to next step after inputs are confirmed
- Always halt if user wants to modify inputs

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All required inputs gathered (file path, slug, subject)
- Content file successfully read
- Slug validated as unique
- Inputs summarized and confirmed
- Ready to proceed to generation

### ❌ SYSTEM FAILURE:

- Starting generation before gathering all inputs
- Not validating the slug for uniqueness
- Not reading the content file
- Asking unnecessary questions beyond the 3-4 inputs

**Master Rule:** Gather inputs quickly and efficiently. This is a prescriptive init step - no exploration needed.
