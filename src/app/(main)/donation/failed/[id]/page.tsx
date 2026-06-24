import { notFound } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Donasi Gagal" };

export default async function DonationFailedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: donation } = await supabase
    .from("donations")
    .select("id, amount, campaign_id, campaigns(title, slug)")
    .eq("id", id)
    .single();

  if (!donation) notFound();

  const campaign = donation.campaigns as unknown as { title: string; slug: string } | null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Donasi Gagal</h1>
        <p className="text-slate-500 mb-8">
          Pembayaran tidak berhasil diproses. Anda bisa mencoba lagi atau pilih metode pembayaran lain.
        </p>

        <div className="bg-slate-50 rounded-2xl p-5 mb-8">
          <p className="text-sm text-slate-500 mb-1">Jumlah donasi</p>
          <p className="text-2xl font-bold text-slate-900">{formatRupiah(donation.amount)}</p>
          {campaign && (
            <p className="text-sm text-slate-500 mt-1">untuk {campaign.title}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {campaign && (
            <Link
              href={`/campaign/${campaign.slug}`}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </Link>
          )}

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
