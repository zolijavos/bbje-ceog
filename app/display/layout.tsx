/**
 * Display Layout
 *
 * Full-screen layout for display pages (live seating, etc.)
 * Hides global footers and removes body padding.
 */
export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body { padding-bottom: 0 !important; }
        [data-global-footer] { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
