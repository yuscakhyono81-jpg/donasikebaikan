import { redirect } from "next/navigation";
import { Clock, CheckCircle2, Wallet, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AffiliateFeePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, organization_name, bank_name, account_number, account_holder")
    .eq("profile_id", user.id)
    .single();

  if (!affiliate) redirect("/register/affiliate");

  const { data: feePayments } = await supabase
    .from("affiliate_fee_payments")
    .select("id, period_start, period_end, total_donation, fee_amount, status, paid_at, notes, campaign_id, campaigns(title)")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false });

  const totalPending = (feePayments ?? [])
    .filter((f) => f.status === "pending")
    .reduce((s, f) => s + (f.fee_amount as number), 0);

  const totalPaid = (feePayments ?? [])
    .filter((f) => f.status === "paid")
    .reduce((s, f) => s + (f.fee_amount as number), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fee & Pembayaran</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Riwayat kalkulasi dan status pembayaran fee referral Anda
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Fee Tertunda</p>
            <p className="text-2xl font-bold text-slate-900">{formatRupiah(totalPending)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Diterima</p>
            <p className="text-2xl font-bold text-slate-900">{formatRupiah(totalPaid)}</p>
          </div>
        </div>
      </div>

      {/* Bank info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="w-5 h-5 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Rekening Penerima</h2>
        </div>
        {affiliate.bank_name && affiliate.account_number ? (
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Bank</p>
              <p className="font-medium text-slate-900">{affiliate.bank_name as string}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-0.5">No. Rekening</p>
              <p className="font-mono font-medium text-slate-900">{affiliate.account_number as string}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-0.5">Atas Nama</p>
              <p className="font-medium text-slate-900">{(affiliate.account_holder as string) ?? "-"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-orange-600">
            Data rekening belum dilengkapi. Hubungi admin untuk memperbarui info bank.
          </p>
        )}
      </div>

      {/* Fee history table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Riwayat Fee</h2>
        </div>

        {!feePayments || feePayments.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada kalkulasi fee</p>
            <p className="text-slate-400 text-xs mt-1">
              Fee dihitung oleh admin berdasarkan donasi yang masuk via referral Anda
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kampanye</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Periode</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Donasi</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fee</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {feePayments.map((fp) => {
                  const campaign = fp.campaigns as unknown as { title: string } | null;
                  return (
                    <tr key={fp.id as string} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-900 line-clamp-1">
                          {campaign?.title ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(fp.period_start as string, "d MMM")} – {formatDate(fp.period_end as string, "d MMM yyyy")}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-700">
                        {formatRupiah(fp.total_donation as number, true)}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-primary-600">
                        {formatRupiah(fp.fee_amount as number)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {fp.status === "paid" ? (
                          <Badge variant="green">Dibayar</Badge>
                        ) : (
                          <Badge variant="orange">Tertunda</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {fp.status === "paid" && fp.paid_at
                          ? `Dibayar ${formatDate(fp.paid_at as string)}`
                          : (fp.notes as string) ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
