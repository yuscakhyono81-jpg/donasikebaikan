import { Users } from "lucide-react";
import { formatRupiah, formatRelativeTime } from "@/lib/utils";

interface DonorItem {
  id: string;
  donor_name: string;
  amount: number;
  message?: string;
  is_anonymous: boolean;
  created_at: string;
}

interface DonorListProps {
  donors: DonorItem[];
  totalDonors: number;
}

export default function DonorList({ donors, totalDonors }: DonorListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          Donatur Terbaru
        </h3>
        <span className="text-xs text-slate-500">{totalDonors.toLocaleString("id-ID")} total</span>
      </div>

      {donors.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          Jadilah yang pertama berdonasi! 🙏
        </p>
      ) : (
        <ul className="space-y-3">
          {donors.map((donor) => (
            <li key={donor.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
                {donor.is_anonymous ? "🤝" : donor.donor_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {donor.is_anonymous ? "Hamba Allah" : donor.donor_name}
                  </p>
                  <p className="text-sm font-semibold text-primary-600 shrink-0">
                    {formatRupiah(donor.amount, true)}
                  </p>
                </div>
                {donor.message && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 italic">
                    &ldquo;{donor.message}&rdquo;
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(donor.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
