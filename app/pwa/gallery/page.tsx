'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Images,
  Image as ImageIcon,
  X,
  CaretLeft,
  CaretRight,
  DownloadSimple,
  ShareNetwork,
} from '@phosphor-icons/react';
import Card from '../components/ui/Card';
import Button3D from '../components/ui/Button3D';
import Skeleton from '../components/ui/Skeleton';
import { useHaptic } from '../hooks/useHaptic';

// Mock gallery data - in production, this would come from an API
interface GalleryImage {
  id: string;
  src: string;
  thumbnail: string;
  alt: string;
  category: 'ceremony' | 'dinner' | 'networking' | 'entertainment';
}

// Placeholder images - replace with actual event photos after the event
const GALLERY_IMAGES: GalleryImage[] = [];

// Will be populated after the event
const GALLERY_AVAILABLE = false;
const EVENT_DATE = new Date('2026-02-27');

function SkeletonGallery() {
  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      <header className="pwa-bg-header px-4 py-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-5 skeleton-shimmer"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          />
          <div
            className="w-32 h-6 skeleton-shimmer"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          />
        </div>
      </header>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="custom" height={150} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { patterns } = useHaptic();
  const currentImage = images[currentIndex];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  const handleShare = async () => {
    patterns.medium();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CEO Gala 2026 Photo',
          text: 'Check out this photo from CEO Gala 2026!',
          url: currentImage.src,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  const handleDownload = () => {
    patterns.success();
    const link = document.createElement('a');
    link.href = currentImage.src;
    link.download = `ceo-gala-2026-${currentImage.id}.jpg`;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <span className="text-white/70 text-sm">
          {currentIndex + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          {navigator.share && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <ShareNetwork size={24} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <DownloadSimple size={24} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              patterns.light();
              onPrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white/70 hover:text-white transition-colors"
          >
            <CaretLeft size={28} weight="bold" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              patterns.light();
              onNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full text-white/70 hover:text-white transition-colors"
          >
            <CaretRight size={28} weight="bold" />
          </button>
        </>
      )}
    </div>
  );
}

export default function PWAGalleryPage() {
  const router = useRouter();
  const { patterns } = useHaptic();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/pwa/auth/session');
        if (!res.ok) {
          router.replace('/pwa');
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.replace('/pwa');
          return;
        }
      } catch {
        router.replace('/pwa');
        return;
      }

      // In production, fetch images from API
      setImages(GALLERY_IMAGES);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleImageClick = (index: number) => {
    patterns.light();
    setLightboxIndex(index);
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    }
  };

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  if (loading) {
    return <SkeletonGallery />;
  }

  // Calculate days until/since event
  const now = new Date();
  const isBeforeEvent = now < EVENT_DATE;
  const daysDiff = Math.ceil(Math.abs(EVENT_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen pwa-bg-base pb-20">
      {/* Header */}
      <header className="pwa-bg-header pwa-text-inverse px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/pwa/dashboard"
            className="pwa-text-inverse opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1 className="font-display text-xl pwa-text-inverse">Event Gallery</h1>
        </div>
      </header>

      <div className="p-4">
        {!GALLERY_AVAILABLE ? (
          // Gallery not yet available
          <Card variant="static" className="text-center py-12">
            <div className="mb-4">
              <Images
                size={64}
                weight="duotone"
                className="mx-auto"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            </div>
            <h2 className="text-xl font-semibold pwa-text-primary mb-2">
              Gallery Coming Soon
            </h2>
            <p className="pwa-text-secondary text-sm mb-4 max-w-xs mx-auto">
              {isBeforeEvent
                ? `Photos will be available after the event. ${daysDiff} days to go!`
                : 'Photos from the event will be uploaded soon. Check back later!'}
            </p>
            <Link href="/pwa/dashboard">
              <Button3D variant="secondary">Back to Dashboard</Button3D>
            </Link>
          </Card>
        ) : images.length === 0 ? (
          // No images yet
          <Card variant="static" className="text-center py-12">
            <ImageIcon
              size={64}
              weight="duotone"
              className="mx-auto mb-4"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <h2 className="text-xl font-semibold pwa-text-primary mb-2">
              No Photos Yet
            </h2>
            <p className="pwa-text-secondary text-sm">
              Photos from the event will appear here.
            </p>
          </Card>
        ) : (
          // Display gallery grid
          <>
            <p className="pwa-text-secondary text-sm mb-4 text-center">
              {images.length} photos from CEO Gala 2026
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => handleImageClick(index)}
                  className="relative aspect-square overflow-hidden group"
                  style={{ background: 'var(--color-bg-elevated)' }}
                >
                  <img
                    src={image.thumbnail}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Help link */}
      <div className="p-4 text-center">
        <Link href="/pwa/help" className="pwa-text-tertiary text-sm hover:underline">
          Need help?
        </Link>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
