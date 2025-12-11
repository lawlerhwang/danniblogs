import { notFound } from 'next/navigation';
import { getBlogPost, getBlogPosts } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { useMDXComponents } from '@/mdx-components';

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <Link
          href="/blog"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          ← Back to Blog
        </Link>
        
        <article className="mt-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            {post.title}
          </h1>
          
          {post.date && (
            <time className="mt-4 block text-sm text-zinc-500">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}

          <div className="prose prose-zinc mt-8 dark:prose-invert max-w-none">
            <MDXRemote source={post.content} components={useMDXComponents({})} />
          </div>
        </article>
      </div>
    </main>
  );
}

