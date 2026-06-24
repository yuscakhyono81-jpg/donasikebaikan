import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import CampaignCard from "@/components/CampaignCard";
import type { Campaign } from "@/types";

interface UrgentCampaignsProps {
  campaigns: Campaign[];
}

export default function UrgentCampaigns({ campaigns }: UrgentCampaignsProps) {
  if (campaigns.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm shadow-red-200">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-none mb-0.5">
              Campaign Mendesak
            </h2>
            <p className="text-xs text-slate-500">Segera berdonasi, waktu terbatas</p>
          </div>
          <span className="ml-1 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full animate-pulse">
            {campaigns.length} aktif
          </span>
        </div>
        <Link
          href="/campaign?filter=urgent"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 shrink-0"
        >
          Lihat Semua <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </section>
  );
}
