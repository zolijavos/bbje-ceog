export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-2 text-center border-t bg-white border-neutral-200 z-40">
      <span className="text-xs text-neutral-500">
        Built By{' '}
        <a
          href="https://www.myforgelabs.com/#kapcsolat"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-600 hover:text-neutral-900 transition-colors underline"
        >
          MyForge Labs
        </a>
      </span>
    </footer>
  );
}
