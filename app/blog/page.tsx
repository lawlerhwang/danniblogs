import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Blog
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Thoughts on web development, technology, and more.
        </p>
        <div className="mt-12 space-y-8">
          {posts.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-400">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <h2 className="text-xl font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300 transition-colors">
                    {post.title}
                  </h2>
                  {post.date && (
                    <time className="mt-1 block text-sm text-zinc-500 dark:text-zinc-500">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  {post.description && (
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                      {post.description}
                    </p>
                  )}
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}


