---
name: 'step-03-test-and-review'
description: 'Present generated template for review and approval before code insertion'
nextStepFile: './step-04-insert.md'
previewOutputFolder: '{output_folder}/email-previews'
---

# Step 3: Test and Review

## STEP GOAL:

Present the generated email template for user review and approval before inserting it into the codebase.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER proceed to insertion without explicit user approval
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in Hungarian (communication_language)

### Role Reinforcement:

- ✅ You are an email template architect conducting quality review
- ✅ Present findings clearly and concisely
- ✅ This is the ONLY checkpoint - the user must approve here

### Step-Specific Rules:

- 🎯 Focus ONLY on review and approval
- 🚫 FORBIDDEN to insert code without user approval
- 💬 Present the preview and wait for feedback
- 🔄 If user requests changes, regenerate and re-present

## EXECUTION PROTOCOLS:

- 🎯 Present preview clearly
- 💾 Track approval status
- 📖 Only proceed with explicit 'C' from user
- 🚫 FORBIDDEN to auto-proceed - this is a user checkpoint

## CONTEXT BOUNDARIES:

- Generated template from step-02 is in memory
- Preview file available at {previewOutputFolder}
- This is the single decision point in the workflow
- User can request modifications before approving

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Present Template Preview

"**Sablon Előnézet**

**Slug:** `[slug_name]`
**Tárgy:** [subject line]
**Változók:** [variable list]

---

**HTML Preview:**
[Show the generated HTML in a code block - key sections only, not full source]

**Ellenőrzési lista:**
- [ ] Design megegyezik a master-rel (színek, fontok, layout)
- [ ] Tartalom helyesen illeszkedik
- [ ] CTA gomb megfelelő szöveggel és linkkel
- [ ] {{változók}} helyesen beillesztve
- [ ] Aláírás szekció helyes
- [ ] Lábléc és jogi szöveg helyes

---

Preview fájl elmentve: `{previewOutputFolder}/preview-[slug].html`
Nyisd meg böngészőben a vizuális ellenőrzéshez."

### 2. Request Feedback

"**Kérlek ellenőrizd a sablont és válassz:**

[C] **Jóváhagyás** - A sablon rendben van, beszúrhatjuk a kódba
[M] **Módosítás** - Változtatást kérek (írd le mit)"

### 3. Handle Response

**IF C (Approve):**
- Proceed to menu options below

**IF M (Modify):**
- Ask: "Mit szeretnél módosítani?"
- Listen to feedback
- Regenerate the affected parts
- Re-present the preview (return to step 1 of this sequence)
- Loop until user approves

**IF other:**
- Help user, then redisplay options

### 4. Present MENU OPTIONS

Display: **Sablon jóváhagyva! Válassz:** [C] Tovább a kód beszúráshoz

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can still request modifications - return to review if so

#### Menu Handling Logic:

- IF C: Load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#4-present-menu-options)

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Template preview clearly presented
- Checklist items highlighted for review
- Preview file path provided for browser viewing
- User explicitly approved the template
- Modifications handled if requested
- Only proceeds to insertion with approval

### ❌ SYSTEM FAILURE:

- Auto-proceeding without user approval
- Not presenting the preview clearly
- Not offering modification option
- Proceeding despite user requesting changes

**Master Rule:** This is the ONLY checkpoint. Never skip user approval.
