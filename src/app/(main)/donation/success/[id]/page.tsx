import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Download, Home, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Donasi Berhasil" };
export const dynamic = "force-dynamic";

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
  const isVerified = donation.status === "success";
  const isPending = donation.status === "pending";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isVerified ? "bg-green-100" : "bg-amber-100"}`}>
          {isVerified
            ? <CheckCircle2 className="w-10 h-10 text-green-600" />
            : <Clock className="w-10 h-10 text-amber-600" />
          }
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isVerified ? "Jazakallah Khairan!" : "Bukti Transfer Diterima!"}
        </h1>
        <p className="text-slate-500 mb-8">
          {isVerified
            ? "Donasi Anda telah diverifikasi dan diterima."
            : "Tim kami akan memverifikasi transfer Anda dalam 1×24 jam kerja."}
        </p>

        {/* Status pending — info box */}
        {isPending && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
            <p className="text-sm font-semibold text-amber-800 mb-1">Menunggu Verifikasi Admin</p>
            <p className="text-xs text-amber-700">
              Setelah tim Lazisnur memverifikasi transfer Anda, status donasi akan berubah dan
              Anda bisa mengunduh Bukti Terima Donasi dari halaman ini.
            </p>
          </div>
        )}

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
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
              isVerified
                ? "bg-green-100 text-green-700"
                : donation.status === "failed"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {isVerified ? "Terverifikasi" : donation.status === "failed" ? "Ditolak" : "Menunggu Verifikasi"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {/* Tombol unduh bukti donasi — selalu tampil */}
          <a
            href={`/api/donations/receipt/${donation.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Unduh Bukti Donasi
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

        {donation.donor_email && (
          <p className="mt-6 text-xs text-slate-400">
            Konfirmasi akan dikirim ke {donation.donor_email}
          </p>
        )}
      </div>
    </div>
  );
}
