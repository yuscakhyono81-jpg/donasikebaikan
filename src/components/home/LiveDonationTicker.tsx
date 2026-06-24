"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
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
    <div className="bg-primary-600 py-2.5 overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-1.5 bg-primary-700 text-white text-xs font-bold px-3 py-1 z-10 mr-4 ml-4 rounded-full whitespace-nowrap">
          <Heart className="w-3 h-3 fill-white" />
          LIVE
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-scroll flex gap-8 whitespace-nowrap">
            {doubled.map((d, i) => (
              <span key={`${d.id}-${i}`} className="inline-flex items-center gap-1.5 text-white text-xs">
                <Heart className="w-3 h-3 fill-white shrink-0" />
                <span className="font-semibold">{d.is_anonymous ? "Hamba Allah" : d.donor_name}</span>
                <span className="text-primary-200">berdonasi</span>
                <span className="font-semibold text-secondary-300">{formatRupiah(d.amount, true)}</span>
                <span className="text-primary-200">untuk</span>
                <span className="font-medium max-w-[160px] truncate">{d.campaign_title}</span>
                <span className="text-primary-300">·</span>
                <span className="text-primary-300">{formatRelativeTime(d.created_at)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
