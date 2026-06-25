"use client";

import { useEffect, useState } from "react";
import { Heart, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, formatRelativeTime } from "@/lib/utils";
import type { Donation } from "@/types";

interface TickerDonation {
  id: string;
  donor_name: string;
  amount: number;
  campaign_title: string;
  created_at: string;
  is_anonymous: boolean;
}

interface LiveDonationTickerProps {
  initialDonations: TickerDonation[];
}

export default function LiveDonationTicker({ initialDonations }: LiveDonationTickerProps) {
  const [donations, setDonations] = useState<TickerDonation[]>(initialDonations);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("donations-ticker")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "donations",
          filter: "status=eq.success",
        },
        async (payload) => {
          const newDonation = payload.new as Donation;
          const { data: campaign } = await supabase
            .from("campaigns")
            .select("title")
            .eq("id", newDonation.campaign_id)
            .single();

          if (campaign) {
            setDonations((prev) => [
              {
                id: newDonation.id,
                donor_name: newDonation.is_anonymous ? "Hamba Allah" : newDonation.donor_name,
                amount: newDonation.amount,
                campaign_title: campaign.title,
                created_at: newDonation.created_at,
                is_anonymous: newDonation.is_anonymous,
              },
              ...prev.slice(0, 19),
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (donations.length === 0) return null;

  const doubled = [...donations, ...donations];

  return (
    <div className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 py-3 overflow-hidden border-y border-primary-700/50">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-transparent to-primary-900 pointer-events-none z-10" />

      <div className="flex items-center">
        {/* Live badge */}
        <div className="shrink-0 flex items-center gap-1.5 z-20 mx-4">
          <div className="flex items-center gap-1.5 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-md tracking-wider shadow-lg shadow-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            LIVE
          </div>
          <Zap className="w-4 h-4 text-primary-300 hidden sm:block" />
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-scroll flex gap-10 whitespace-nowrap">
            {doubled.map((d, i) => (
              <span
                key={`${d.id}-${i}`}
                className="inline-flex items-center gap-2 text-sm"
              >
                <span className="w-6 h-6 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
                  <Heart className="w-3 h-3 fill-primary-300 text-primary-300" />
                </span>
                <span className="font-semibold text-white">
                  {d.is_anonymous ? "Hamba Allah" : d.donor_name}
                </span>
                <span className="text-primary-300 text-xs">berdonasi</span>
                <span className="font-bold text-secondary-300 bg-secondary-900/30 px-2 py-0.5 rounded-md text-xs">
                  {formatRupiah(d.amount, true)}
                </span>
                <span className="text-primary-300 text-xs">untuk</span>
                <span className="text-white font-medium max-w-[180px] truncate text-xs">
                  {d.campaign_title}
                </span>
                <span className="text-primary-500 text-xs">·</span>
                <span className="text-primary-400 text-xs">{formatRelativeTime(d.created_at)}</span>
                <span className="text-primary-700 mx-2">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
