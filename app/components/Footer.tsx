import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="hidden md:block fixed bottom-0 left-0 right-0 py-1 border-t border-neutral-200/30 dark:border-neutral-700/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm z-40">
      <div className="flex items-center justify-center gap-1.5">
        <Image
          src="/myforgelabs-logo.png"
          alt="MyForge Labs"
          width={14}
          height={14}
          className="opacity-50"
        />
        <span className="text-xs text-neutral-500/50 dark:text-neutral-400/50">
          Built By{' '}
          <a
            href="https://www.myforgelabs.com/#kapcsolat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600/50 dark:text-neutral-300/50 hover:text-neutral-800 dark:hover:text-white transition-colors underline"
          >
            MyForge Labs
          </a>
        </span>
      </div>
    </footer>
  );
}
