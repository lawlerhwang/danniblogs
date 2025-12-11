export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Hey, I'm Jonathan
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Welcome to my personal website. I write about web development, 
          technology, and other things I find interesting.
        </p>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Check out my{" "}
          <a
            href="/blog"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            blog
          </a>{" "}
          to read my latest posts.
        </p>
      </div>
    </main>
  );
}
