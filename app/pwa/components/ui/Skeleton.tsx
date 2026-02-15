'use client';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'custom';
  count?: number;
}

export default function Skeleton({
  className = '',
  width,
  height,
  variant = 'text',
  count = 1,
}: SkeletonProps) {
  const variantClass =
    variant === 'text'
      ? 'skeleton-text'
      : variant === 'title'
      ? 'skeleton-title'
      : variant === 'avatar'
      ? 'skeleton-avatar'
      : variant === 'card'
      ? 'skeleton-card'
      : '';

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton ${variantClass} ${className}`}
      style={style}
    />
  ));

  if (count === 1) {
    return items[0];
  }

  return <div className="space-y-2">{items}</div>;
}

// Pre-built skeleton patterns
export function SkeletonCard() {
  return (
    <div className="card-static p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="pwa-bg-header p-4 pb-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton variant="text" width={120} className="!bg-gray-700" />
          <Skeleton variant="text" width={60} className="!bg-gray-700" />
        </div>
        <Skeleton variant="title" width="70%" className="!bg-gray-700 !h-8" />
        <Skeleton variant="text" width={80} className="!bg-gray-700 mt-2" />
      </div>

      {/* Cards skeleton */}
      <div className="p-4 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function SkeletonTicket() {
  return (
    <div className="p-4">
      <div className="card-static max-w-sm mx-auto overflow-hidden">
        {/* Header */}
        <div className="pwa-bg-header p-4">
          <Skeleton variant="title" className="!bg-gray-700 mx-auto !w-40" />
          <Skeleton variant="text" className="!bg-gray-700 mx-auto !w-32 mt-2" />
        </div>

        {/* QR Code area */}
        <div className="p-6 flex justify-center">
          <Skeleton variant="custom" width={200} height={200} />
        </div>

        {/* Details */}
        <div className="p-4 border-t pwa-border-subtle space-y-3">
          <div className="flex justify-between">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="40%" />
          </div>
          <div className="flex justify-between">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="35%" />
          </div>
        </div>
      </div>
    </div>
  );
}
