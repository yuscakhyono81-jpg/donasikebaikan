import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Download, Home, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Donasi Berhasil" };

export default async function DonationSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: donation } = await supabase
    .from("donations")
    .select("id, donor_name, donor_email, amount, campaign_id, status, payment_method, transaction_id, created_at, campaigns(title, slug)")
    .eq("id", id)
    .single();

  if (!donation) notFound();

  const campaign = donation.campaigns as unknown as { title: string; slug: string } | null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Jazakallah Khairan!</h1>
        <p className="text-slate-500 mb-8">Donasi Anda telah diterima dan sedang diproses.</p>

        <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Nama Donatur</span>
            <span className="font-semibold text-slate-900">{donation.donor_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Campaign</span>
            <span className="font-semibold text-slate-900 text-right max-w-[180px]">{campaign?.title ?? "-"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Jumlah</span>
            <span className="font-bold text-primary-600 text-base">{formatRupiah(donation.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Metode</span>
            <span className="font-semibold text-slate-900">
              {donation.payment_method === "midtrans" ? "Transfer / QRIS" : "Transfer Manual"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">ID Transaksi</span>
            <span className="font-mono text-xs text-slate-700">{donation.transaction_id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tanggal</span>
            <span className="font-semibold text-slate-900">{formatDate(donation.created_at)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={`/api/donations/certificate/${donation.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Unduh Bukti Terima Donasi
          </a>

          {campaign && (
            <Link
              href={`/campaign/${campaign.slug}`}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-primary-200 text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Bagikan Campaign
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

        <p className="mt-6 text-xs text-slate-400">
          Bukti donasi telah dikirim ke {donation.donor_email}
        </p>
      </div>
    </div>
  );
}
