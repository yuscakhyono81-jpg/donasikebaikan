"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  zakat: "🌙",
  infaq: "💚",
  qurban: "🐑",
  pendidikan: "📚",
  kesehatan: "🏥",
  kemanusiaan: "🤝",
  dakwah: "📖",
  yatim_dhuafa: "🏠",
  pemberdayaan: "💪",
};

interface CategoryFilterProps {
  categories: Category[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  const handleSelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategory === slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("category");
            router.push(`/?${params.toString()}`, { scroll: false });
          }}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 shrink-0 border",
            activeCategory === ""
              ? "bg-primary-600 text-white border-primary-600 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:border-primary-200 hover:text-primary-700"
          )}
        >
          Semua
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.slug)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 shrink-0 border",
              activeCategory === cat.slug
                ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-primary-200 hover:text-primary-700"
            )}
          >
            <span>{CATEGORY_ICONS[cat.slug] ?? "📌"}</span>
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
