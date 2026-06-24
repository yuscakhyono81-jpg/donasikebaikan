"use client";

import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/utils";
import type { Donation } from "@/types";

interface ToastData {
  id: string;
  donorName: string;
  campaignTitle: string;
  amount: number;
}

export default function RealtimeDonationToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("donation-toast")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "donations",
          filter: "status=eq.success",
        },
        async (payload) => {
          const donation = payload.new as Donation;
          const { data: campaign } = await supabase
            .from("campaigns")
            .select("title")
            .eq("id", donation.campaign_id)
            .single();

          if (!campaign) return;

          const toast: ToastData = {
            id: donation.id,
            donorName: donation.is_anonymous ? "Hamba Allah" : donation.donor_name,
            campaignTitle: campaign.title,
            amount: donation.amount,
          };

          setToasts((prev) => [toast, ...prev].slice(0, 3));

          // Auto-dismiss after 6 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }, 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 space-y-2 lg:bottom-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3 max-w-xs animate-in slide-in-from-left-4 fade-in duration-300"
        >
          <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-primary-600 fill-primary-200" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {toast.donorName} berdonasi {formatRupiah(toast.amount, true)}
            </p>
            <p className="text-xs text-slate-500 truncate">{toast.campaignTitle}</p>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
