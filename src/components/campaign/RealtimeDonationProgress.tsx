"use client";

import { useEffect, useState } from "react";
import { Clock, Users, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatRupiah, calculateProgress, getDaysRemaining, formatDate } from "@/lib/utils";
import type { Campaign } from "@/types";

interface RealtimeDonationProgressProps {
  campaign: Campaign;
}

export default function RealtimeDonationProgress({ campaign: initial }: RealtimeDonationProgressProps) {
  const [collected, setCollected] = useState(initial.collected_amount);
  const [donorCount, setDonorCount] = useState(initial.donor_count);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to campaign row updates (triggered by donation insert trigger in DB)
    const channel = supabase
      .channel(`campaign-progress-${initial.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "campaigns",
          filter: `id=eq.${initial.id}`,
        },
        (payload) => {
          const updated = payload.new as { collected_amount: number; donor_count: number };
          setCollected(updated.collected_amount);
          setDonorCount(updated.donor_count);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initial.id]);

  const progress = calculateProgress(collected, initial.target_amount);
  const daysLeft = getDaysRemaining(initial.deadline);
  const isUrgent = initial.is_urgent || daysLeft <= 7;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
      {/* Collected */}
      <div>
        <p className="text-sm text-slate-500 mb-0.5">Terkumpul</p>
        <p className="text-2xl font-extrabold text-primary-600 transition-all duration-500">
          {formatRupiah(collected)}
        </p>
        <p className="text-xs text-slate-400">
          dari target {formatRupiah(initial.target_amount)}
        </p>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        value={progress}
        size="lg"
        color={isUrgent ? "orange" : "green"}
        showLabel
        animated
      />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="text-center">
          <div className="flex items-center justify-center text-primary-500 mb-1">
            <Target className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-slate-900">{formatRupiah(initial.target_amount, true)}</p>
          <p className="text-xs text-slate-500">Target</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-blue-500 mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-slate-900">{donorCount.toLocaleString("id-ID")}</p>
          <p className="text-xs text-slate-500">Donatur</p>
        </div>
        <div className="text-center">
          <div className={`flex items-center justify-center mb-1 ${daysLeft <= 3 ? "text-red-500" : "text-slate-500"}`}>
            <Clock className="w-4 h-4" />
          </div>
          <p className={`text-sm font-bold ${daysLeft <= 3 ? "text-red-600" : "text-slate-900"}`}>
            {daysLeft === 0 ? "Hari ini" : `${daysLeft} hari`}
          </p>
          <p className="text-xs text-slate-500">Tersisa</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center border-t border-slate-50 pt-3">
        Berakhir pada {formatDate(initial.deadline)}
      </p>
    </div>
  );
}
