import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  image?: string;
  content: string;
}

export function getBlogPosts(): Omit<BlogPost, 'content'>[] {
  // Check if directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((name) => name.endsWith('.mdx'))
    .map((fileName) => {
      const fileSlug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      // Use slug from frontmatter if available, otherwise use filename
      const slug = data.slug || fileSlug;

      return {
        slug,
        title: data.title || slug,
        subtitle: data.subtitle,
        date: data.date,
        description: data.description,
        image: data.image,
      };
    })
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return allPostsData;
}

export function getBlogPost(slug: string): BlogPost | null {
  // Check if directory exists
  if (!fs.existsSync(postsDirectory)) {
    return null;
  }

  // Find the file that matches the slug (either by filename or frontmatter slug)
  const fileNames = fs.readdirSync(postsDirectory);
  let targetFile: string | null = null;

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.mdx')) continue;
    
    const fileSlug = fileName.replace(/\.mdx$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    
    // Check if this file matches the requested slug
    const postSlug = data.slug || fileSlug;
    if (postSlug === slug) {
      targetFile = fileName;
      break;
    }
  }

  if (!targetFile) {
    return null;
  }

  const fullPath = path.join(postsDirectory, targetFile);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: data.slug || targetFile.replace(/\.mdx$/, ''),
    title: data.title || slug,
    subtitle: data.subtitle,
    date: data.date,
    description: data.description,
    image: data.image,
    content,
  };
}



