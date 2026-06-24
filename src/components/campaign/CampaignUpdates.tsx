import Image from "next/image";
import { Newspaper } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { CampaignUpdate } from "@/types";

interface CampaignUpdatesProps {
  updates: CampaignUpdate[];
}

export default function CampaignUpdates({ updates }: CampaignUpdatesProps) {
  if (updates.length === 0) return null;

  return (
    <div>
      <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-primary-600" />
        Kabar Terbaru
      </h3>

      <div className="space-y-4">
        {updates.map((update) => (
          <article
            key={update.id}
            className="border border-slate-100 rounded-xl p-4 hover:border-primary-100 transition-colors"
          >
            {update.image_url && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
                <Image
                  src={update.image_url}
                  alt={update.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h4 className="font-semibold text-slate-900 text-sm">{update.title}</h4>
              <time className="text-xs text-slate-400 shrink-0" dateTime={update.published_at}>
                {formatDate(update.published_at)}
              </time>
            </div>
            <div
              className="text-sm text-slate-600 leading-relaxed line-clamp-4 prose-sm"
              dangerouslySetInnerHTML={{ __html: update.content }}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
