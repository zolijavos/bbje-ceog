# CEO Gala 2026 - Registration Screens
## English Text Specification for Designer

**Date:** 2026-01-20
**Version:** 1.0
**Themes:** Dark, Dark Blue, Light

---

## Screen 1: Invitation

| Element | English Text |
|---------|--------------|
| Label above name | Dear |
| Guest title | Invited Guest |
| Event title | CEO Gala 2026 |
| Date/Time | Friday, March 27, 2026 • 6:00 PM |
| Location | Budapest, Corinthia Hotel |
| Primary button | YES, I WILL ATTEND |
| Secondary button | I CANNOT ATTEND |
| Footer | Built By MyForge Labs |

**Notes:**
- Remove QR code text (was: "QR-kódos bejelentkezési...")
- Footer text should be smaller and more subtle (10px, 50% opacity)

---

## Screen 2: Confirmation (After clicking "Yes")

| Element | English Text |
|---------|--------------|
| Heading | Thank You for Your Response! |
| Subtext line 1 | You will receive a confirmation email shortly. |
| Subtext line 2 | Please continue to registration. |
| Primary button | CONTINUE TO REGISTRATION → |
| Footer | Built By MyForge Labs |

**Notes:**
- Checkmark icon in circle with gold border
- Arrow (→) at end of button text

---

## Screen 3: Registration Details

| Element | English Text |
|---------|--------------|
| Heading | Registration Details |
| Label 1 | Name: |
| Label 2 | Email: |
| Label 3 | Status: |
| Status badge | VIP Guest |
| Section heading | Next Steps |
| Step 1 | Download your QR ticket |
| Step 2 | Add event to calendar |
| Step 3 | Enjoy the event! |
| Footer | Built By MyForge Labs |

**Notes:**
- Status badge: Gold background (#d4af37), dark text
- Step icons: phone/QR, calendar, party

---

## Screen 4: Success / Registration Complete

| Element | English Text |
|---------|--------------|
| Heading | Registration Complete! |
| Subtext | We hope you will have a wonderful time at the event. |
| Event title | CEO Gala 2026 |
| Date/Time | Friday, March 27, 2026 • 6:00 PM |
| Location | Budapest, Corinthia Hotel |
| Closing text | Enjoy the event! |
| Footer | Built By MyForge Labs |

**Notes:**
- "Enjoy the event!" in italic, gold color (#d4af37)
- Checkmark icon with gold border

---

## Design Notes

### Footer Branding
- Text: "Built By MyForge Labs"
- Size: 10px
- Opacity: 50%
- Letter spacing: 1px
- Centered, with subtle top border

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Gold | #d4af37 | Stars, lines, accents |
| Burgundy | #722f37 | Primary buttons, light theme labels |
| Dark background | #1a1a2e | Dark theme |
| Dark blue background | #0a1628 | Dark blue theme |
| Light background | #f5f0e8 | Light theme |

### Typography
- Headings: 20-28px, weight 600
- Body: 14px, weight 400
- Labels: 12px, uppercase, letter-spacing 2px
- Buttons: 14px, weight 700, uppercase, letter-spacing 1px

---

## Dynamic Content (from database)

These fields will be replaced with actual data:

| Placeholder | Source |
|-------------|--------|
| Jane Smith | guest.firstName + guest.lastName |
| Invited Guest | guest.guestType (VIP Guest / Paying Guest) |
| jane@company.com | guest.email |
| VIP Guest | registration.ticketType |

---

## HTML Mockup

Live preview available at:
```
/public/mockups/registration-screens-en.html
```

URL: `https://ceogala.mflevents.space/mockups/registration-screens-en.html`
