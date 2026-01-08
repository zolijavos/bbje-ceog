import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="hidden md:block fixed bottom-0 left-0 right-0 py-1.5 border-t border-neutral-200/30 dark:border-neutral-700/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm z-40">
      <div className="flex items-center justify-center gap-2">
        <Image
          src="/myforgelabs-logo.png"
          alt="MyForge Labs"
          width={21}
          height={21}
          className="opacity-80"
        />
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Built By{' '}
          <a
            href="https://www.myforgelabs.com/#kapcsolat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors underline"
          >
            MyForge Labs
          </a>
        </span>
      </div>
    </footer>
  );
}
