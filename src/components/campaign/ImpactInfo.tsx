import { Sparkles } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { CampaignCategory } from "@/types";

interface ImpactInfoProps {
  category?: CampaignCategory;
  targetAmount: number;
  collectedAmount: number;
}

const IMPACT_EXAMPLES: Partial<Record<CampaignCategory, { amount: number; impact: string }[]>> = {
  pendidikan: [
    { amount: 50_000, impact: "1 paket alat tulis untuk 1 anak" },
    { amount: 250_000, impact: "1 bulan beasiswa untuk 1 anak" },
    { amount: 1_000_000, impact: "1 semester buku pelajaran" },
  ],
  kesehatan: [
    { amount: 50_000, impact: "Obat-obatan dasar untuk 1 keluarga" },
    { amount: 200_000, impact: "Pemeriksaan kesehatan untuk 1 orang" },
    { amount: 500_000, impact: "Bantuan biaya rawat jalan" },
  ],
  yatim_dhuafa: [
    { amount: 100_000, impact: "Sembako untuk 1 keluarga" },
    { amount: 300_000, impact: "Santunan bulanan 1 anak yatim" },
    { amount: 1_000_000, impact: "Paket pendidikan lengkap" },
  ],
  qurban: [
    { amount: 250_000, impact: "Patungan hewan qurban" },
    { amount: 2_500_000, impact: "1 kambing untuk qurban" },
  ],
};

export default function ImpactInfo({ category, targetAmount, collectedAmount }: ImpactInfoProps) {
  const examples = category ? IMPACT_EXAMPLES[category] : null;

  return (
    <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
      <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-600" />
        Dampak Donasi Anda
      </h3>

      {examples && examples.length > 0 ? (
        <ul className="space-y-2.5">
          {examples.map((ex) => (
            <li key={ex.amount} className="flex items-start gap-3 text-sm">
              <span className="shrink-0 bg-white text-primary-700 font-semibold px-2.5 py-1 rounded-lg border border-primary-200 text-xs">
                {formatRupiah(ex.amount, true)}
              </span>
              <span className="text-slate-700 pt-1">= {ex.impact}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          Dana yang terkumpul akan digunakan sepenuhnya untuk membantu penerima manfaat program ini
          secara langsung dan transparan.
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-primary-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Sudah terkumpul:</span>
          <span className="font-semibold text-primary-600">{formatRupiah(collectedAmount, true)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
          <span>Target:</span>
          <span className="font-semibold">{formatRupiah(targetAmount, true)}</span>
        </div>
      </div>
    </div>
  );
}
