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
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      <button
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("category");
          router.push(`/?${params.toString()}`, { scroll: false });
        }}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0",
          activeCategory === ""
            ? "bg-primary-600 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        )}
      >
        Semua
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.slug)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0",
            activeCategory === cat.slug
              ? "bg-primary-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <span>{CATEGORY_ICONS[cat.slug] ?? "📌"}</span>
          {cat.name}
        </button>
      ))}
    </div>
  );
}
