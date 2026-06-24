import { redirect } from "next/navigation";
import { CheckCircle, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { markFeeAsPaid } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminAffiliateFeeePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: feePayments } = await supabase
    .from("affiliate_fee_payments")
    .select("id, period_start, period_end, total_donation, fee_amount, status, paid_at, notes, affiliates(organization_name, bank_name, account_number), campaigns(title)")
    .order("created_at", { ascending: false });

  const totalPending = (feePayments ?? [])
    .filter((f) => f.status === "pending")
    .reduce((s, f) => s + (f.fee_amount as number), 0);

  async function handleMarkPaid(formData: FormData) {
    "use server";
    await markFeeAsPaid(formData.get("id") as string);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Fee Affiliate</h1>
        <p className="text-slate-500 text-sm mt-0.5">Total fee tertunda: <span className="font-semibold text-orange-600">{formatRupiah(totalPending)}</span></p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {!feePayments?.length ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Belum ada entri fee</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Affiliate</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Campaign</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Periode</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Donasi</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fee</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {feePayments.map((fp) => {
                  const aff = fp.affiliates as unknown as { organization_name: string; bank_name?: string; account_number?: string } | null;
                  const camp = fp.campaigns as unknown as { title: string } | null;
                  return (
                    <tr key={fp.id as string} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{aff?.organization_name ?? "—"}</p>
                        {aff?.bank_name && (
                          <p className="text-xs text-slate-400">{aff.bank_name} · {aff.account_number}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-[150px]">
                        <span className="truncate block">{camp?.title ?? "—"}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(fp.period_start as string, "d MMM")} – {formatDate(fp.period_end as string, "d MMM yyyy")}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-700">{formatRupiah(fp.total_donation as number, true)}</td>
                      <td className="px-5 py-4 text-right font-bold text-primary-600">{formatRupiah(fp.fee_amount as number)}</td>
                      <td className="px-5 py-4 text-center">
                        {fp.status === "paid" ? (
                          <div>
                            <Badge variant="green">Dibayar</Badge>
                            {fp.paid_at && <p className="text-xs text-slate-400 mt-0.5">{formatDate(fp.paid_at as string, "d MMM yyyy")}</p>}
                          </div>
                        ) : (
                          <Badge variant="orange">Tertunda</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {fp.status === "pending" && (
                          <form action={handleMarkPaid}>
                            <input type="hidden" name="id" value={fp.id as string} />
                            <button
                              type="submit"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle size={13} />
                              Tandai Lunas
                            </button>
                          </form>
                        )}
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
