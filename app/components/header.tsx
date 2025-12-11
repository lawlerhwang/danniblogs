import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
      <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <Link 
          href="/" 
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          summersmuir
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/blog" 
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            Blog
          </Link>
        </div>
      </nav>
    </header>
  );
}

