"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, calculateProgress } from "@/lib/utils";
import type { Campaign } from "@/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("campaigns")
        .select("*, category:categories(name, slug)")
        .eq("status", "active")
        .ilike("title", `%${q}%`)
        .limit(6);
      setResults((data as Campaign[]) ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari campaign..."
            className="flex-1 text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
          ) : (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {results.map((campaign) => {
              const progress = calculateProgress(campaign.collected_amount, campaign.target_amount);
              return (
                <li key={campaign.id}>
                  <Link
                    href={`/campaign/${campaign.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      {campaign.cover_image && (
                        <Image
                          src={campaign.cover_image}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{campaign.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatRupiah(campaign.collected_amount, true)} · {progress}%
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {query && !isLoading && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            Tidak ada campaign untuk &ldquo;{query}&rdquo;
          </div>
        )}

        {!query && (
          <div className="px-4 py-5 text-center text-sm text-slate-400">
            Ketik untuk mencari campaign...
          </div>
        )}
      </div>
    </div>
  );
}
