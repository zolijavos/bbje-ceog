'use client';

import { memo } from 'react';

function DiagramsIframeInner() {
  return (
    // Mobile: account for header (4rem) + MobileTabBar (3.5rem) + MobileFooter (~1.5rem) = 9rem
    // Desktop: only header (4rem)
    <div className="h-[calc(100vh-9rem)] md:h-[calc(100vh-4rem)] w-full">
      <iframe
        src="/testing-hub.html?v=20251219k"
        className="w-full h-full border-0"
        title="Testing Hub - Diagrams, Tests & Videos"
      />
    </div>
  );
}

// Memoize to prevent re-renders when parent context changes (e.g., language switch)
const DiagramsIframe = memo(DiagramsIframeInner);
DiagramsIframe.displayName = 'DiagramsIframe';

export default DiagramsIframe;
