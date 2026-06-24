import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ZakatCalculator from "@/components/ZakatCalculator";
import CampaignCard from "@/components/CampaignCard";
import type { Campaign } from "@/types";

export const metadata: Metadata = {
  title: "Kalkulator Zakat",
  description:
    "Hitung kewajiban zakat maal, zakat penghasilan, dan zakat emas/perak Anda secara mudah dan akurat.",
};

export default async function KalkulatorZakatPage() {
  const supabase = await createClient();

  const { data: zakatCampaigns } = await supabase
    .from("campaigns")
    .select("*, category:categories(*)")
    .eq("status", "active")
    .eq("categories.slug", "zakat")
    .not("category", "is", null)
    .order("is_featured", { ascending: false })
    .limit(3);

  const campaigns = (zakatCampaigns as Campaign[]) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Kalkulator Zakat</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Hitung kewajiban zakat Anda dengan mudah. Pilih jenis zakat yang ingin dihitung, masukkan data, dan
          tunaikan segera melalui campaign aktif kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Calculator */}
        <div className="lg:col-span-3">
          <ZakatCalculator />
        </div>

        {/* Sidebar — Zakat FAQ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5">
            <h3 className="font-bold text-primary-800 mb-3 text-sm">Dasar Hukum Zakat</h3>
            <ul className="space-y-2 text-xs text-primary-700">
              <li className="flex gap-2">
                <span className="shrink-0 font-bold">QS 9:103</span>
                <span>"Ambillah zakat dari sebagian harta mereka..."</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-bold">HR Bukhari</span>
                <span>Zakat adalah salah satu dari 5 rukun Islam</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Pertanyaan Umum</h3>

            <FaqItem
              q="Apa itu haul?"
              a="Haul adalah syarat zakat maal: harta sudah dimiliki selama satu tahun penuh (354 hari lunar)."
            />
            <FaqItem
              q="Apa itu nisab?"
              a="Nisab adalah batas minimum harta yang mewajibkan zakat — setara 85 gram emas (~Rp 93,5 juta)."
            />
            <FaqItem
              q="Bolehkah zakat profesi dibayar bulanan?"
              a="Ya. Ulama membolehkan pembayaran zakat profesi setiap bulan saat gaji diterima untuk kemudahan."
            />
            <FaqItem
              q="Apa bedanya zakat, infaq, sedekah?"
              a="Zakat wajib & ada nisab/haul-nya. Infaq & sedekah sunnah, tidak ada batas minimum."
            />
          </div>
        </div>
      </div>

      {/* Active Zakat Campaigns */}
      {campaigns.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Campaign Zakat Aktif</h2>
              <p className="text-sm text-slate-500 mt-0.5">Salurkan zakat Anda melalui program berikut</p>
            </div>
            <Link
              href="/campaign?category=zakat"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
            >
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-slate-700 hover:text-primary-600 list-none">
        {q}
        <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <p className="mt-1.5 text-xs text-slate-500 pl-0">{a}</p>
    </details>
  );
}
