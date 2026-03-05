# Master Design Reference

## Source

The master design is extracted from the `magic_link` template in `lib/services/email-templates.ts`.

## Design System Properties

### Layout
- **Container**: 680px max-width, centered table-based layout
- **Background**: #ffffff (white)
- **Content padding**: 20px 15px

### Typography
- **Primary font**: Verdana, Geneva, sans-serif
- **Font size**: 15px body text, 14px CTA button, 12px footer, 11px legal
- **Line height**: 1.6
- **Text color**: #333333 (body), #1a1a2e (signature names), #666666 (footer)
- **Text alignment**: center (body), left (signature greeting)

### CTA Button
- **Background color**: #c41e3a (CEO Gala red)
- **Text color**: #ffffff
- **Padding**: 12px 35px
- **Font**: Arial, Helvetica, sans-serif
- **Style**: bold, uppercase, letter-spacing 1px

### Divider
- **Border**: 1px solid #cccccc
- **Margin**: 25px 0

### Email Structure (sections in order)
1. **Header Image** - Full-width image, 680px max
2. **Content Area** - Greeting + body paragraphs (center aligned)
3. **Details Section** (optional) - Key info in centered table rows with 8px spacing
4. **CTA Button** - Centered, 25px top margin, 20px bottom margin
5. **Additional paragraphs** (optional)
6. **Warm regards** - Left aligned
7. **Signatures** - Two-column table (name bold + title)
8. **BBJ Logo** - Centered, 300px max-width
9. **Divider** - Horizontal rule
10. **Footer** - Company info, links, legal text

### Email Client Compatibility
- MSO conditional comments for Outlook
- Table-based layout (no flexbox/grid)
- Inline styles only (no CSS classes)
- xmlns:v and xmlns:o for Microsoft Office

### Template Variable Syntax
- `{{variableName}}` - Handlebars-style interpolation
- Common variables: `guestName`, `magicLinkUrl`, `baseUrl`

## DEFAULT_TEMPLATES Entry Structure

```typescript
template_slug: {
  slug: 'template_slug',
  name: 'Human Readable Name',
  subject: 'Email Subject Line',
  variables: ['var1', 'var2', 'var3'],
  html_body: `<!DOCTYPE html>...`,
  text_body: `Plain text version...`
}
```

## File Location

- **Templates**: `lib/services/email-templates.ts`
- **Type definition**: `export type TemplateSlug = keyof typeof DEFAULT_TEMPLATES;` (line ~3151)
- **Render function**: `renderTemplate(slug, variables)` (line ~3346)
- **Template loader**: `getTemplateWithFallback(slug)` (line ~3223)
