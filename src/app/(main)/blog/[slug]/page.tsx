import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { getPostBySlug, getPosts } from "@/lib/wordpress";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPosts({ perPage: 50 });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — DonasiKebaikan`,
    description: post.excerpt.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Kembali ke Artikel
      </Link>

      <article>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">
          {post.title}
        </h1>

        <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
          <Calendar size={14} />
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
        </div>

        {post.featured_image_url && (
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <div
          className="prose prose-slate prose-sm sm:prose max-w-none text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
