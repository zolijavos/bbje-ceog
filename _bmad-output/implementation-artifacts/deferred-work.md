# Deferred Work

## From: Seating Redesign (2026-03-22)

- **Search debounce**: A keresőmező nem debounce-ol — minden billentyűleütés azonnali useMemo recalc-ot triggerel. 200-300ms debounce javítaná a teljesítményt 100+ asztalnál. (SeatingSearchBar.tsx / SeatingDashboard.tsx)

- **Konva glow animation performance**: A spotlight pulzáló glow `setInterval` + `setState` módszert használ, ami 800ms-enként full React re-rendert okoz a FloorPlanCanvas-on. Konva natív animation API-val jobb lenne. (FloorPlanCanvas.tsx)

- **PairedGuestChip highlight granularitás**: A `★` karakter megjelenik mind a fő vendég, mind a partner nevén, akkor is ha csak az egyikük matchel a keresésre. Külön highlight flag kellene a main és partner részre. (PairedGuestChip.tsx)
