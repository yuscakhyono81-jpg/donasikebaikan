"use client";

import { useState, useCallback } from "react";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import CampaignCard from "@/components/CampaignCard";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { Campaign } from "@/types";

type SortOption = "newest" | "popular" | "ending_soon" | "most_collected";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Terbaru",
  popular: "Terpopuler",
  ending_soon: "Segera Berakhir",
  most_collected: "Terkumpul Terbanyak",
};

interface AllCampaignsProps {
  initialCampaigns: Campaign[];
  categorySlug?: string;
  initialTotal: number;
}

export default function AllCampaigns({ initialCampaigns, categorySlug, initialTotal }: AllCampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [sort, setSort] = useState<SortOption>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCampaigns.length < initialTotal);
  const PAGE_SIZE = 9;

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("campaigns")
        .select("*, category:categories(*)")
        .eq("status", "active")
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (categorySlug) {
        query = query.eq("categories.slug", categorySlug);
      }

      switch (sort) {
        case "popular":
          query = query.order("donor_count", { ascending: false });
          break;
        case "ending_soon":
          query = query.order("deadline", { ascending: true });
          break;
        case "most_collected":
          query = query.order("collected_amount", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data } = await query;
      if (data) {
        setCampaigns((prev) => [...prev, ...(data as Campaign[])]);
        setHasMore(data.length === PAGE_SIZE);
        setPage((p) => p + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, sort, categorySlug]);

  return (
    <section>
      {/* Header + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Semua Campaign</h2>
          <p className="text-xs text-slate-500">{initialTotal} campaign aktif</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white outline-none focus:ring-1 focus:ring-primary-500"
            >
              {Object.entries(SORT_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 transition-colors ${view === "grid" ? "bg-primary-600 text-white" : "text-slate-400 hover:text-slate-600"}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 transition-colors ${view === "list" ? "bg-primary-600 text-white" : "text-slate-400 hover:text-slate-600"}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Grid/List */}
      {campaigns.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl">
          <p className="text-lg font-medium mb-1">Belum ada campaign</p>
          <p className="text-sm">Campaign aktif akan muncul di sini.</p>
        </div>
      ) : (
        <div className={
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "flex flex-col gap-3"
        }>
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              variant={view === "list" ? "compact" : "default"}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={loadMore}
            loading={isLoading}
          >
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </section>
  );
}
