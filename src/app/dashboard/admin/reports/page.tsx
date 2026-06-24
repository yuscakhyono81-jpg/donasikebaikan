import { redirect } from "next/navigation";
import { FileBarChart2, Download, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate, calculateProgress } from "@/lib/utils";
import { ReportFilters } from "./ReportFilters";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ date_from?: string; date_to?: string }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { date_from: dateFrom = "", date_to: dateTo = "" } = await searchParams;

  // Build date filter predicate
  const applyDateFilter = <T extends object>(query: T): T => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = query as any;
    if (dateFrom) q = q.gte("created_at", dateFrom);
    if (dateTo) q = q.lte("created_at", dateTo + "T23:59:59");
    return q;
  };

  const [
    { data: campaigns },
    { data: donations },
    { data: affiliateStats },
  ] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id, title, status, collected_amount, target_amount, donor_count, categories(name)"),
    applyDateFilter(
      supabase
        .from("donations")
        .select("amount, status, payment_method, created_at")
        .eq("status", "success")
    ),
    supabase
      .from("affiliate_fee_payments")
      .select("fee_amount, status, affiliates(organization_name)"),
  ]);

  const totalRevenue = (donations ?? []).reduce((s, d) => s + (d.amount as number), 0);
  const donationsByMethod: Record<string, number> = {};
  for (const d of donations ?? []) {
    const m = d.payment_method as string;
    donationsByMethod[m] = (donationsByMethod[m] ?? 0) + (d.amount as number);
  }

  const totalFeesPaid = (affiliateStats ?? [])
    .filter((a) => a.status === "paid")
    .reduce((s, a) => s + (a.fee_amount as number), 0);
  const totalFeesPending = (affiliateStats ?? [])
    .filter((a) => a.status === "pending")
    .reduce((s, a) => s + (a.fee_amount as number), 0);

  // Build export URL with active date filters
  const exportParams = new URLSearchParams();
  if (dateFrom) exportParams.set("date_from", dateFrom);
  if (dateTo) exportParams.set("date_to", dateTo);
  const exportQuery = exportParams.toString() ? `?${exportParams.toString()}` : "";

  const isFiltered = Boolean(dateFrom || dateTo);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Rekapitulasi data platform DonasiKebaikan
            {isFiltered && (
              <span className="ml-2 text-primary-600 font-medium">
                ({dateFrom ? formatDate(dateFrom) : "awal"} – {dateTo ? formatDate(dateTo) : "sekarang"})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/reports/campaigns${exportQuery}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Download size={15} />
            Campaign
          </a>
          <a
            href={`/api/reports/categories${exportQuery}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Download size={15} />
            Kategori
          </a>
          <a
            href={`/api/reports/affiliates${exportQuery}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Download size={15} />
            Afiliasi
          </a>
          <a
            href={`/api/reports/donors${exportQuery}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 border border-primary-200 px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <FileSpreadsheet size={15} />
            Donatur
          </a>
        </div>
      </div>

      {/* Date filter */}
      <ReportFilters dateFrom={dateFrom} dateTo={dateTo} />

      {/* Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Donasi Masuk",
            value: formatRupiah(totalRevenue),
            sub: `${donations?.length ?? 0} transaksi sukses`,
          },
          {
            label: "Via Midtrans",
            value: formatRupiah(donationsByMethod.midtrans ?? 0, true),
            sub: "pembayaran digital",
          },
          {
            label: "Via Transfer Manual",
            value: formatRupiah(donationsByMethod.transfer_manual ?? 0, true),
            sub: "transfer bank",
          },
          {
            label: "Fee Affiliate",
            value: formatRupiah(totalFeesPaid, true),
            sub: `+${formatRupiah(totalFeesPending, true)} tertunda`,
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{s.label}</p>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Campaigns table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <FileBarChart2 size={16} className="text-slate-400" />
          <h2 className="font-semibold text-slate-900">Rekapitulasi Per Campaign</h2>
          <span className="ml-auto text-xs text-slate-400">{campaigns?.length ?? 0} campaign</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kategori</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Terkumpul</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Target</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Donatur</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(campaigns ?? []).map((c) => {
                const cat = c.categories as unknown as { name: string } | null;
                const pct = calculateProgress(c.collected_amount as number, c.target_amount as number);
                const statusLabel: Record<string, string> = {
                  active: "Aktif",
                  completed: "Selesai",
                  draft: "Draft",
                  rejected: "Ditolak",
                };
                return (
                  <tr key={c.id as string} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900 max-w-[200px]">
                      <span className="truncate block">{c.title as string}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{cat?.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        c.status === "active" ? "bg-green-100 text-green-700" :
                        c.status === "completed" ? "bg-blue-100 text-blue-700" :
                        c.status === "draft" ? "bg-slate-100 text-slate-600" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {statusLabel[c.status as string] ?? c.status as string}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-primary-600">
                      {formatRupiah(c.collected_amount as number, true)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600">
                      {formatRupiah(c.target_amount as number, true)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700">{c.donor_count as number}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-semibold ${pct >= 100 ? "text-green-600" : pct >= 50 ? "text-primary-600" : "text-slate-500"}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
