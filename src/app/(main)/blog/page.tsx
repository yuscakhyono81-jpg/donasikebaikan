import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { getPosts } from "@/lib/wordpress";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata = {
  title: "Artikel & Berita — DonasiKebaikan",
  description: "Kabar terbaru, inspirasi kebaikan, dan laporan dampak dari LAZIS NUR.",
};

export default async function BlogPage() {
  const posts = await getPosts({ perPage: 12 });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Newspaper className="w-5 h-5 text-primary-600" />
          <h1 className="text-2xl font-bold text-slate-900">Artikel & Berita</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Kabar terbaru, inspirasi kebaikan, dan laporan dampak dari LAZIS NUR
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada artikel tersedia</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-primary-200 hover:shadow-md transition-all"
            >
              {post.featured_image_url ? (
                <div className="relative w-full h-44 overflow-hidden">
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="w-full h-44 bg-slate-100 flex items-center justify-center">
                  <Newspaper className="w-10 h-10 text-slate-300" />
                </div>
              )}
              <div className="p-4">
                <time className="text-xs text-slate-400 mb-1.5 block">
                  {formatDate(post.published_at)}
                </time>
                <h2 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors mb-2">
                  {post.title}
                </h2>
                <div
                  className="text-xs text-slate-500 line-clamp-3 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
