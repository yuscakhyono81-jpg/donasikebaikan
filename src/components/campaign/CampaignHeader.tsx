import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { CampaignStatusBadge } from "@/components/ui/Badge";
import type { Campaign } from "@/types";

interface CampaignHeaderProps {
  campaign: Campaign;
}

export default function CampaignHeader({ campaign }: CampaignHeaderProps) {
  return (
    <div>
      {/* Cover Image */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-6">
        {campaign.cover_image ? (
          <Image
            src={campaign.cover_image}
            alt={campaign.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-primary-400 text-6xl font-black opacity-30">DK</span>
          </div>
        )}

        {campaign.is_urgent && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            CAMPAIGN MENDESAK
          </div>
        )}
      </div>

      {/* Title & Meta */}
      <div className="flex flex-wrap gap-2 mb-3">
        {campaign.category && (
          <Badge variant="green">{campaign.category.name}</Badge>
        )}
        <CampaignStatusBadge status={campaign.status} />
        {campaign.is_featured && (
          <Badge variant="orange">Pilihan</Badge>
        )}
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">
        {campaign.title}
      </h1>

      <p className="text-slate-600 leading-relaxed">{campaign.short_description}</p>
    </div>
  );
}
