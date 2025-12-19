export default function Footer() {
  return (
    <footer className="hidden md:block fixed bottom-0 left-0 right-0 py-1.5 text-center border-t border-white/20 dark:border-neutral-700/30 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md z-40">
      <span className="text-[10px] text-neutral-500/80 dark:text-neutral-400/80">
        Built By{' '}
        <a
          href="https://www.myforgelabs.com/#kapcsolat"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-600/80 dark:text-neutral-300/80 hover:text-neutral-800 dark:hover:text-white transition-colors underline"
        >
          MyForge Labs
        </a>
      </span>
    </footer>
  );
}
