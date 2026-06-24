import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import ManualTransferForm from "@/components/donation/ManualTransferForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Selesaikan Pembayaran" };

const BANK_ACCOUNTS = [
  { bank: "BRI", number: "1234-5678-9012-3456", holder: "LAZIS NUR" },
  { bank: "BCA", number: "1234567890", holder: "LAZIS NUR" },
  { bank: "Mandiri", number: "1234-5678-9012", holder: "LAZIS NUR" },
];

export default async function DonationPendingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: donation } = await supabase
    .from("donations")
    .select("id, donor_name, donor_email, amount, status, payment_method, transaction_id, campaigns(title, slug)")
    .eq("id", id)
    .single();

  if (!donation) notFound();

  const campaign = donation.campaigns as unknown as { title: string; slug: string } | null;
  const isManualTransfer = donation.payment_method === "transfer_manual";

  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Menunggu Pembayaran</h1>
            <p className="text-sm text-slate-500">ID: {donation.transaction_id}</p>
          </div>
        </div>

        {/* Donation Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-500 text-sm">Campaign</span>
            <span className="font-semibold text-slate-900 text-sm text-right max-w-[200px]">
              {campaign?.title ?? "-"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">Total Donasi</span>
            <span className="text-xl font-bold text-primary-600">{formatRupiah(donation.amount)}</span>
          </div>
        </div>

        {isManualTransfer ? (
          <>
            {/* Bank Account Info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Transfer ke Rekening Berikut</h2>
              <div className="space-y-4">
                {BANK_ACCOUNTS.map((acc) => (
                  <div key={acc.bank} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                      {acc.bank}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-slate-900">{acc.number}</p>
                      <p className="text-xs text-slate-500">a.n. {acc.holder}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-800 font-medium">
                  Mohon transfer tepat <span className="font-bold">{formatRupiah(donation.amount)}</span> untuk mempercepat verifikasi.
                </p>
              </div>
            </div>

            {/* Upload Proof Form */}
            <ManualTransferForm donationId={donation.id} donorEmail={donation.donor_email} />
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
            <p className="text-slate-600">
              Pembayaran Anda sedang diproses. Halaman ini akan otomatis diperbarui saat pembayaran selesai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
