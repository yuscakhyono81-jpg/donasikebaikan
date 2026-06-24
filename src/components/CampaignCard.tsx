import Link from "next/link";
import Image from "next/image";
import { Clock, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah, calculateProgress, getDaysRemaining } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import type { Campaign } from "@/types";

interface CampaignCardProps {
  campaign: Campaign;
  className?: string;
  variant?: "default" | "compact";
}

export default function CampaignCard({ campaign, className, variant = "default" }: CampaignCardProps) {
  const progress = calculateProgress(campaign.collected_amount, campaign.target_amount);
  const daysLeft = getDaysRemaining(campaign.deadline);
  const isUrgent = campaign.is_urgent || daysLeft <= 7;

  return (
    <Link
      href={`/campaign/${campaign.slug}`}
      className={cn(
        "group block bg-white rounded-2xl border border-slate-100 overflow-hidden",
        "hover:border-primary-200 hover:shadow-lg hover:shadow-primary-50 transition-all duration-200",
        className
      )}
    >
      {/* Cover Image */}
      <div className={cn("relative overflow-hidden bg-slate-100", variant === "compact" ? "h-40" : "h-48")}>
        {campaign.cover_image ? (
          <Image
            src={campaign.cover_image}
            alt={campaign.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-primary-400 text-4xl font-black opacity-30">DK</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {campaign.is_urgent && (
            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              <Zap className="w-2.5 h-2.5 fill-white" />
              MENDESAK
            </span>
          )}
          {campaign.is_featured && !campaign.is_urgent && (
            <span className="bg-secondary-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              PILIHAN
            </span>
          )}
        </div>

        {campaign.category && (
          <div className="absolute top-3 right-3">
            <Badge variant="green" size="sm">{campaign.category.name}</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className={cn(
          "font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors leading-snug",
          variant === "compact" ? "text-sm" : "text-base"
        )}>
          {campaign.title}
        </h3>

        {variant !== "compact" && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
            {campaign.short_description}
          </p>
        )}

        {/* Progress */}
        <div className="mb-3">
          <ProgressBar
            value={progress}
            size="sm"
            color={isUrgent ? "orange" : "green"}
            animated
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs font-semibold text-primary-600">
              {formatRupiah(campaign.collected_amount, true)}
            </span>
            <span className="text-xs text-slate-400">{progress}%</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{campaign.donor_count.toLocaleString("id-ID")} donatur</span>
          </div>
          <div className={cn(
            "flex items-center gap-1",
            daysLeft <= 3 && "text-red-500 font-medium"
          )}>
            <Clock className="w-3.5 h-3.5" />
            <span>
              {daysLeft === 0 ? "Berakhir hari ini" : `${daysLeft} hari lagi`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
