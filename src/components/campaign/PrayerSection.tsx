import { MessageCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { DonationPrayer } from "@/types";

interface PrayerSectionProps {
  prayers: DonationPrayer[];
}

export default function PrayerSection({ prayers }: PrayerSectionProps) {
  const visible = prayers.filter((p) => p.is_visible);

  return (
    <div>
      <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-primary-600" />
        Doa Donatur
        {visible.length > 0 && (
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
            {visible.length}
          </span>
        )}
      </h3>

      {visible.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-xl">
          Belum ada doa. Donasi dan tinggalkan doa Anda! 🤲
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.slice(0, 5).map((prayer) => (
            <li key={prayer.id} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                  {prayer.donor_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-slate-700">{prayer.donor_name}</p>
                    <time className="text-xs text-slate-400 shrink-0">
                      {formatRelativeTime(prayer.created_at)}
                    </time>
                  </div>
                  <p className="text-sm text-slate-600 italic">&ldquo;{prayer.message}&rdquo;</p>

                  {prayer.reply && (
                    <div className="mt-2 pl-3 border-l-2 border-primary-300">
                      <p className="text-xs font-semibold text-primary-600 mb-0.5">Tim LAZIS NUR:</p>
                      <p className="text-xs text-slate-500 italic">{prayer.reply}</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
