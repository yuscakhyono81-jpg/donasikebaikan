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
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Campaign Mendesak</h2>
            <p className="text-xs text-slate-500">Segera berdonasi, waktu terbatas</p>
          </div>
        </div>
        <Link
          href="/campaign?filter=urgent"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
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
