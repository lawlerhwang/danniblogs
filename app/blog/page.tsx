import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import { formatDate } from '@/lib/format';
import { PageLayout } from '@/app/components/page-layout';

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <PageLayout>
      <h1 className="text-4xl font-bold tracking-tight text-heading">
        Blog
      </h1>
      <p className="mt-4 text-lg text-subtitle">
        Thoughts on web development, technology, and more.
      </p>
      <div className="mt-12 space-y-8">
        {posts.length === 0 ? (
          <p className="text-subtitle">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <h2 className="text-xl font-semibold text-heading group-hover:text-subtitle transition-colors">
                  {post.title}
                </h2>
                {post.date && (
                  <time className="mt-1 block text-sm text-faded">
                    {formatDate(post.date)}
                  </time>
                )}
                {post.description && (
                  <p className="mt-2 text-subtitle">
                    {post.description}
                  </p>
                )}
              </Link>
            </article>
          ))
        )}
      </div>
    </PageLayout>
  );
}


