import { Clock, Users, Target } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatRupiah, calculateProgress, getDaysRemaining, formatDate } from "@/lib/utils";
import type { Campaign } from "@/types";

interface DonationProgressProps {
  campaign: Campaign;
}

export default function DonationProgress({ campaign }: DonationProgressProps) {
  const progress = calculateProgress(campaign.collected_amount, campaign.target_amount);
  const daysLeft = getDaysRemaining(campaign.deadline);
  const isUrgent = campaign.is_urgent || daysLeft <= 7;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
      {/* Collected */}
      <div>
        <p className="text-sm text-slate-500 mb-0.5">Terkumpul</p>
        <p className="text-2xl font-extrabold text-primary-600">
          {formatRupiah(campaign.collected_amount)}
        </p>
        <p className="text-xs text-slate-400">
          dari target {formatRupiah(campaign.target_amount)}
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
          <p className="text-sm font-bold text-slate-900">{formatRupiah(campaign.target_amount, true)}</p>
          <p className="text-xs text-slate-500">Target</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-blue-500 mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-slate-900">{campaign.donor_count.toLocaleString("id-ID")}</p>
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
        Berakhir pada {formatDate(campaign.deadline)}
      </p>
    </div>
  );
}
